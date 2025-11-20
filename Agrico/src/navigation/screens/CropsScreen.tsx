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
import { getCrops, createCrop, updateCrop, deleteCrop } from "../../api/ApiFunctions";
import { getFarms } from "../../api/ApiFunctions";

const CropsScreen = () => {
    const [cropList, setCropList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [qty, setQty] = useState("");

    const [editItem, setEditItem] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editQty, setEditQty] = useState("");

    const [farmId, setFarmId] = useState<number | null>(null);
    const { logout } = useContext(AuthContext);
    const navigation = useNavigation();


    const fetchFarmAndCrops = async () => {
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

            const crops = await getCrops();
            const farmCrops = crops.filter(c => c.farm_id === firstFarmId);
            setCropList(farmCrops);
        } catch (err: any) {
            console.error("Fetch Farm/Crops Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch crops or farms.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFarmAndCrops();
    }, []);

    // Add new crop
    const handleAdd = async () => {
        if (!farmId) {
            Alert.alert("Error", "You must have a farm to add crops.");
            return;
        }

        const quantityNum = Number(qty);
        if (!name || !qty) {
            Alert.alert("Error", "Please enter crop name and quantity");
            return;
        }
        if (isNaN(quantityNum) || quantityNum <= 0) {
            Alert.alert("Error", "Quantity must be a positive number");
            return;
        }

        try {
            const res = await createCrop({
                farm_id: farmId,
                crop_name: name,
                expected_yield: quantityNum,
                crop_type: "unknown",
                planting_date: null,
                harvest_date: null
            });
            setCropList([...cropList, { crop_id: res.crop_id, farm_id: farmId, crop_name: name, expected_yield: quantityNum }]);
            setName("");
            setQty("");
        } catch (err: any) {
            console.error("Add Crop Error:", err.response?.data || err.message);
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
            await updateCrop(editItem.crop_id, { crop_name: editName, expected_yield: quantityNum });
            setCropList(cropList.map(c => c.crop_id === editItem.crop_id ? { ...c, crop_name: editName, expected_yield: quantityNum } : c));
            setEditItem(null);
        } catch (err: any) {
            console.error("Edit Crop Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to update crop.");
        }
    };

    // Delete crop
    const handleDelete = async (id: number) => {
        try {
            await deleteCrop(id);
            setCropList(cropList.filter(c => c.crop_id !== id));
        } catch (err: any) {
            console.error("Delete Crop Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete crop.");
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

            <TextInput placeholder="Crop Name" style={styles.input} value={name} onChangeText={setName} />
            <TextInput placeholder="Quantity" keyboardType="numeric" style={styles.input} value={qty} onChangeText={setQty} />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Crop</Text>
            </TouchableOpacity>

            <FlatList
                data={cropList}
                keyExtractor={(item) => item.crop_id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>{item.crop_name} - {item.expected_yield}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setEditItem(item); setEditName(item.crop_name); setEditQty(item.expected_yield.toString()); }}>
                                <Text style={styles.editBtn}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.crop_id)}>
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

export default CropsScreen;

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
