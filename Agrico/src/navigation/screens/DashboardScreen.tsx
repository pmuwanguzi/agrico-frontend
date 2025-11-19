import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import ApiManager from '../../api/ApiManager';

const DashboardScreen = ({ navigation }: { navigation: any }) => {
    const [data, setData] = useState({ livestock: 0, crops: 0, sales: 0, expenses: 0 });
    const [loading, setLoading] = useState(true);
    const [hasFarms, setHasFarms] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('AccessToken');
            if (!token) throw new Error('No access token found');

            // Fetch user's farms
            const farmResponse = await ApiManager.get('/farms/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!farmResponse.data.farms || farmResponse.data.farms.length === 0) {
                setHasFarms(false);
                setLoading(false);
                return; // skip stats if no farms
            }

            setHasFarms(true);

            // If farms exist, fetch dashboard stats
            const statsResponse = await ApiManager.get('/dashboard/', { // you need to create this endpoint
                headers: { Authorization: `Bearer ${token}` },
            });

            setData(statsResponse.data);
        } catch (error: any) {
            console.log('Dashboard fetch error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData(); // refresh when returning to dashboard
        });
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('AccessToken');
        navigation.replace('Auth');
    };

    if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;

    // Redirect to AddFarm if no farms
    if (!hasFarms) {
        return (
            <View style={styles.noFarmsContainer}>
                <Text style={styles.header}>Welcome!</Text>
                <Text style={styles.subHeader}>You don’t have any farms yet.</Text>
                <Button title="Add Your First Farm" onPress={() => navigation.navigate('AddFarm')} />
                <View style={{ marginTop: 20 }}>
                    <Button title="Logout" onPress={handleLogout} color="#d33" />
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Farm Dashboard</Text>

            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>{data.livestock}</Text>
                    <Text>Livestock</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>{data.crops}</Text>
                    <Text>Crops</Text>
                </View>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>RWF {data.sales}</Text>
                    <Text>Current Sales</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>RWF {data.expenses}</Text>
                    <Text>Current Expenses</Text>
                </View>
            </View>

            <View style={styles.navButtons}>
                <Button title="Livestock" onPress={() => navigation.navigate('Livestock')} />
                <Button title="Crops" onPress={() => navigation.navigate('Crops')} />
                <Button title="Sales Tracking" onPress={() => navigation.navigate('Sales')} />
                <Button title="Expenses Tracking" onPress={() => navigation.navigate('Expenses')} />
                <Button title="Reports & Analytics" onPress={() => navigation.navigate('ReportsAnalytics')} />
                <Button title="Logout" onPress={handleLogout} color="#d33" />
            </View>
        </ScrollView>
    );
};

export default DashboardScreen;

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 80 },
    noFarmsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    subHeader: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    summaryBox: {
        backgroundColor: '#def',
        padding: 15,
        borderRadius: 10,
        width: '45%',
        alignItems: 'center',
    },
    summaryNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
    navButtons: {
        marginTop: 20,
        justifyContent: 'space-around',
        height: 200,
    },
});
