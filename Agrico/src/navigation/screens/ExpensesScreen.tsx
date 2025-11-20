import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../AuthContext";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getExpenses, createExpense } from "../../api/ApiFunctions";

export default function ExpensesScreen() {
    const navigation = useNavigation();
    const { farmId, logout } = useContext(AuthContext);

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [expenses, setExpenses] = useState<any[]>([]);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);

    // ---------------- CHECK FARM ----------------
    useEffect(() => {
        if (!farmId) {

            navigation.navigate("AddFarm");
            return;
        }
        loadExpenses();
    }, [farmId]);

    // ---------------- FETCH EXPENSES ----------------
    const loadExpenses = async () => {
        if (!farmId) return; // prevent fetching without farm
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");
            const data = await getExpenses(farmId, token);

            setExpenses(data.expenses || []);
            setTotalExpenses(data.total_expenses || 0);
        } catch (err) {
            console.log("Fetch error:", err);
            Alert.alert("Error", "Failed to load expenses.");
        } finally {
            setLoading(false);
        }
    };

    // ---------------- CREATE EXPENSE ----------------
    const handleCreateExpense = async () => {
        if (!farmId) {
            Alert.alert("No Farm Found", "You must create a farm first.", [
                { text: "OK", onPress: () => navigation.navigate("AddFarm") },
            ]);
            return;
        }
        if (!amount.trim()) {
            Alert.alert("Validation", "Amount is required.");
            return;
        }

        try {
            setCreating(true);
            const token = await AsyncStorage.getItem("AccessToken");
            if (!token) throw new Error("Missing auth token");

            const payload = {
                farm_id: farmId,
                amount: Number(amount),
                description,
                date: date || undefined,
            };

            await createExpense(payload, token);

            Alert.alert("Success", "Expense created!");

            setAmount("");
            setDescription("");
            setDate("");

            loadExpenses();
        } catch (err: any) {
            console.log("Create expense error:", err.response?.data || err);
            Alert.alert("Error", err.response?.data?.error || "Failed to create expense");
        } finally {
            setCreating(false);
        }
    };

    // ---------------- RENDER ----------------
    const renderItem = ({ item }) => (
        <View style={styles.expenseItem}>
            <Text style={styles.expenseText}>
                <Text style={styles.bold}>Amount:</Text> {item.amount}
            </Text>
            <Text style={styles.expenseText}>
                <Text style={styles.bold}>Description:</Text> {item.description || "No description"}
            </Text>
            <Text style={styles.expenseText}>
                <Text style={styles.bold}>Date:</Text> {item.date}
            </Text>
        </View>
    );

    // Don't render the screen if farmId doesn't exist
    if (!farmId) return null;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/*<TouchableOpacity onPress={() => navigation.goBack()}>*/}
                {/*    <Text style={styles.backButton}>⬅ Back</Text>*/}
                {/*</TouchableOpacity>*/}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                    <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                        <Text style={{ color: "#007bff", fontWeight: "600" }}>Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>

                {/*<TouchableOpacity onPress={logout}>*/}
                {/*    <Text style={styles.logoutButton}>Logout</Text>*/}
                {/*</TouchableOpacity>*/}
            </View>

            <Text style={styles.title}>Expenses for Farm #{farmId}</Text>

            {/* Total Expenses */}
            <Text style={styles.total}>Total Expenses: {totalExpenses}</Text>

            {/* Create expense form */}
            <View style={styles.form}>
                <TextInput
                    placeholder="Amount"
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                <TextInput
                    placeholder="Description"
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                />
                <TextInput
                    placeholder="Date (YYYY-MM-DD) - optional"
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                />

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateExpense}
                    disabled={creating}
                >
                    <Text style={styles.createButtonText}>
                        {creating ? "Saving..." : "Add Expense"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expense list */}
            <Text style={styles.subtitle}>Expense History</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#2E8B57" />
            ) : (
                <FlatList
                    data={expenses}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    backButton: { fontSize: 18, color: "#2E8B57", fontWeight: "bold" },
    logoutButton: { fontSize: 18, color: "red", fontWeight: "bold" },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
    total: { fontSize: 16, fontWeight: "600", color: "#2E8B57", marginBottom: 15 },
    subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 10 },
    form: { marginBottom: 20 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
    },
    createButton: {
        backgroundColor: "#2E8B57",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    createButtonText: { color: "white", fontWeight: "bold" },
    expenseItem: {
        backgroundColor: "#F0F0F0",
        padding: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    expenseText: { fontSize: 14 },
    bold: { fontWeight: "bold" },
});
