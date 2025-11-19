import React, { useState, useEffect, useContext } from "react";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { AuthContext } from "../AuthContext";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../../api/ApiFunctions";

const farm_id = 1; // replace with dynamic farm id

const ExpensesScreen = ({ navigation }: { navigation: any }) => {
    const { logout } = useContext(AuthContext);

    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    const [editItem, setEditItem] = useState<any>(null);
    const [editDescription, setEditDescription] = useState("");
    const [editAmount, setEditAmount] = useState("");

    // Fetch expenses
    const fetchExpensesData = async () => {
        setLoading(true);
        try {
            const data = await getExpenses(farm_id);
            setExpenses(data);
        } catch (err: any) {
            console.error("Fetch Expenses Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch expenses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", fetchExpensesData);
        return unsubscribe;
    }, [navigation]);

    // Add new expense
    const handleAdd = async () => {
        if (!description || !amount) return Alert.alert("Error", "Please fill in all fields.");
        try {
            const newExpense = await createExpense({ farm_id, description, amount: Number(amount) });
            setExpenses([...expenses, newExpense.expense]);
            setDescription("");
            setAmount("");
        } catch (err: any) {
            console.error("Add Expense Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to add expense.");
        }
    };

    // Edit expense
    const handleEdit = async () => {
        if (!editItem) return;
        try {
            const updated = await updateExpense(editItem.id, { description: editDescription, amount: Number(editAmount) });
            setExpenses(expenses.map(e => e.id === editItem.id ? updated.expense : e));
            setEditItem(null);
        } catch (err: any) {
            console.error("Update Expense Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to update expense.");
        }
    };

    // Delete expense
    const handleDelete = async (id: number) => {
        try {
            await deleteExpense(id);
            setExpenses(expenses.filter(e => e.id !== id));
        } catch (err: any) {
            console.error("Delete Expense Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete expense.");
        }
    };

    return (
        <View style={{ flex: 1, padding: 20 }}>
            {/* Header with Back & Logout */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: "blue", fontWeight: "600" }}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout}>
                    <Text style={{ color: "red", fontWeight: "600" }}>Logout</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.header}>Expenses</Text>

            {loading && <ActivityIndicator size="large" color="#007bff" />}

            {/* Add Expense Inputs */}
            <TextInput placeholder="Description" style={styles.input} value={description} onChangeText={setDescription} />
            <TextInput placeholder="Amount" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} />
            <TouchableOpacity style={styles.button} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Expense</Text>
            </TouchableOpacity>

            {/* Expenses List */}
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.listItem}>
                        <Text>${item.amount} - {item.description}</Text>
                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity onPress={() => { setEditItem(item); setEditDescription(item.description); setEditAmount(String(item.amount)); }}>
                                <Text style={styles.editBtn}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={styles.deleteBtn}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Edit Modal */}
            <Modal visible={!!editItem} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Edit Expense</Text>
                        <TextInput style={styles.input} value={editDescription} onChangeText={setEditDescription} />
                        <TextInput style={styles.input} keyboardType="numeric" value={editAmount} onChangeText={setEditAmount} />
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

export default ExpensesScreen;

const styles = StyleSheet.create({
    header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
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
