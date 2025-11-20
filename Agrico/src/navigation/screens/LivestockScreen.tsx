import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import {
    getLivestock,
    createLivestock,
    updateLivestock,
    deleteLivestock,
} from "../../api/ApiFunctions";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useNavigation} from "@react-navigation/native";

export default function LivestockScreen() {
    const [livestockList, setLivestockList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [animalType, setAnimalType] = useState("");
    const [quantity, setQuantity] = useState("");

    const [editItem, setEditItem] = useState<any>(null);
    const [editType, setEditType] = useState("");
    const [editQty, setEditQty] = useState("");
    const navigation = useNavigation();

    // Fetch all livestock
    const fetchLivestock = async () => {
        setLoading(true);
        try {
            const data = await getLivestock();
            setLivestockList(data || []);
        } catch (err: any) {
            console.error("Fetch Livestock Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch livestock.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLivestock();
    }, []);

    // Add new livestock
    // const handleAdd = async () => {
    //     if (!animalType || !quantity) {
    //         Alert.alert("Missing Fields", "Please enter both type and quantity.");
    //         return;
    //     }
    //
    //     try {
    //         const farmId = await AsyncStorage.getItem("farmId");
    //         if (!farmId){
    //             navigation.navigate("AddFarm");
    //         }
    //         const payload = { farm_id:Number(farmId),animal_type: animalType, quantity: Number(quantity) };
    //         const newItem = await createLivestock(payload);
    //
    //         setLivestockList([...livestockList, newItem]);
    //         setAnimalType("");
    //         setQuantity("");
    //     } catch (err: any) {
    //         console.error("Add Error:", err.response?.data || err.message);
    //         Alert.alert("Error", "Failed to add livestock.");
    //     }
    // };
    // const handleAdd = async () => {
    //     if (!animalType || !quantity) {
    //         Alert.alert("Missing Fields", "Please enter both type and quantity.");
    //         return;
    //     }
    //
    //     try {
    //         const farmId = await AsyncStorage.getItem("farmId");
    //         if (!farmId) {
    //             Alert.alert("No Farm", "Please add a farm first.");
    //             return;
    //         }
    //
    //         const payload = {
    //             farm_id: Number(farmId),
    //             animal_type: animalType,
    //             quantity: Number(quantity),
    //         };
    //
    //         const newItem = await createLivestock(payload);
    //         setLivestockList([...livestockList, newItem]);
    //         setAnimalType("");
    //         setQuantity("");
    //     } catch (err: any) {
    //         console.error("Add Error:", err.response?.data || err.message);
    //         Alert.alert("Error", "Failed to add livestock.");
    //     }
    // };
    const handleAdd = async () => {
        if (!animalType || !quantity) {
            Alert.alert("Missing Fields", "Please enter both type and quantity.");
            return;
        }

        try {
            const farmId = await AsyncStorage.getItem("farmId");
            const payload = {
                farm_id: farmId,
                animal_type: animalType,
                quantity: Number(quantity),
                // optionally health_status or purchase_date if needed
            };

            const newItem = await createLivestock(payload);
            console.log(newItem);

            // Ensure all fields exist in the object
            setLivestockList([
                ...livestockList,
                {
                    id: newItem.id,
                    animal_type: newItem.animal_type,
                    quantity: newItem.quantity,
                    farm_id: newItem.farm_id,
                    health_status: newItem.health_status || "",
                },
            ]);

            setAnimalType("");
            setQuantity("");
        } catch (err: any) {
            console.error("Add Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to add livestock.");
        }
    };


    // Update existing livestock
    const handleUpdate = async () => {
        if (!editItem) return;

        try {
            const payload = { animal_type: editType, quantity: Number(editQty) };
            const updated = await updateLivestock(editItem.id, payload);

            setLivestockList(
                livestockList.map((lv) => (lv.id === editItem.id ? updated : lv))
            );
            setEditItem(null);
        } catch (err: any) {
            console.error("Update Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to update livestock.");
        }
    };

    // Delete livestock
    const handleDelete = async (id: number) => {
        try {
            await deleteLivestock(id);
            setLivestockList(livestockList.filter((lv) => lv.id !== id));
        } catch (err: any) {
            console.error("Delete Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete livestock.");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/*<Text style={styles.header}>Livestock</Text>*/}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                    <Text style={{ color: "#007bff", fontWeight: "600" }}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={livestockList}
                // keyExtractor={(item) => item.id.toString()}
                keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{item.animal_type}</Text>
                        <Text>Quantity: {item.quantity}</Text>

                        <View style={styles.row}>
                            <TouchableOpacity
                                style={styles.smallButton}
                                onPress={() => {
                                    setEditItem(item);
                                    setEditType(item.animal_type);
                                    setEditQty(item.quantity.toString());
                                }}
                            >
                                <Text style={styles.smallButtonText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.smallButton, styles.deleteButton]}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Text style={styles.smallButtonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Text style={styles.subHeader}>Add New Livestock</Text>
            <TextInput
                style={styles.input}
                placeholder="Animal Type (e.g., Cow)"
                value={animalType}
                onChangeText={setAnimalType}
            />
            <TextInput
                style={styles.input}
                placeholder="Quantity"
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
            />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Livestock</Text>
            </TouchableOpacity>

            {editItem && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>Edit Livestock</Text>
                        <TextInput
                            style={styles.input}
                            value={editType}
                            onChangeText={setEditType}
                        />
                        <TextInput
                            style={styles.input}
                            value={editQty}
                            keyboardType="numeric"
                            onChangeText={setEditQty}
                        />
                        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setEditItem(null)}
                            style={{ marginTop: 10 }}
                        >
                            <Text style={{ color: "red", textAlign: "center" }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
    subHeader: { fontSize: 18, fontWeight: "bold", marginTop: 20 },
    input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, marginBottom: 10 },
    button: { backgroundColor: "#28a745", padding: 14, borderRadius: 8, marginTop: 10 },
    buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
    card: { padding: 15, backgroundColor: "#f3f3f3", borderRadius: 8, marginBottom: 10 },
    cardTitle: { fontSize: 18, fontWeight: "bold" },
    row: { flexDirection: "row", marginTop: 10 },
    smallButton: { flex: 1, backgroundColor: "#007bff", padding: 8, marginHorizontal: 5, borderRadius: 6 },
    deleteButton: { backgroundColor: "#d9534f" },
    smallButtonText: { color: "#fff", textAlign: "center" },
    modalOverlay: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center",
    },
    modal: { width: "80%", backgroundColor: "#fff", padding: 20, borderRadius: 10 },
    modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
});
