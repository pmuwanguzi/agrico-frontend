import React, {useEffect, useState} from 'react';
import {
  createComponentForStaticNavigation,
  createStaticNavigation,
  NavigationContainer, NavigatorScreenParams, StaticScreenProps
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import {Home} from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import AuthScreen from './screens/AuthScreen';
import SignupScreen from './screens/SignupScreen';
import DashboardScreen from './screens/DashboardScreen';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackParamList<typeof MyStack>{}
  }
}

const MyStack = createNativeStackNavigator({
  groups:{
    LoggedIn: {
      if: () => false, //If User is logged in
      screens: {
        MyTabsScreens: {
          screen: MyTabs,
          options: {
            headerShown: false,
          },
          DashboardScreen: {
            screen: DashboardScreen,
            options: {
              title: 'Dashboard',
            }
          },
        },
      }
    },
    LoggedOut: {
      if: () => true,
      screens:{
        AuthScreen: {
          screen: AuthScreen,
          options: {
            headerShown: false,
            title: 'Login'
          }
        },
        SignupScreen: {
          screen: SignupScreen,
          options: {
            title: 'Sign Up',
          }
        },
      }
    },
    Common:{
      navigationKey: "user",
      screens:{
        NotFound: {
          screen: NotFound,
          options: {
            title: 'Not Found',
          },
        },
      }
    }
  }
});

// const MyStackComponent = createComponentForStaticNavigation(MyStack, "Stack");
export const RootNavigation = createStaticNavigation(MyStack)
const Tabs = createBottomTabNavigator();
type MyTabsParamList = {
  Home: undefined;
  Dashboard: {userId: string};
  Settings: undefined;
  SignUp: undefined;
  AuthScreen: undefined;
};
type MyTabsProps = StaticScreenProps<NavigatorScreenParams<MyTabsParamList>>

function MyTabs(_: MyTabsProps){
  return (
      <Tabs.Navigator screenOptions={{animation: "shift",}}>
        <Tabs.Screen name="Home" component={AuthScreen} />
        <Tabs.Screen name="Dashboard" component={DashboardScreen} />
        <Tabs.Screen name="Settings" component={Settings} />
        <Tabs.Screen name="SignUp" component={SignupScreen } />
      </Tabs.Navigator>
  )
}

export function Navigation() {
  return (
      <RootNavigation/>
      // <NavigationContainer>
      //     <MyTabs />
      //  </NavigationContainer>
  );
}