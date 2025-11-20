import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../AuthContext';
import {
    getSales,
    createSale,
    updateSale,
    deleteSale,
    getTotalSales,
    SalePayload,
} from '../../api/ApiFunctions';

const SalesScreen = () => {
    const navigation = useNavigation();
    const { farmId } = useContext(AuthContext);

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [totalSales, setTotalSales] = useState(0);

    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [notes, setNotes] = useState('');

    const [editItem, setEditItem] = useState<any>(null);
    const [editItemName, setEditItemName] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editUnitPrice, setEditUnitPrice] = useState('');
    const [editNotes, setEditNotes] = useState('');

    // ------------------ Redirect if no farm ------------------
    useEffect(() => {
        if (!farmId) {
            navigation.navigate('AddFarm');
        } else {
            loadSales();
            loadTotalSales();
        }
    }, [farmId]);

    // ------------------ Load sales ------------------
    const loadSales = async () => {
        setLoading(true);
        try {
            const data = await getSales();
            setSales(data);
        } catch (err) {
            console.error('Fetch sales error:', err);
            Alert.alert('Error', 'Failed to fetch sales.');
        } finally {
            setLoading(false);
        }
    };

    // ------------------ Load total sales ------------------
    const loadTotalSales = async () => {
        try {
            const total = await getTotalSales();
            setTotalSales(total);
        } catch (err) {
            console.error('Fetch total sales error:', err);
        }
    };

    // ------------------ Create sale ------------------
    const handleCreateSale = async () => {
        if (!itemName || !quantity || !unitPrice) {
            return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
        }

        const payload: SalePayload = {
            farm_id: farmId,
            item_name: itemName,
            quantity: Number(quantity),
            unit_price: Number(unitPrice),
            // sale_date: sale_date || undefined,
            notes: notes || undefined,
        };


        try {
            setCreating(true);
            await createSale(payload);
            Alert.alert('Success', 'Sale added');
            setItemName('');
            setQuantity('');
            setUnitPrice(unitPrice);
            setNotes('');
            await loadSales();
            await loadTotalSales();
        } catch (err) {
            console.error('Create sale error:', err);
            Alert.alert('Error', 'Failed to create sale');
        } finally {
            setCreating(false);
        }
    };

    // ------------------ Delete sale ------------------
    const handleDelete = async (saleId: number) => {
        Alert.alert('Confirm', 'Delete this sale?', [
            { text: 'Cancel' },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        await deleteSale(saleId);
                        loadSales();
                        loadTotalSales();
                    } catch (err) {
                        console.error('Delete sale error:', err);
                        Alert.alert('Error', 'Failed to delete sale');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    // ------------------ Edit sale ------------------
    const handleEdit = async () => {
        if (!editItem) return;
        if (!editItemName || !editQuantity || !editUnitPrice) {
            return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
        }

        try {
            await updateSale(editItem.sale_id, {
                item_name: editItemName,
                quantity: Number(editQuantity),
                unit_price: Number(editUnitPrice),
                notes: editNotes || undefined,
            });
            setEditItem(null);
            await loadSales();
            await loadTotalSales();
            Alert.alert('Success', 'Sale updated');
        } catch (err) {
            console.error('Edit sale error:', err);
            Alert.alert('Error', 'Failed to update sale');
        }
    };

    // ------------------ Render sale item ------------------
    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.saleItem}>

            <Text style={styles.saleText}>
                {item.item_name} - {item.quantity} x ${item.unit_price} = ${item.total_amount}
            </Text>
            <Text style={styles.saleText}>Notes: {item.notes || 'None'}</Text>
            <Text style={styles.saleText}>Date: {item.sale_date}</Text>
            <View style={styles.itemButtons}>
                <TouchableOpacity
                    onPress={() => {
                        setEditItem(item);
                        setEditItemName(item.item_name);
                        setEditQuantity(item.quantity.toString());
                        setEditUnitPrice(item.unit_price.toString());
                        setEditNotes(item.notes || '');
                    }}
                >
                    <Text style={styles.editBtn}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.sale_id)}>
                    <Text style={styles.deleteBtn}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                    <Text style={{ color: "#007bff", fontWeight: "600" }}>Back to Dashboard</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Sales (Total: RWF{totalSales})</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#2E8B57" />
            ) : (
                <FlatList
                    data={sales}
                    keyExtractor={(item) => item.sale_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 50 }}
                />
            )}

            {/* Add Sale Form */}
            <Text style={styles.subtitle}>Add New Sale</Text>
            <TextInput
                placeholder="Item Name"
                style={styles.input}
                value={itemName}
                onChangeText={setItemName}
            />
            <TextInput
                placeholder="Quantity"
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
            />
            <TextInput
                placeholder="Unit Price"
                style={styles.input}
                keyboardType="numeric"
                value={unitPrice}
                onChangeText={setUnitPrice}
            />
            <TextInput
                placeholder="Notes (optional)"
                style={styles.input}
                value={notes}
                onChangeText={setNotes}
            />
            <TouchableOpacity style={styles.button} onPress={handleCreateSale} disabled={creating}>
                <Text style={styles.buttonText}>{creating ? 'Saving...' : 'Add Sale'}</Text>
            </TouchableOpacity>

            {/* Edit Sale Modal */}
            {editItem && (
                <View style={styles.editModal}>
                    <Text style={styles.modalTitle}>Edit Sale</Text>
                    <TextInput
                        style={styles.input}
                        value={editItemName}
                        onChangeText={setEditItemName}
                        placeholder="Item Name"
                    />
                    <TextInput
                        style={styles.input}
                        value={editQuantity}
                        onChangeText={setEditQuantity}
                        placeholder="Quantity"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={editUnitPrice}
                        onChangeText={setEditUnitPrice}
                        placeholder="Unit Price"
                        keyboardType="numeric"
                    />
                    <TextInput
                        style={styles.input}
                        value={editNotes}
                        onChangeText={setEditNotes}
                        placeholder="Notes"
                    />
                    <TouchableOpacity style={styles.button} onPress={handleEdit}>
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditItem(null)}>
                        <Text style={styles.cancelBtn}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default SalesScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
    subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
    button: { backgroundColor: '#2E8B57', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    saleItem: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 8, marginBottom: 10 },
    saleText: { fontSize: 14 },
    itemButtons: { flexDirection: 'row', marginTop: 8 },
    editBtn: { color: 'blue', marginRight: 15 },
    deleteBtn: { color: 'red' },
    editModal: {
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '80%',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        elevation: 5,
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    cancelBtn: { color: 'red', textAlign: 'center', marginTop: 10 },
});
