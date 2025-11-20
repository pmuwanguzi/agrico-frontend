import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image } from "react-native";
import { AuthContext } from "../AuthContext";
import { user_login } from "../../api/user_api";
import { useNavigation } from "@react-navigation/native";
import { getFarms } from "../../api/ApiFunctions";

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
            // 1️⃣ Authenticate user
            const result = await user_login({
                email: email.toLowerCase(),
                password: password,
            });

            if (result.status === 200) {
                const token = result.data.access_token;

                // 2️⃣ Update global login state
                await login(token);

                // 3️⃣ Fetch farms for the logged-in user
                const farms = await getFarms();

                if (farms.length === 0) {
                    // No farm yet → navigate to AddFarm
                    navigation.navigate("AddFarm");
                } else {
                    // Use first farm
                    const firstFarmId = farms[0].farm_id;
                    // Save selected farm in context (if your AuthContext supports it)
                    await login(token, firstFarmId);
                    navigation.replace("MainTabs");
                }
            } else {
                alert("Invalid credentials. Please try again or register an account.");
            }
        } catch (err: any) {
            console.error("Login Error:", err.response?.data || err.message || err);
            alert("An error occurred during login. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Image source={require("../../assets/leafy.png")} style={styles.icon}/>
            <Text style={styles.textTop}>Welcome Back.</Text>
            <Text style={styles.text}>Login to manage your farm efficiently.</Text>

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
                    onPress={() => navigation.navigate("SignUp")}
                />
            </View>
        </View>
    );
};

export default AuthScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 10, marginBottom: 15, borderRadius: 5 },
    buttonContainer: { flexDirection: "row", justifyContent: "space-around" },
    icon: { position: 'absolute', top: 131, left: 168, width: 54, height: 54, backgroundColor: "" },
    rectangle: { position: "absolute", top: 118, left: 155, width: 80, height: 80, backgroundColor: "#4CAF50", borderRadius: 15 },
    text: { position: "absolute", top: 280, left: 52, fontFamily: "Inter", fontSize: 16, lineHeight: 24, fontWeight: "400", color: "#5F5F5F" },
    textTop: { position: "absolute", top: 239, left: 104, fontFamily: "Inter", fontSize: 24, lineHeight: 32, fontWeight: "700", color: "#1A1A1A" },
});
