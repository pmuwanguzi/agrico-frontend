import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import {NavigationContainer, useNavigation} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Button } from "react-native";

import { Home } from "./screens/Home";
import { Settings } from "./screens/Settings";
import { NotFound } from "./screens/NotFound";
import AuthScreen from "./screens/AuthScreen";
import SignupScreen from "./screens/SignupScreen";
import DashboardScreen from "./screens/DashboardScreen";

const Tabs = createBottomTabNavigator();

function MyTabs() {
    const { logout } = useContext(AuthContext); // get logout from context

    return (
        <Tabs.Navigator
            initialRouteName="Dashboard"
            screenOptions={{
                headerRight: () => <Button title="Logout" onPress={logout} color="#d33" />,
                animation: "shift",
            }}
        >
            <Tabs.Screen name="Home" component={Home} />
            <Tabs.Screen name="Dashboard" component={DashboardScreen} />
            <Tabs.Screen name="Settings" component={Settings} />
        </Tabs.Navigator>
    );
}

const Stack = createNativeStackNavigator();

export function Navigation() {
    const { isLoggedIn } = useContext(AuthContext);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <Stack.Screen name="MainTabs" component={MyTabs} />
                ) : (
                    <>
                        <Stack.Screen name="Login" component={AuthScreen} />
                        <Stack.Screen name="SignupScreen" component={SignupScreen} options={{headerShown: true}} />
                    </>
                )}
                <Stack.Screen name="NotFound" component={NotFound} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

