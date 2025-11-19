import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import ApiManager from '../../api/ApiManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SalesScreen = ({ navigation }: { navigation: any }) => {
    const [sales, setSales] = useState([]);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const fetchSales = async () => {
        const token = await AsyncStorage.getItem('AccessToken');
        try {
            const res = await ApiManager.get('sales', { headers: { Authorization: `Bearer ${token}` } });
            setSales(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addSale = async () => {
        if (!amount) return Alert.alert('Please enter an amount');
        const token = await AsyncStorage.getItem('AccessToken');
        try {
            await ApiManager.post('sales', { amount: Number(amount) }, { headers: { Authorization: `Bearer ${token}` } });
            setAmount('');
            fetchSales();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchSales);
        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Sales</Text>
            <FlatList
                data={sales}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>${item.amount} - {new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                )}
            />
            <TextInput placeholder="Description" style={styles.input} value={description} onChangeText={setDescription} />
            <TextInput placeholder="Amount" keyboardType="numeric" style={styles.input} value={amount} onChangeText={setAmount} />
            <Button title="Add Sale" onPress={addSale} />
        </View>
    );
};

export default SalesScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    item: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginVertical: 10, borderRadius: 5 },
});
