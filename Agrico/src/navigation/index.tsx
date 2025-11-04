import React, {useEffect, useState} from 'react';
import { Image, View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeaderButton, Text } from '@react-navigation/elements';
import {
  createStaticNavigation,
  StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import bell from '../assets/bell.png';
import newspaper from '../assets/newspaper.png';
import { Home } from './screens/Home';
import { Profile } from './screens/Profile';
import { Settings } from './screens/Settings';
import { Updates } from './screens/Updates';
import { NotFound } from './screens/NotFound';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';

// Bottom Tabs
const HomeTabs = createBottomTabNavigator({
  screens: {
    DashboardScreen: {
      screen: DashboardScreen,
      options: {
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Image
            source={newspaper}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Updates: {
      screen: Updates,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            source={bell}
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    HomeTabs: {
      screen: HomeTabs,
      options: {
        title: 'Home',
        headerShown: false,
      },
    },
    Profile: {
      screen: Profile,
      linking: {
        path: ':user(@[a-zA-Z0-9-_]+)',
        parse: {
          user: (value) => value.replace(/^@/, ''),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
    },
    AuthScreen: {
      screen: AuthScreen,
      options: {
        title: 'Login',
        headerShown: false,
      },},
      DashboardScreen: {
        screen: DashboardScreen,
        options: {
          title: 'Dashboard',
          headerShown: false,
        },},
    Settings: {
      screen: Settings,
      options: ({ navigation }) => ({
        presentation: 'modal',
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
      }),
    },
    NotFound: {
      screen: NotFound,
      options: {
        title: '404',
      },
      linking: {
        path: '*',
      },
    },
  },
});

// export const Navigation = createStaticNavigation(RootStack);

// Conditional Navigation Wrapper:
export const Navigation=({theme, linking, onReady})=> {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!token);
      setIsLoading(false);
    };
    checkLogin();
  }, []);
  if (isLoading) {
    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
          <ActivityIndicator size="large"/>
        </View>
    );
  }

  const AppStack = createNativeStackNavigator({
    screens: isLoggedIn
        ? {
          DashboardScreen: {
            screen: DashboardScreen,
            options: {
              title: 'Dashboard',
              headerShown: false,
            }, HomeTabs: {
              screen: HomeTabs,
              options: {headerShown: false},
            },
          }
        } : {
          AuthScreen: {
            screen: AuthScreen,
            options: {headerShown: false},
          },
        },
  });

  const AppNavigation = createStaticNavigation(AppStack)


  type RootStackParamList = StaticParamList<typeof RootStack>;

  return (
      <AppNavigation theme={theme} linking={linking} onReady={onReady}/>
  );
}
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {
    }
  }
}