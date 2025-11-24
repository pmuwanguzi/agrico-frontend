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
    Modal,
    ScrollView,
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
    getFarms,
} from '../../api/ApiFunctions';

const SalesScreen = () => {
    const navigation = useNavigation();
    const { logout } = useContext(AuthContext);

    const [sales, setSales] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [totalSales, setTotalSales] = useState(0);
    const [farmId, setFarmId] = useState<number | null>(null);

    // Form states
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unitPrice, setUnitPrice] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState('');

    // Edit states
    const [editItem, setEditItem] = useState<any>(null);
    const [editItemName, setEditItemName] = useState('');
    const [editQuantity, setEditQuantity] = useState('');
    const [editUnitPrice, setEditUnitPrice] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editDate, setEditDate] = useState('');

    // ------------------ Fetch farm and sales on mount ------------------
    useEffect(() => {
        fetchFarmAndSales();
    }, []);

    const fetchFarmAndSales = async () => {
        setLoading(true);
        try {
            const farms = await getFarms();
            if (farms.length === 0) {
                setLoading(false);
                Alert.alert("No Farm Found", "Please create a farm first.");
                navigation.navigate("AddFarm");
                return;
            }

            const firstFarmId = farms[0].farm_id;
            setFarmId(firstFarmId);

            await loadSales();
            await loadTotalSales();
        } catch (err: any) {
            console.error("Fetch Farm/Sales Error:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to fetch sales or farms.");
        } finally {
            setLoading(false);
        }
    };

    // ------------------ Load sales ------------------
    const loadSales = async () => {
        try {
            const data = await getSales();
            setSales(data);
        } catch (err: any) {
            console.error('Fetch sales error:', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to fetch sales.');
        }
    };

    // ------------------ Load total sales ------------------
    const loadTotalSales = async () => {
        try {
            const total = await getTotalSales();
            setTotalSales(total);
        } catch (err: any) {
            console.error('Fetch total sales error:', err.response?.data || err.message);
        }
    };

    // ------------------ Create sale ------------------
    const handleCreateSale = async () => {
        if (!farmId) {
            return Alert.alert('Error', 'No farm selected');
        }

        if (!itemName || !quantity || !unitPrice) {
            return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
        }

        const quantityNum = Number(quantity);
        const unitPriceNum = Number(unitPrice);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            return Alert.alert('Error', 'Quantity must be a positive number');
        }

        if (isNaN(unitPriceNum) || unitPriceNum < 0) {
            return Alert.alert('Error', 'Unit price must be a non-negative number');
        }

        const payload: SalePayload = {
            farm_id: farmId,
            item_name: itemName,
            quantity: quantityNum,
            unit_price: unitPriceNum,
            sale_date: date || undefined,
            notes: notes || undefined,
        };

        try {
            setCreating(true);
            await createSale(payload);

            // Reset form
            setItemName("");
            setQuantity("");
            setUnitPrice("");
            setNotes("");
            setDate("");

            await loadSales();
            await loadTotalSales();

            Alert.alert('Success', 'Sale added successfully!');
        } catch (err: any) {
            console.error('Create sale error:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'Failed to create sale');
        } finally {
            setCreating(false);
        }
    };

    // ------------------ Delete sale ------------------
    const handleDelete = async (saleId: number) => {
        Alert.alert('Confirm Delete', 'Are you sure you want to delete this sale?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await deleteSale(saleId);
                        await loadSales();
                        await loadTotalSales();
                        Alert.alert('Success', 'Sale deleted successfully!');
                    } catch (err: any) {
                        console.error('Delete sale error:', err.response?.data || err.message);
                        Alert.alert('Error', err.response?.data?.error || 'Failed to delete sale');
                    }
                },
            },
        ]);
    };

    // ------------------ Edit sale ------------------
    const handleEdit = async () => {
        if (!editItem) return;

        if (!editItemName || !editQuantity || !editUnitPrice) {
            return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
        }

        const quantityNum = Number(editQuantity);
        const unitPriceNum = Number(editUnitPrice);

        if (isNaN(quantityNum) || quantityNum <= 0) {
            return Alert.alert('Error', 'Quantity must be a positive number');
        }

        if (isNaN(unitPriceNum) || unitPriceNum < 0) {
            return Alert.alert('Error', 'Unit price must be a non-negative number');
        }

        try {
            await updateSale(editItem.sale_id, {
                item_name: editItemName,
                quantity: quantityNum,
                unit_price: unitPriceNum,
                sale_date: editDate || undefined,
                notes: editNotes || undefined,
            });

            setEditItem(null);
            await loadSales();
            await loadTotalSales();

            Alert.alert('Success', 'Sale updated successfully!');
        } catch (err: any) {
            console.error('Edit sale error:', err.response?.data || err.message);
            Alert.alert('Error', err.response?.data?.error || 'Failed to update sale');
        }
    };

    // ------------------ Render sale item ------------------
    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.saleItem}>
            <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.item_name}</Text>
                <Text style={styles.saleText}>
                    {item.quantity} × RWF{item.unit_price.toFixed(2)} = RWF{item.total_amount.toFixed(2)}
                </Text>
                <Text style={styles.saleText}>Date: {item.sale_date}</Text>
                {item.notes && <Text style={styles.saleText}>Notes: {item.notes}</Text>}
            </View>
            <View style={styles.itemButtons}>
                <TouchableOpacity
                    onPress={() => {
                        setEditItem(item);
                        setEditItemName(item.item_name);
                        setEditQuantity(item.quantity.toString());
                        setEditUnitPrice(item.unit_price.toString());
                        setEditDate(item.sale_date || '');
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
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
                <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
                    <Text style={{ color: "#007bff", fontWeight: "600" }}>← Back to Dashboard</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sales</Text>
            </View>

            {loading && <ActivityIndicator size="large" color="#2E8B57" style={{ marginVertical: 20 }} />}

            {/* Total Sales Summary */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Total Sales:</Text>
                <Text style={styles.summaryAmount}>RWF {totalSales.toFixed(2)}</Text>
            </View>

            {/* Add Sale Form */}
            <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Add New Sale</Text>
                <TextInput
                    placeholder="Item Name (e.g., Tomatoes)"
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
                    placeholder="Unit Price (RWF)"
                    style={styles.input}
                    keyboardType="numeric"
                    value={unitPrice}
                    onChangeText={setUnitPrice}
                />
                <TextInput
                    placeholder="Sale Date (YYYY-MM-DD) - Optional"
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                />
                <TextInput
                    placeholder="Notes - Optional"
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.button, creating && styles.buttonDisabled]}
                    onPress={handleCreateSale}
                    disabled={creating}
                >
                    <Text style={styles.buttonText}>{creating ? 'Adding...' : 'Add Sale'}</Text>
                </TouchableOpacity>
            </View>

            {/* Sales List */}
            <Text style={styles.listTitle}>Recent Sales</Text>
            <FlatList
                data={sales}
                keyExtractor={(item) => item.sale_id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
                ListEmptyComponent={
                    !loading ? (
                        <Text style={styles.emptyText}>No sales found. Add your first sale above!</Text>
                    ) : null
                }
            />

            {/* Edit Sale Modal */}
            <Modal visible={!!editItem} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <ScrollView>
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
                                value={editDate}
                                onChangeText={setEditDate}
                                placeholder="Sale Date (YYYY-MM-DD)"
                            />
                            <TextInput
                                style={styles.input}
                                value={editNotes}
                                onChangeText={setEditNotes}
                                placeholder="Notes"
                                multiline
                            />
                            <TouchableOpacity style={styles.button} onPress={handleEdit}>
                                <Text style={styles.buttonText}>Save Changes</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setEditItem(null)}>
                                <Text style={styles.cancelBtn}>Cancel</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SalesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryCard: {
        backgroundColor: '#2E8B57',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    summaryAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    formContainer: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
    },
    formTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 10,
        color: '#333',
    },
    listTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    button: {
        backgroundColor: '#2E8B57',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    buttonDisabled: {
        backgroundColor: '#95c5a8',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    saleItem: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    saleText: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    itemButtons: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    editBtn: {
        color: '#007bff',
        marginBottom: 8,
        fontWeight: '600',
    },
    deleteBtn: {
        color: '#dc3545',
        fontWeight: '600',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 20,
        fontSize: 14,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        width: '85%',
        maxHeight: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    cancelBtn: {
        color: '#dc3545',
        textAlign: 'center',
        marginTop: 10,
        fontWeight: '600',
        fontSize: 16,
    },
});
// import React, { useEffect, useState, useContext } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     FlatList,
//     StyleSheet,
//     Alert,
//     ActivityIndicator,
//     Modal,
//     ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { AuthContext } from '../AuthContext';
// import {
//     getSales,
//     createSale,
//     updateSale,
//     deleteSale,
//     getTotalSales,
//     SalePayload,
//     getFarms,
// } from '../../api/ApiFunctions';
//
// const SalesScreen = () => {
//     const navigation = useNavigation();
//     const { logout } = useContext(AuthContext);
//
//     const [sales, setSales] = useState<any[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [creating, setCreating] = useState(false);
//     const [totalSales, setTotalSales] = useState(0);
//     const [farmId, setFarmId] = useState<number | null>(null);
//
//     // Form states
//     const [itemName, setItemName] = useState('');
//     const [quantity, setQuantity] = useState('');
//     const [unitPrice, setUnitPrice] = useState('');
//     const [notes, setNotes] = useState('');
//     const [date, setDate] = useState('');
//
//     // Edit states
//     const [editItem, setEditItem] = useState<any>(null);
//     const [editItemName, setEditItemName] = useState('');
//     const [editQuantity, setEditQuantity] = useState('');
//     const [editUnitPrice, setEditUnitPrice] = useState('');
//     const [editNotes, setEditNotes] = useState('');
//     const [editDate, setEditDate] = useState('');
//
//     // ------------------ Fetch farm and sales on mount ------------------
//     useEffect(() => {
//         fetchFarmAndSales();
//     }, []);
//
//     const fetchFarmAndSales = async () => {
//         setLoading(true);
//         try {
//             const farms = await getFarms();
//             if (farms.length === 0) {
//                 setLoading(false);
//                 Alert.alert("No Farm Found", "Please create a farm first.");
//                 navigation.navigate("AddFarm");
//                 return;
//             }
//
//             const firstFarmId = farms[0].farm_id;
//             setFarmId(firstFarmId);
//
//             await loadSales();
//             await loadTotalSales();
//         } catch (err: any) {
//             console.error("Fetch Farm/Sales Error:", err.response?.data || err.message);
//             Alert.alert("Error", "Failed to fetch sales or farms.");
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // ------------------ Load sales ------------------
//     const loadSales = async () => {
//         try {
//             const data = await getSales();
//             setSales(data);
//         } catch (err: any) {
//             console.error('Fetch sales error:', err.response?.data || err.message);
//             Alert.alert('Error', 'Failed to fetch sales.');
//         }
//     };
//
//     // ------------------ Load total sales ------------------
//     const loadTotalSales = async () => {
//         try {
//             const total = await getTotalSales();
//             setTotalSales(total);
//         } catch (err: any) {
//             console.error('Fetch total sales error:', err.response?.data || err.message);
//         }
//     };
//
//     // ------------------ Create sale ------------------
//     const handleCreateSale = async () => {
//         if (!farmId) {
//             return Alert.alert('Error', 'No farm selected');
//         }
//
//         if (!itemName || !quantity || !unitPrice) {
//             return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
//         }
//
//         const quantityNum = Number(quantity);
//         const unitPriceNum = Number(unitPrice);
//
//         if (isNaN(quantityNum) || quantityNum <= 0) {
//             return Alert.alert('Error', 'Quantity must be a positive number');
//         }
//
//         if (isNaN(unitPriceNum) || unitPriceNum < 0) {
//             return Alert.alert('Error', 'Unit price must be a non-negative number');
//         }
//
//         const payload: SalePayload = {
//             farm_id: farmId,
//             item_name: itemName,
//             quantity: quantityNum,
//             unit_price: unitPriceNum,
//             sale_date: date || undefined,
//             notes: notes || undefined,
//         };
//
//         try {
//             setCreating(true);
//             await createSale(payload);
//
//             // Reset form
//             setItemName("");
//             setQuantity("");
//             setUnitPrice("");
//             setNotes("");
//             setDate("");
//
//             await loadSales();
//             await loadTotalSales();
//
//             Alert.alert('Success', 'Sale added successfully!');
//         } catch (err: any) {
//             console.error('Create sale error:', err.response?.data || err.message);
//             Alert.alert('Error', err.response?.data?.error || 'Failed to create sale');
//         } finally {
//             setCreating(false);
//         }
//     };
//
//     // ------------------ Delete sale ------------------
//     const handleDelete = async (saleId: number) => {
//         Alert.alert('Confirm Delete', 'Are you sure you want to delete this sale?', [
//             { text: 'Cancel', style: 'cancel' },
//             {
//                 text: 'Delete',
//                 style: 'destructive',
//                 onPress: async () => {
//                     try {
//                         await deleteSale(saleId);
//                         await loadSales();
//                         await loadTotalSales();
//                         Alert.alert('Success', 'Sale deleted successfully!');
//                     } catch (err: any) {
//                         console.error('Delete sale error:', err.response?.data || err.message);
//                         Alert.alert('Error', err.response?.data?.error || 'Failed to delete sale');
//                     }
//                 },
//             },
//         ]);
//     };
//
//     // ------------------ Edit sale ------------------
//     const handleEdit = async () => {
//         if (!editItem) return;
//
//         if (!editItemName || !editQuantity || !editUnitPrice) {
//             return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
//         }
//
//         const quantityNum = Number(editQuantity);
//         const unitPriceNum = Number(editUnitPrice);
//
//         if (isNaN(quantityNum) || quantityNum <= 0) {
//             return Alert.alert('Error', 'Quantity must be a positive number');
//         }
//
//         if (isNaN(unitPriceNum) || unitPriceNum < 0) {
//             return Alert.alert('Error', 'Unit price must be a non-negative number');
//         }
//
//         try {
//             await updateSale(editItem.sale_id, {
//                 item_name: editItemName,
//                 quantity: quantityNum,
//                 unit_price: unitPriceNum,
//                 sale_date: editDate || undefined,
//                 notes: editNotes || undefined,
//             });
//
//             setEditItem(null);
//             await loadSales();
//             await loadTotalSales();
//
//             Alert.alert('Success', 'Sale updated successfully!');
//         } catch (err: any) {
//             console.error('Edit sale error:', err.response?.data || err.message);
//             Alert.alert('Error', err.response?.data?.error || 'Failed to update sale');
//         }
//     };
//
//     // ------------------ Render sale item ------------------
//     const renderItem = ({ item }: { item: any }) => (
//         <View style={styles.saleItem}>
//             <View style={{ flex: 1 }}>
//                 <Text style={styles.itemTitle}>{item.item_name}</Text>
//                 <Text style={styles.saleText}>
//                     {item.quantity} × RWF{item.unit_price.toFixed(2)} = RWF{item.total_amount.toFixed(2)}
//                 </Text>
//                 <Text style={styles.saleText}>Date: {item.sale_date}</Text>
//                 {item.notes && <Text style={styles.saleText}>Notes: {item.notes}</Text>}
//             </View>
//             <View style={styles.itemButtons}>
//                 <TouchableOpacity
//                     onPress={() => {
//                         setEditItem(item);
//                         setEditItemName(item.item_name);
//                         setEditQuantity(item.quantity.toString());
//                         setEditUnitPrice(item.unit_price.toString());
//                         setEditDate(item.sale_date || '');
//                         setEditNotes(item.notes || '');
//                     }}
//                 >
//                     <Text style={styles.editBtn}>Edit</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => handleDelete(item.sale_id)}>
//                     <Text style={styles.deleteBtn}>Delete</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
//
//     return (
//         <View style={styles.container}>
//             {/* Header */}
//             <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
//                 <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
//                     <Text style={{ color: "#007bff", fontWeight: "600" }}>← Back to Dashboard</Text>
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Sales</Text>
//             </View>
//
//             {loading && <ActivityIndicator size="large" color="#2E8B57" style={{ marginVertical: 20 }} />}
//
//             {/* Total Sales Summary */}
//             <View style={styles.summaryCard}>
//                 <Text style={styles.summaryLabel}>Total Sales</Text>
//                 <Text style={styles.summaryAmount}>RWF {totalSales.toFixed(2)}</Text>
//             </View>
//
//             {/* Add Sale Form */}
//             <View style={styles.formContainer}>
//                 <Text style={styles.formTitle}>Add New Sale</Text>
//                 <TextInput
//                     placeholder="Item Name (e.g., Tomatoes)"
//                     style={styles.input}
//                     value={itemName}
//                     onChangeText={setItemName}
//                 />
//                 <TextInput
//                     placeholder="Quantity"
//                     style={styles.input}
//                     keyboardType="numeric"
//                     value={quantity}
//                     onChangeText={setQuantity}
//                 />
//                 <TextInput
//                     placeholder="Unit Price (RWF)"
//                     style={styles.input}
//                     keyboardType="numeric"
//                     value={unitPrice}
//                     onChangeText={setUnitPrice}
//                 />
//                 <TextInput
//                     placeholder="Sale Date (YYYY-MM-DD) - Optional"
//                     style={styles.input}
//                     value={date}
//                     onChangeText={setDate}
//                 />
//                 <TextInput
//                     placeholder="Notes - Optional"
//                     style={styles.input}
//                     value={notes}
//                     onChangeText={setNotes}
//                     multiline
//                 />
//                 <TouchableOpacity
//                     style={[styles.button, creating && styles.buttonDisabled]}
//                     onPress={handleCreateSale}
//                     disabled={creating}
//                 >
//                     <Text style={styles.buttonText}>{creating ? 'Adding...' : 'Add Sale'}</Text>
//                 </TouchableOpacity>
//             </View>
//
//             {/* Sales List */}
//             <Text style={styles.listTitle}>Recent Sales</Text>
//             <FlatList
//                 data={sales}
//                 keyExtractor={(item) => item.sale_id.toString()}
//                 renderItem={renderItem}
//                 contentContainerStyle={{ paddingBottom: 20 }}
//                 ListEmptyComponent={
//                     !loading ? (
//                         <Text style={styles.emptyText}>No sales found. Add your first sale above!</Text>
//                     ) : null
//                 }
//             />
//
//             {/* Edit Sale Modal */}
//             <Modal visible={!!editItem} transparent animationType="slide">
//                 <View style={styles.modalContainer}>
//                     <View style={styles.modalBox}>
//                         <ScrollView>
//                             <Text style={styles.modalTitle}>Edit Sale</Text>
//                             <TextInput
//                                 style={styles.input}
//                                 value={editItemName}
//                                 onChangeText={setEditItemName}
//                                 placeholder="Item Name"
//                             />
//                             <TextInput
//                                 style={styles.input}
//                                 value={editQuantity}
//                                 onChangeText={setEditQuantity}
//                                 placeholder="Quantity"
//                                 keyboardType="numeric"
//                             />
//                             <TextInput
//                                 style={styles.input}
//                                 value={editUnitPrice}
//                                 onChangeText={setEditUnitPrice}
//                                 placeholder="Unit Price"
//                                 keyboardType="numeric"
//                             />
//                             <TextInput
//                                 style={styles.input}
//                                 value={editDate}
//                                 onChangeText={setEditDate}
//                                 placeholder="Sale Date (YYYY-MM-DD)"
//                             />
//                             <TextInput
//                                 style={styles.input}
//                                 value={editNotes}
//                                 onChangeText={setEditNotes}
//                                 placeholder="Notes"
//                                 multiline
//                             />
//                             <TouchableOpacity style={styles.button} onPress={handleEdit}>
//                                 <Text style={styles.buttonText}>Save Changes</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity onPress={() => setEditItem(null)}>
//                                 <Text style={styles.cancelBtn}>Cancel</Text>
//                             </TouchableOpacity>
//                         </ScrollView>
//                     </View>
//                 </View>
//             </Modal>
//         </View>
//     );
// };
//
// export default SalesScreen;
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 16,
//         backgroundColor: '#fff'
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: 'bold',
//         color: '#333',
//     },
//     summaryCard: {
//         backgroundColor: '#2E8B57',
//         padding: 20,
//         borderRadius: 10,
//         marginBottom: 20,
//         alignItems: 'center',
//     },
//     summaryLabel: {
//         fontSize: 14,
//         color: '#fff',
//         marginBottom: 5,
//     },
//     summaryAmount: {
//         fontSize: 28,
//         fontWeight: 'bold',
//         color: '#fff',
//     },
//     formContainer: {
//         backgroundColor: '#f8f9fa',
//         padding: 15,
//         borderRadius: 10,
//         marginBottom: 20,
//     },
//     formTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         marginBottom: 10,
//         color: '#333',
//     },
//     listTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 10,
//         color: '#333',
//     },
//     input: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 8,
//         padding: 12,
//         marginBottom: 12,
//         backgroundColor: '#fff',
//     },
//     button: {
//         backgroundColor: '#2E8B57',
//         padding: 14,
//         borderRadius: 8,
//         alignItems: 'center',
//         marginTop: 5,
//     },
//     buttonDisabled: {
//         backgroundColor: '#95c5a8',
//     },
//     buttonText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         fontSize: 16,
//     },
//     saleItem: {
//         backgroundColor: '#f8f9fa',
//         padding: 15,
//         borderRadius: 8,
//         marginBottom: 10,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderLeftWidth: 4,
//         borderLeftColor: '#2E8B57',
//     },
//     itemTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#333',
//         marginBottom: 4,
//     },
//     saleText: {
//         fontSize: 14,
//         color: '#666',
//         marginTop: 2,
//     },
//     itemButtons: {
//         flexDirection: 'column',
//         alignItems: 'flex-end',
//     },
//     editBtn: {
//         color: '#007bff',
//         marginBottom: 8,
//         fontWeight: '600',
//     },
//     deleteBtn: {
//         color: '#dc3545',
//         fontWeight: '600',
//     },
//     emptyText: {
//         textAlign: 'center',
//         color: '#999',
//         marginTop: 20,
//         fontSize: 14,
//     },
//     modalContainer: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalBox: {
//         width: '85%',
//         maxHeight: '80%',
//         backgroundColor: '#fff',
//         padding: 20,
//         borderRadius: 10,
//     },
//     modalTitle: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         marginBottom: 15,
//         textAlign: 'center',
//         color: '#333',
//     },
//     cancelBtn: {
//         color: '#dc3545',
//         textAlign: 'center',
//         marginTop: 10,
//         fontWeight: '600',
//         fontSize: 16,
//     },
// });
// // import React, { useEffect, useState, useContext } from 'react';
// // import {
// //     View,
// //     Text,
// //     TextInput,
// //     TouchableOpacity,
// //     FlatList,
// //     StyleSheet,
// //     Alert,
// //     ActivityIndicator,
// // } from 'react-native';
// // import { useNavigation } from '@react-navigation/native';
// // import { AuthContext } from '../AuthContext';
// // import {
// //     getSales,
// //     createSale,
// //     updateSale,
// //     deleteSale,
// //     getTotalSales,
// //     SalePayload,
// // } from '../../api/ApiFunctions';
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// //
// // const SalesScreen = () => {
// //     const navigation = useNavigation();
// //     const { farmId } = useContext(AuthContext);
// //
// //     const [sales, setSales] = useState<any[]>([]);
// //     const [loading, setLoading] = useState(false);
// //     const [creating, setCreating] = useState(false);
// //     const [totalSales, setTotalSales] = useState(0);
// //
// //     const [itemName, setItemName] = useState('');
// //     const [quantity, setQuantity] = useState(0);
// //     const [unitPrice, setUnitPrice] = useState(0);
// //     const [notes, setNotes] = useState('');
// //     const [date, setDate] = useState('');
// //
// //     const [editItem, setEditItem] = useState<any>(null);
// //     const [editItemName, setEditItemName] = useState('');
// //     const [editQuantity, setEditQuantity] = useState('');
// //     const [editUnitPrice, setEditUnitPrice] = useState('');
// //     const [editNotes, setEditNotes] = useState('');
// //
// //     // ------------------ Redirect if no farm ------------------
// //     useEffect(() => {
// //         if (!farmId) {
// //             navigation.navigate('AddFarm');
// //         } else {
// //             loadSales();
// //             loadTotalSales();
// //         }
// //     }, [farmId]);
// //
// //     // ------------------ Load sales ------------------
// //     const loadSales = async () => {
// //         setLoading(true);
// //         try {
// //             const data = await getSales();
// //             setSales(data);
// //         } catch (err) {
// //             console.error('Fetch sales error:', err);
// //             Alert.alert('Error', 'Failed to fetch sales.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };
// //
// //     // ------------------ Load total sales ------------------
// //     const loadTotalSales = async () => {
// //         try {
// //             const total = await getTotalSales();
// //             setTotalSales(total);
// //         } catch (err) {
// //             console.error('Fetch total sales error:', err);
// //         }
// //     };
// //
// //     // ------------------ Create sale ------------------
// //     const handleCreateSale = async () => {
// //         if (!itemName || !quantity || !unitPrice) {
// //             return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
// //         }
// //
// //         const payload: SalePayload = {
// //             farm_id: farmId,
// //             item_name: itemName,
// //             quantity: Number(quantity),
// //             unit_price: Number(unitPrice),
// //             sale_date: date || undefined,
// //             notes: notes || "",
// //         };
// //
// //
// //         try {
// //             setCreating(true);
// //             // const token:string | null = await AsyncStorage.getItem("AccessToken");
// //             await createSale(payload);
// //             Alert.alert('Success', 'Sale added');
// //             setCreating(false);
// //             setItemName("");
// //             setQuantity(0 );
// //             setUnitPrice(0 );
// //             setNotes("");
// //             // await console.log(payload);
// //             await loadSales();
// //             await loadTotalSales();
// //         } catch (err) {
// //             console.error('Create sale error:', err);
// //             Alert.alert('Error', 'Failed to create sale');
// //         } finally {
// //             setCreating(false);
// //         }
// //     };
// //
// //     // ------------------ Delete sale ------------------
// //     const handleDelete = async (saleId: number) => {
// //         Alert.alert('Confirm', 'Delete this sale?', [
// //             { text: 'Cancel' },
// //             {
// //                 text: 'Delete',
// //                 onPress: async () => {
// //                     try {
// //                         await deleteSale(saleId);
// //                         loadSales();
// //                         loadTotalSales();
// //                     } catch (err) {
// //                         console.error('Delete sale error:', err);
// //                         Alert.alert('Error', 'Failed to delete sale');
// //                     }
// //                 },
// //                 style: 'destructive',
// //             },
// //         ]);
// //     };
// //
// //     // ------------------ Edit sale ------------------
// //     const handleEdit = async () => {
// //         if (!editItem) return;
// //         if (!editItemName || !editQuantity || !editUnitPrice) {
// //             return Alert.alert('Validation', 'Item name, quantity, and unit price are required');
// //         }
// //
// //         try {
// //             await updateSale(editItem.sale_id, {
// //                 item_name: editItemName,
// //                 quantity: Number(editQuantity),
// //                 unit_price: Number(editUnitPrice),
// //                 notes: editNotes || undefined,
// //             });
// //             setEditItem(null);
// //             await loadSales();
// //             await loadTotalSales();
// //             Alert.alert('Success', 'Sale updated');
// //         } catch (err) {
// //             console.error('Edit sale error:', err);
// //             Alert.alert('Error', 'Failed to update sale');
// //         }
// //     };
// //
// //     // ------------------ Render sale item ------------------
// //     const renderItem = ({ item }: { item: any }) => (
// //         <View style={styles.saleItem}>
// //
// //             <Text style={styles.saleText}>
// //                 {item.item_name} - {item.quantity} x ${item.unit_price} = ${item.total_amount}
// //             </Text>
// //             <Text style={styles.saleText}>Notes: {item.notes || 'None'}</Text>
// //             <Text style={styles.saleText}>Date: {item.sale_date}</Text>
// //             <View style={styles.itemButtons}>
// //                 <TouchableOpacity
// //                     onPress={() => {
// //                         setEditItem(item);
// //                         setEditItemName(item.item_name);
// //                         setEditQuantity(item.quantity.toString());
// //                         setEditUnitPrice(item.unit_price.toString());
// //                         setEditNotes(item.notes || '');
// //                     }}
// //                 >
// //                     <Text style={styles.editBtn}>Edit</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity onPress={() => handleDelete(item.sale_id)}>
// //                     <Text style={styles.deleteBtn}>Delete</Text>
// //                 </TouchableOpacity>
// //             </View>
// //         </View>
// //     );
// //
// //     return (
// //         <View style={styles.container}>
// //             <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
// //                 <TouchableOpacity onPress={() => navigation.navigate("Dashboard")}>
// //                     <Text style={{ color: "#007bff", fontWeight: "600" }}>Back to Dashboard</Text>
// //                 </TouchableOpacity>
// //             </View>
// //             <Text style={styles.title}>Sales (Total: RWF{totalSales})</Text>
// //             {loading ? (
// //                 <ActivityIndicator size="large" color="#2E8B57" />
// //             ) : (
// //                 <FlatList
// //                     data={sales}
// //                     keyExtractor={(item) => item.sale_id.toString()}
// //                     renderItem={renderItem}
// //                     contentContainerStyle={{ paddingBottom: 50 }}
// //                 />
// //             )}
// //
// //             {/* Add Sale Form */}
// //             <Text style={styles.subtitle}>Add New Sale</Text>
// //             <TextInput
// //                 placeholder="Item Name"
// //                 style={styles.input}
// //                 value={itemName}
// //                 onChangeText={setItemName}
// //             />
// //             <TextInput
// //                 placeholder="Quantity"
// //                 style={styles.input}
// //                 keyboardType="numeric"
// //                 value={quantity}
// //                 onChangeText={setQuantity}
// //             />
// //             <TextInput
// //                 placeholder="Unit Price"
// //                 style={styles.input}
// //                 keyboardType="numeric"
// //                 value={unitPrice}
// //                 onChangeText={setUnitPrice}
// //             />
// //             <TextInput
// //                 placeholder="Notes (optional)"
// //                 style={styles.input}
// //                 value={notes}
// //                 onChangeText={setNotes}
// //             />
// //             <TouchableOpacity style={styles.button} onPress={handleCreateSale} disabled={creating}>
// //                 <Text style={styles.buttonText}>{creating ? 'Saving...' : 'Add Sale'}</Text>
// //             </TouchableOpacity>
// //
// //             {/* Edit Sale Modal */}
// //             {editItem && (
// //                 <View style={styles.editModal}>
// //                     <Text style={styles.modalTitle}>Edit Sale</Text>
// //                     <TextInput
// //                         style={styles.input}
// //                         value={editItemName}
// //                         onChangeText={setEditItemName}
// //                         placeholder="Item Name"
// //                     />
// //                     <TextInput
// //                         style={styles.input}
// //                         value={editQuantity}
// //                         onChangeText={setEditQuantity}
// //                         placeholder="Quantity"
// //                         keyboardType="numeric"
// //                     />
// //                     <TextInput
// //                         style={styles.input}
// //                         value={editUnitPrice}
// //                         onChangeText={setEditUnitPrice}
// //                         placeholder="Unit Price"
// //                         keyboardType="numeric"
// //                     />
// //                     <TextInput
// //                         style={styles.input}
// //                         value={editNotes}
// //                         onChangeText={setEditNotes}
// //                         placeholder="Notes"
// //                     />
// //                     <TouchableOpacity style={styles.button} onPress={handleEdit}>
// //                         <Text style={styles.buttonText}>Save</Text>
// //                     </TouchableOpacity>
// //                     <TouchableOpacity onPress={() => setEditItem(null)}>
// //                         <Text style={styles.cancelBtn}>Cancel</Text>
// //                     </TouchableOpacity>
// //                 </View>
// //             )}
// //         </View>
// //     );
// // };
// //
// // export default SalesScreen;
// //
// // const styles = StyleSheet.create({
// //     container: { flex: 1, padding: 16, backgroundColor: '#fff' },
// //     title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
// //     subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
// //     input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
// //     button: { backgroundColor: '#2E8B57', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
// //     buttonText: { color: '#fff', fontWeight: 'bold' },
// //     saleItem: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 8, marginBottom: 10 },
// //     saleText: { fontSize: 14 },
// //     itemButtons: { flexDirection: 'row', marginTop: 8 },
// //     editBtn: { color: 'blue', marginRight: 15 },
// //     deleteBtn: { color: 'red' },
// //     editModal: {
// //         position: 'absolute',
// //         top: '20%',
// //         left: '10%',
// //         width: '80%',
// //         backgroundColor: '#fff',
// //         padding: 16,
// //         borderRadius: 10,
// //         elevation: 5,
// //     },
// //     modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
// //     cancelBtn: { color: 'red', textAlign: 'center', marginTop: 10 },
// // });
