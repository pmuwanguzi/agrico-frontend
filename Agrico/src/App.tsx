import { Assets as NavigationAssets } from '@react-navigation/elements';

import { Asset } from 'expo-asset';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import {Navigation}  from './navigation';
import {AuthProvider} from "./navigation/AuthContext"



export function App() {
  return (
      <AuthProvider>
        <Navigation/>
      </AuthProvider>

  );
}
