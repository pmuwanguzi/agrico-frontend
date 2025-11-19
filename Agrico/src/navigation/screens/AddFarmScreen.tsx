import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiManager from '../../api/ApiManager'; // make sure path is correct

const AddFarmScreen = ({ navigation }: { navigation: any }) => {
    const [farmName, setFarmName] = useState('');
    const [location, setLocation] = useState('');
    const [size, setSize] = useState('');

    const handleCreateFarm = async () => {
        if (!farmName.trim()) {
            return Alert.alert('Validation Error', 'Farm name is required');
        }

        try {
            const token = await AsyncStorage.getItem('AccessToken');
            if (!token) throw new Error('No access token found');

            const response = await ApiManager.post(
                '/farms/',
                {
                    farm_name: farmName,
                    location,
                    size_acres: size ? Number(size) : undefined,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            Alert.alert('Success', 'Farm created successfully!');
            navigation.navigate('MainTabs'); // go back to dashboard
        } catch (error: any) {
            console.log('Create farm error:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to create farm. Check console for details.');
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('AccessToken');
        navigation.replace('Auth'); // redirect to login
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Add New Farm</Text>

            <TextInput
                placeholder="Farm Name"
                value={farmName}
                onChangeText={setFarmName}
                style={styles.input}
            />
            <TextInput
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
                style={styles.input}
            />
            <TextInput
                placeholder="Size (acres)"
                value={size}
                onChangeText={setSize}
                keyboardType="numeric"
                style={styles.input}
            />

            <View style={styles.buttonContainer}>
                <Button title="Create Farm" onPress={handleCreateFarm} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
            </View>

            <View style={styles.buttonContainer}>
                <Button title="Logout" onPress={handleLogout} color="#d33" />
            </View>
        </ScrollView>
    );
};

export default AddFarmScreen;

const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 80,
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        fontSize: 16,
    },
    buttonContainer: {
        marginBottom: 15,
    },
});
