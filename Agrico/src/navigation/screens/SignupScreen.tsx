import React, { useState } from 'react';
import { View, Text, TextInput, Button, Picker, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignupScreen = ( ) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('farmer');

    const handleLogin = async () => {
    //     // TODO: handle login logic
        await AsyncStorage.setItem("userToken", "dummy_token");
        navigation.replace('Dashboard');
    };

    const handleRegister = async () => {
        // TODO: handle registration logic
        await AsyncStorage.setItem("userToken", "dummy_token");
        navigation.replace('Dashboard');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Farm Management SignUp</Text>

            <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
            />
            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />
            {/*<Picker*/}
            {/*    selectedValue={role}*/}
            {/*    style={styles.picker}*/}
            {/*    onValueChange={(itemValue) => setRole(itemValue)}*/}
            {/*>*/}
            {/*    <Picker.Item label="Farmer" value="farmer" />*/}
            {/*    <Picker.Item label="Farm Manager" value="manager" />*/}
            {/*    <Picker.Item label="Admin" value="admin" />*/}
            {/*</Picker>*/}
            <View style={styles.buttonContainer}>
                {/*<Button title="Login" onPress={handleLogin} />*/}
                <Button title="Register" onPress={handleRegister} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    picker: { height: 50, marginBottom: 15 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-around' },
});

export default SignupScreen;