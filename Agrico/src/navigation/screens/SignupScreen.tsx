import React, {useContext, useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import {user_signup , user_login} from "../../api/user_api";
import {AuthContext} from "../AuthContext";


const SignupScreen = ( ) => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password1, setPassword1] = useState('');
    const [password2, setPassword2] = useState('');
    const [role, setRole] = useState('admin');
    const { login } = useContext(AuthContext);
    const isValidEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value);
    };
    // Only allowing rwanda phone numbers
    const isValidPhone = (phone) => {
        const regex = /^(?:\+?250)?0?7[2389]\d{7}$/;
        return regex.test(phone);
    };

    const handleRegister = async () => {
        // handle registration logic
       if(!isValidEmail(email)) {
           alert("Please enter a valid Email");
           return;
       } else {
           if (!isValidPhone(phone)) {
               alert("Please enter a Rwanda valid Phone Number");
           }else{
               if (!fullName || !email || !phone || !password1 || !password2) {
                   alert("Please enter all the fields");

               }else{
                   if (password1 !== password2) {
                       alert("Passwords do not match");
                   }else{

                       const result = await user_signup({
                           email: email.toLowerCase(),
                           password: password1,
                           full_name: fullName,
                           phone: phone,
                           role: "admin",
                       });
                       if(result.status === 201){
                           alert("Registration Successful . Please continue to login screen and login");
                       }else{
                           alert(result.error)
                       }


                   }
               }
           }

       }




    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Agrico</Text>
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
                value={password1}
                onChangeText={setPassword1}
            />
            <TextInput
                placeholder="Password"
                secureTextEntry
                style={styles.input}
                value={password2}
                onChangeText={setPassword2}
            />
            {/*<Picker*/}
            {/*    selectedValue={role}*/}
            {/*    onValueChange={(itemValue) => setRole(itemValue)}*/}
            {/*    style={{ width: '100%' }}*/}
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