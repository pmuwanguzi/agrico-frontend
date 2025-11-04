import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";


const DashboardScreen = ({ navigation }) => {
    const handleLogout =async ()=>{
        await AsyncStorage.removeItem("userToken");
        navigation.replace('Auth');
    };
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Farm Dashboard</Text>

            {/* Summary Boxes */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>15</Text>
                    <Text>Livestock</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>8</Text>
                    <Text>Crops</Text>
                </View>
            </View>
            <View style={styles.summaryRow}>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>$3,500</Text>
                    <Text>Sales Last Month</Text>
                </View>
                <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>$2,200</Text>
                    <Text>Expenses Last Month</Text>
                </View>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navButtons}>
                <Button title="Livestock & Crops" onPress={() => navigation.navigate('LivestockAndCrops')} />
                <Button title="Sales Tracking" onPress={() => navigation.navigate('SalesTracking')} />
                <Button title="Expenses Tracking" onPress={() => navigation.navigate('ExpenseTracking')} />
                <Button title="Reports & Analytics" onPress={() => navigation.navigate('ReportsAnalytics')} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20 },
    header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
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

export default DashboardScreen;
