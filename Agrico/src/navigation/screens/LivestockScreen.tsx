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
import { AuthContext } from "../AuthContext";
import { getLivestock,createLivestock, updateLivestock, deleteLivestock } from "../../api/ApiFunctions";
import { getFarms } from "../../api/ApiFunctions";

const LivestockScreen = () => {
    const [livestocklist, setLivestocklist] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [qty, setQty] = useState(0);
    const [date,setDate] = useState("")
    const [healthStatus, setHealthStatus] = useState("")

    const [editItem, setEditItem] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editQty, setEditQty] = useState("");

    const [farmId, setFarmId] = useState<number | null>(null);
    const { logout } = useContext(AuthContext);
    const navigation = useNavigation();


    const fetchFarmAndLivestock = async () => {
        setLoading(true);
        try {
            const farms = await getFarms();
            if (farms.length === 0) {
                setLoading(false);
                navigation.navigate("AddFarm"); // Auto-redirect
                return;
            }

            const firstFarmId = farms[0].farm_id;
            setFarmId(firstFarmId);

            const liveStock = await getLivestock();
            const farmLivestock = liveStock.filter(l => l.farm_id === firstFarmId);
            setLivestocklist(farmLivestock);
        } catch (err: any) {
            console.error("Fetch Farm/Crops Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch crops or farms.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmAndLivestock();
    }, []);

    // Add new crop
    const handleAdd = async () => {
        if (!farmId) {
            Alert.alert("Error", "You must have a farm to add crops.");
            return;
        }

        const quantityNum = Number(qty);
        if (!name || !qty) {
            Alert.alert("Error", "Please enter livestock name and quantity");
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert("Error", "Quantity must be a positive number");
            return;
        }

        try {
            const res = await createLivestock({
                farm_id: farmId,
                animal_type: name,
                quantity: quantityNum,
                purchase_date: date,
                health_status: healthStatus,
            });


            setLivestocklist([...livestocklist, { id: res.id, farm_id: farmId, animal_type: name, quantity:quantityNum  }]);
            setName("");
            setQty(0);
        } catch (err: any) {
            console.error("Add Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to add crop.");
        }
    };

    // Edit crop
    const handleEdit = async () => {
        if (!editItem) return;
        const quantityNum = Number(editQty);
        if (!editName || !editQty) {
            Alert.alert("Error", "Please enter crop name and quantity");
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert("Error", "Quantity must be a positive number");
            return;
        }

        try {
            await updateLivestock(editItem.id, { animal_type: editName, quantity: quantity });
            setLivestocklist(livestocklist.map(l => l.id === editItem.id ? { ...l, animal_type: editName,  quantity: quantityNum } : c));
            setEditItem(null);
        } catch (err: any) {
            console.error("Edit Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to update livestock.");
        }
    };

    // Delete crop
    const handleDelete = async (id: number) => {
        try {
            await deleteLivestock(id);
            setLivestocklist(livestocklist.filter(l => l.id !== id));
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
            </View>
            {loading && <ActivityIndicator size="large" color="#007bff" />}

            <TextInput placeholder="Livestock name" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Quantity" keyboardType="numeric" style={styles.input} value={qty} onChangeText={setQty} />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Livestock</Text>
            </TouchableOpacity>

            <FlatList
                data={livestocklist}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>{item.animal_type} - {item.quantity}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setEditItem(item); setEditName(item.animal_type); setEditQty(item.quantity); }}>
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
                        <Text style={styles.modalTitle}>Edit Crop</Text>
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


