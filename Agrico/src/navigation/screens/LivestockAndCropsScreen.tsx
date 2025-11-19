import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    getLivestock,
    createLivestock,
    updateLivestock,
    deleteLivestock,
    getCrops,
    createCrop,
    updateCrop,
    deleteCrop,
} from "../../api/ApiFunctions";

const screenWidth = Dimensions.get("window").width;

const LivestockAndCropsScreen = () => {
    const [activeTab, setActiveTab] = useState<"livestock" | "crops">("livestock");

    // Data states
    const [livestockList, setLivestockList] = useState<any[]>([]);
    const [cropList, setCropList] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);

    // Input states
    const [livestockName, setLivestockName] = useState("");
    const [livestockQty, setLivestockQty] = useState("");
    const [cropName, setCropName] = useState("");
    const [cropQty, setCropQty] = useState("");

    // Edit modal
    const [editItem, setEditItem] = useState<any>(null);
    const [editName, setEditName] = useState("");
    const [editQty, setEditQty] = useState("");

    const farm_id = 1; // Replace with dynamic farm id if needed

    // Fetch all data
    const fetchData = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            const livestock = await getLivestock(farm_id, token);
            setLivestockList(livestock);

            const crops = await getCrops(token);
            setCropList(crops);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- LIVESTOCK CRUD ---
    const handleAddLivestock = async () => {
        if (!livestockName || !livestockQty) return;
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = {
                farm_id,
                animal_type: livestockName,
                quantity: Number(livestockQty),
            };
            const res = await createLivestock(data, token!);
            setLivestockList([...livestockList, { id: res.id, animal_type: livestockName, quantity: Number(livestockQty) }]);
            setLivestockName("");
            setLivestockQty("");
        } catch (err) {
            console.error("Add livestock error:", err);
        }
    };

    const handleEditLivestock = async () => {
        if (!editItem) return;
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = { animal_type: editName, quantity: Number(editQty) };
            await updateLivestock(editItem.id, data, token!);
            setLivestockList(livestockList.map(l => l.id === editItem.id ? { ...l, animal_type: editName, quantity: Number(editQty) } : l));
            setEditItem(null);
        } catch (err) {
            console.error("Edit livestock error:", err);
        }
    };

    const handleDeleteLivestock = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            await deleteLivestock(id, token!);
            setLivestockList(livestockList.filter(l => l.id !== id));
        } catch (err) {
            console.error("Delete livestock error:", err);
        }
    };

    // --- CROPS CRUD ---
    const handleAddCrop = async () => {
        if (!cropName || !cropQty) return;
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = {
                farm_id,
                crop_name: cropName,
                expected_yield: Number(cropQty),
                crop_type: "unknown",
                planting_date: null,
                harvest_date: null,
            };
            const res = await createCrop(data, token!);
            setCropList([...cropList, { crop_id: res.crop_id, crop_name: cropName, expected_yield: Number(cropQty) }]);
            setCropName("");
            setCropQty("");
        } catch (err) {
            console.error("Add crop error:", err);
        }
    };

    const handleEditCrop = async () => {
        if (!editItem) return;
        try {
            const token = await AsyncStorage.getItem("userToken");
            const data = { crop_name: editName, expected_yield: Number(editQty) };
            await updateCrop(editItem.crop_id, data, token!);
            setCropList(cropList.map(c => c.crop_id === editItem.crop_id ? { ...c, crop_name: editName, expected_yield: Number(editQty) } : c));
            setEditItem(null);
        } catch (err) {
            console.error("Edit crop error:", err);
        }
    };

    const handleDeleteCrop = async (id: number) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            await deleteCrop(id, token!);
            setCropList(cropList.filter(c => c.crop_id !== id));
        } catch (err) {
            console.error("Delete crop error:", err);
        }
    };

    // --- Helper ---
    const totalLivestock = livestockList.reduce((sum, l) => sum + Number(l.quantity), 0);
    const totalCrops = cropList.reduce((sum, c) => sum + Number(c.expected_yield), 0);
    const currentList = activeTab === "livestock" ? livestockList : cropList;

    const addHandler = activeTab === "livestock" ? handleAddLivestock : handleAddCrop;
    const editHandler = activeTab === "livestock" ? handleEditLivestock : handleEditCrop;
    const deleteHandler = activeTab === "livestock" ? handleDeleteLivestock : handleDeleteCrop;

    return (
        <View style={{ flex: 1 }}>
            {loading && <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />}

            {/* SUMMARY */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>{totalLivestock}</Text>
                    <Text>Livestock</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>{totalCrops}</Text>
                    <Text>Crops</Text>
                </View>
            </View>

            {/* CHART */}
            <BarChart
                data={{
                    labels: ["Jan", "Feb", "Mar", "Apr"],
                    datasets: [{ data: [totalLivestock, totalCrops, 20, 35] }],
                }}
                width={screenWidth - 20}
                height={220}
                yAxisLabel=""
                chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#f7f7f7",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                    labelColor: () => "#555",
                }}
                style={{ margin: 10, borderRadius: 10 }}
            />

            {/* TABS */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "livestock" && styles.activeTab]}
                    onPress={() => setActiveTab("livestock")}
                >
                    <Text style={[styles.tabText, activeTab === "livestock" && styles.activeTabText]}>
                        Livestock
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "crops" && styles.activeTab]}
                    onPress={() => setActiveTab("crops")}
                >
                    <Text style={[styles.tabText, activeTab === "crops" && styles.activeTabText]}>
                        Crops
                    </Text>
                </TouchableOpacity>
            </View>

            {/* CONTENT */}
            <FlatList
                data={currentList}
                keyExtractor={(item) => activeTab === "livestock" ? item.id.toString() : item.crop_id.toString()}
                ListHeaderComponent={
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder={activeTab === "livestock" ? "Livestock Name" : "Crop Name"}
                            value={activeTab === "livestock" ? livestockName : cropName}
                            onChangeText={activeTab === "livestock" ? setLivestockName : setCropName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Quantity"
                            keyboardType="numeric"
                            value={activeTab === "livestock" ? livestockQty : cropQty}
                            onChangeText={activeTab === "livestock" ? setLivestockQty : setCropQty}
                        />
                        <TouchableOpacity style={styles.button} onPress={addHandler}>
                            <Text style={styles.buttonText}>
                                {activeTab === "livestock" ? "Add Livestock" : "Add Crop"}
                            </Text>
                        </TouchableOpacity>
                    </>
                }
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>
                            {activeTab === "livestock" ? `${item.animal_type} - ${item.quantity}` : `${item.crop_name} - ${item.expected_yield}`}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setEditItem(item); setEditName(activeTab === "livestock" ? item.animal_type : item.crop_name); setEditQty(activeTab === "livestock" ? item.quantity : item.expected_yield); }}>
                                <Text style={styles.editBtn}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => deleteHandler(activeTab === "livestock" ? item.id : item.crop_id)}>
                                <Text style={styles.deleteBtn}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                contentContainerStyle={{ padding: 20 }}
            />

            {/* EDIT MODAL */}
            <Modal visible={!!editItem} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Item</Text>
                        <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                        <TextInput style={styles.input} value={String(editQty)} keyboardType="numeric" onChangeText={setEditQty} />
                        <TouchableOpacity style={styles.button} onPress={editHandler}>
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

export default LivestockAndCropsScreen;

// STYLES
const styles = StyleSheet.create({
    summaryRow: { flexDirection: "row", justifyContent: "space-between", padding: 15 },
    summaryBox: { flex: 1, backgroundColor: "#f3f4f6", marginHorizontal: 8, padding: 15, borderRadius: 10, alignItems: "center" },
    summaryNumber: { fontSize: 22, fontWeight: "bold", color: "#007bff" },
    header: { flexDirection: "row", backgroundColor: "#f2f2f2", paddingVertical: 10 },
    tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
    activeTab: { borderBottomWidth: 3, borderBottomColor: "#007bff" },
    tabText: { fontSize: 16, color: "#888" },
    activeTabText: { color: "#007bff", fontWeight: "600" },
    input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 15 },
    button: { backgroundColor: "#007bff", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 5, marginBottom: 20 },
    buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
    listItem: { backgroundColor: "#f8f8f8", padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" },
    editBtn: { color: "blue", marginRight: 15 },
    deleteBtn: { color: "red" },
    modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
    modalBox: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: "600", textAlign: "center", marginBottom: 15 },
});
