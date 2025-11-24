// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, {useContext, useEffect, useState} from 'react';
// import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
// import ApiManager from '../../api/ApiManager';
// import {AuthContext} from "../AuthContext";
//
// const DashboardScreen = ({ navigation }: { navigation: any }) => {
//     const [data, setData] = useState({ livestock: 0, crops: 0, sales: 0, expenses: 0 });
//     const [loading, setLoading] = useState(true);
//     const [hasFarms, setHasFarms] = useState(true);
//     const { farmId } = useContext(AuthContext);
//     const {logout} = useContext(AuthContext);
//     const loadData = async () => {
//         setLoading(true);
//         try {
//             const token = await AsyncStorage.getItem('AccessToken');
//             if (!token) throw new Error('No access token found');
//
//             // Fetch user's farms
//             const farmResponse = await ApiManager.get('/farms/', {
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//
//             if (!farmResponse.data.farms || farmResponse.data.farms.length === 0) {
//                 setHasFarms(false);
//                 setLoading(false);
//                 return; // skip stats if no farms
//             }
//
//             setHasFarms(true);
//
//             // If farms exist, fetch dashboard stats
//             const statsResponse = await ApiManager.get('/dashboard/', { // you need to create this endpoint
//                 headers: { Authorization: `Bearer ${token}` },
//             });
//             console.log(statsResponse.data)
//
//             setData(statsResponse.data);
//             // console.log(data)
//         } catch (error: any) {
//             console.log('Dashboard fetch error:', error.response?.data || error.message);
//             Alert.alert('Error', 'Failed to fetch dashboard data.');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     useEffect(() => {
//         const unsubscribe = navigation.addListener('focus', () => {
//             loadData(); // refresh when returning to dashboard
//         });
//         return unsubscribe;
//     }, [navigation]);
//
//     const handleLogout = async () => {
//         await AsyncStorage.removeItem('AccessToken');
//         // navigation.navigate('Login');
//         logout()
//     };
//
//     if (loading) return <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center' }} />;
//
//     // Redirect to AddFarm if no farms
//     if (!hasFarms) {
//         return (
//             <View style={styles.noFarmsContainer}>
//                 <Text style={styles.header}>Welcome!</Text>
//                 <Text style={styles.subHeader}>You don’t have any farms yet.</Text>
//                 <Button title="Add Your First Farm" onPress={() => navigation.navigate('AddFarm')} />
//                 <View style={{ marginTop: 20 }}>
//                     <Button title="Logout" onPress={handleLogout} color="#d33" />
//                 </View>
//             </View>
//         );
//     }
//
//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             <Text style={styles.header}>Farm Dashboard</Text>
//
//             <View style={styles.summaryRow}>
//                 <View style={styles.summaryBox}>
//                     <Text style={styles.summaryNumber}>{data?.total_livestock ?? 0}</Text>
//                     <Text>Livestock</Text>
//                 </View>
//                 <View style={styles.summaryBox}>
//                     <Text style={styles.summaryNumber}>{data?.total_crops ?? 0}</Text>
//                     <Text>Crop Types</Text>
//                 </View>
//             </View>
//
//             <View style={styles.summaryRow}>
//                 <View style={styles.summaryBox}>
//                     <Text style={styles.summaryNumber}>{data?.total_sales ?? 0}</Text>
//                     <Text>Current Sales</Text>
//                 </View>
//                 <View style={styles.summaryBox}>
//                     <Text style={styles.summaryNumber}> {data?.total_expenses ?? 0}</Text>
//                     <Text>Current Expenses(RWF)</Text>
//                 </View>
//             </View>
//
//             <View style={styles.navButtons}>
//                 <Button title="Livestock" onPress={() => navigation.navigate('Livestock')} />
//                 <Button title="Crops" onPress={() => navigation.navigate('Crops')} />
//                 <Button title="Sales Tracking" onPress={() => navigation.navigate('Sales')} />
//                 <Button title="Expenses Tracking" onPress={() => navigation.navigate('Expenses')} />
//                 <Button title="Reports & Analytics" onPress={() => navigation.navigate('ReportsAnalytics')} />
//                 <Button title="Logout" onPress={handleLogout} color="#d33" />
//             </View>
//         </ScrollView>
//     );
// };
//
// export default DashboardScreen;
//
// const styles = StyleSheet.create({
//     container: { padding: 20, paddingTop: 80 },
//     noFarmsContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
//     header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
//     subHeader: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
//     summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
//     summaryBox: {
//         backgroundColor: '#def',
//         padding: 15,
//         borderRadius: 10,
//         width: '45%',
//         alignItems: 'center',
//     },
//     summaryNumber: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
//     navButtons: {
//         marginTop: 20,
//         justifyContent: 'space-around',
//         height: 200,
//     },
// });
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import ApiManager from '../../api/ApiManager';
import { AuthContext } from "../AuthContext";

interface DashboardData {
    total_farms: number;
    total_livestock: number;
    total_crops: number;
    total_sales: number;
    total_expenses: number;
    net_profit: number;
    farms?: any[];
    recent_sales?: any[];
    recent_expenses?: any[];
}

const DashboardScreen = ({ navigation }: { navigation: any }) => {
    const [data, setData] = useState<DashboardData>({
        total_farms: 0,
        total_livestock: 0,
        total_crops: 0,
        total_sales: 0,
        total_expenses: 0,
        net_profit: 0
    });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasFarms, setHasFarms] = useState(true);
    const { logout } = useContext(AuthContext);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem('AccessToken');
            if (!token) throw new Error('No access token found');

            // Fetch dashboard stats
            const statsResponse = await ApiManager.get('/dashboard/', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const dashboardData = statsResponse.data;
            setData(dashboardData);
            setHasFarms(dashboardData.total_farms > 0);

        } catch (error: any) {
            console.error('Dashboard fetch error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to fetch dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            loadData();
        });
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('AccessToken');
                        logout();
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2E8B57" />
                <Text style={styles.loadingText}>Loading dashboard...</Text>
            </View>
        );
    }

    // Redirect to AddFarm if no farms
    if (!hasFarms) {
        return (
            <View style={styles.noFarmsContainer}>
                <Text style={styles.welcomeHeader}>🌾 Welcome to Agrico!</Text>
                <Text style={styles.subHeader}>Get started by adding your first farm</Text>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('AddFarm')}
                >
                    <Text style={styles.primaryButtonText}>Add Your First Farm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isProfitable = data.net_profit >= 0;

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E8B57']} />
            }
        >
            <Text style={styles.header}>Farm Dashboard</Text>
            <Text style={styles.subTitle}>Your farm at a glance</Text>

            {/* Farm Count */}
            {data.total_farms > 0 && (
                <View style={styles.farmCountCard}>
                    <Text style={styles.farmCountText}>
                        Managing {data.total_farms} {data.total_farms === 1 ? 'Farm' : 'Farms'}
                    </Text>
                </View>
            )}

            {/* Key Metrics */}
            <View style={styles.metricsGrid}>
                <View style={[styles.metricCard, styles.livestockCard]}>
                    <Text style={styles.metricNumber}>{data.total_livestock}</Text>
                    <Text style={styles.metricLabel}>Total Livestock</Text>
                </View>

                <View style={[styles.metricCard, styles.cropsCard]}>
                    <Text style={styles.metricNumber}>{data.total_crops}</Text>
                    <Text style={styles.metricLabel}>Crop Types</Text>
                </View>
            </View>

            {/* Financial Summary */}
            <View style={styles.financialSection}>
                <Text style={styles.sectionTitle}>Financial Summary</Text>

                <View style={styles.financialCard}>
                    <View style={styles.financialRow}>
                        <Text style={styles.financialLabel}>Total Sales</Text>
                        <Text style={styles.salesAmount}>
                            RWF {data.total_sales.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.financialRow}>
                        <Text style={styles.financialLabel}>Total Expenses</Text>
                        <Text style={styles.expensesAmount}>
                            RWF {data.total_expenses.toFixed(2)}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.financialRow}>
                        <Text style={styles.profitLabel}>Net Profit/Loss</Text>
                        <Text style={[
                            styles.profitAmount,
                            isProfitable ? styles.profitPositive : styles.profitNegative
                        ]}>
                            {isProfitable ? '+' : ''}RWF {data.net_profit.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Livestock')}
                    >
                        <Text style={styles.actionIcon}>🐄</Text>
                        <Text style={styles.actionText}>Livestock</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Crops')}
                    >
                        <Text style={styles.actionIcon}>🌾</Text>
                        <Text style={styles.actionText}>Crops</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Sales')}
                    >
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionText}>Sales</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Expenses')}
                    >
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionText}>Expenses</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
                style={styles.logoutButtonBottom}
                onPress={handleLogout}
            >
                <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default DashboardScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 14,
    },
    noFarmsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        backgroundColor: '#f8f9fa',
    },
    welcomeHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#2E8B57',
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2E8B57',
    },
    subTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 16,
        marginBottom: 30,
        textAlign: 'center',
        color: '#666',
    },
    farmCountCard: {
        backgroundColor: '#e8f5e9',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#2E8B57',
    },
    farmCountText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E8B57',
    },
    metricsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    metricCard: {
        padding: 20,
        borderRadius: 12,
        width: '48%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    livestockCard: {
        backgroundColor: '#fff3e0',
    },
    cropsCard: {
        backgroundColor: '#e8f5e9',
    },
    metricNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    metricLabel: {
        fontSize: 13,
        color: '#666',
        textAlign: 'center',
    },
    financialSection: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    financialCard: {
        backgroundColor: '#fff',
        padding: 18,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    financialRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    financialLabel: {
        fontSize: 15,
        color: '#666',
    },
    salesAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2E8B57',
    },
    expensesAmount: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ff6b6b',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    profitLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    profitAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    profitPositive: {
        color: '#2E8B57',
    },
    profitNegative: {
        color: '#d32f2f',
    },
    actionsSection: {
        marginBottom: 25,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    primaryButton: {
        backgroundColor: '#2E8B57',
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#dc3545',
        width: '100%',
        alignItems: 'center',
    },
    logoutButtonBottom: {
        backgroundColor: '#fff',
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#dc3545',
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#dc3545',
        fontSize: 16,
        fontWeight: '600',
    },
});