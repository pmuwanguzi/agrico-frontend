import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../AuthContext";
import { user_login } from "../../api/user_api";
import {useNavigation} from "@react-navigation/native";

const AuthScreen = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login } = useContext(AuthContext);
    const navigation = useNavigation();
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter all the fields");
            return;
        }

        try {
            const result = await user_login({
                email: email.toLowerCase(),
                password: password,
            });

            if (result.status === 200) {
                // Save token and update global login state
                await login(result.data.access_token);
                // alert("Login Successful");
            } else {
                alert("Invalid credentials. Please try again or register an account.");
            }
        } catch (err) {
            console.error(err);
            alert("An error occurred during login.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Farm Management Login</Text>

            <TextInput
                placeholder="Email"
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />

            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
            />

            <View style={styles.buttonContainer}>
                <Button title="Login" onPress={handleLogin} />
                <Button
                    title="Register"
                    onPress={() => navigation.navigate("SignupScreen")}

                />
            </View>
        </View>
    );
};

export default AuthScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
    buttonContainer: { flexDirection: "row", justifyContent: "space-around" },
});
