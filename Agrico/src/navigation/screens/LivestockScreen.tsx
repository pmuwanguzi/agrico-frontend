import React, { useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Alert
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {AuthContext} from "../AuthContext";
import { getLivestock, createLivestock, updateLivestock, deleteLivestock } from "../../api/ApiFunctions";

const farm_id = 1; // Replace with dynamic farm ID if needed

const LivestockScreen = () => {
    const [livestockList, setLivestockList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");

    const [editItem, setEditItem] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editQty, setEditQty] = useState("");

    const { logout } = useContext(AuthContext);
    const navigation = useNavigation();

    // Fetch livestock
    const fetchLivestock = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");
            const data = await getLivestock(farm_id, token);
            setLivestockList(data);
        } catch (err: any) {
            console.error("Fetch Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch livestock.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLivestock(); }, []);

    // Add new livestock
    const handleAdd = async () => {
        const quantityNum = Number(qty);
        if (!name || !qty) {
            Alert.alert("Error", "Please enter animal name and quantity");
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert("Error", "Quantity must be a positive number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");
            const res = await createLivestock({
                farm_id,
                animal_type: name,
                quantity: quantityNum,
                purchase_date: new Date().toISOString(),
                health_status: "healthy"
            }, token);
            setLivestockList([...livestockList, { id: res.id, animal_type: name, quantity: quantityNum }]);
            setName("");
            setQty("");
        } catch (err: any) {
            console.error("Add Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to add livestock.");
        }
    };

    // Edit livestock
    const handleEdit = async () => {
        if (!editItem) return;
        const quantityNum = Number(editQty);
        if (!editName || !editQty) {
            Alert.alert("Error", "Please enter animal name and quantity");
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert("Error", "Quantity must be a positive number");
            return;
        }

        try {
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");
            await updateLivestock(editItem.id, { animal_type: editName, quantity: quantityNum }, token);
            setLivestockList(livestockList.map(l => l.id === editItem.id ? { ...l, animal_type: editName, quantity: quantityNum } : l));
            setEditItem(null);
        } catch (err: any) {
            console.error("Edit Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to update livestock.");
        }
    };

    // Delete livestock
    const handleDelete = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");
            await deleteLivestock(id, token);
            setLivestockList(livestockList.filter(l => l.id !== id));
        } catch (err: any) {
            console.error("Delete Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete livestock.");
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                    <Text style={{ color: "#007bff", fontWeight: "600" }}>Back to Dashboard</Text>
                </TouchableOpacity>
                {/*<TouchableOpacity onPress={logout}>*/}
                {/*    <Text style={{ color: "red", fontWeight: "600" }}>Logout</Text>*/}
                {/*</TouchableOpacity>*/}
            </View>

            {loading && <ActivityIndicator size="large" color="#007bff" />}

            <TextInput placeholder="Animal Name" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Quantity" keyboardType="numeric" style={styles.input} value={qty} onChangeText={setQty} />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Livestock</Text>
            </TouchableOpacity>

            <FlatList
                data={livestockList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>{item.animal_type} - {item.quantity}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setEditItem(item); setEditName(item.animal_type); setEditQty(item.quantity.toString()); }}>
                                <Text style={styles.editBtn}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={styles.deleteBtn}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Modal visible={!!editItem} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Livestock</Text>
                        <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                        <TextInput style={styles.input} keyboardType="numeric" value={String(editQty)} onChangeText={setEditQty} />
                        <TouchableOpacity style={styles.button} onPress={handleEdit}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setEditItem(null)}>
                            <Text style={{ color: "red", marginTop: 10, textAlign: "center" }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default LivestockScreen;

const styles = StyleSheet.create({
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15 },
    button: { backgroundColor: "#007bff", padding: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    listItem: { padding: 15, backgroundColor: "#f8f8f8", borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
    editBtn: { color: "blue", marginRight: 15 },
    deleteBtn: { color: "red" },
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
    modalBox: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 15 },
});
