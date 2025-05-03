// App.js
import React, { useState, useEffect } from 'react';
import './firebaseConfig'; // Import to initialize Firebase
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from './firebaseConfig';

// Import screens
import LandingScreen from './screens/LandingScreen';
import CameraScreen from './screens/CameraScreen';
import ResultsScreen from './screens/ResultsScreen';
import AiChatScreen from './screens/AiChatScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HistoryScreen from './screens/HistoryScreen'; // <-- Import History screen

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) { console.error("Auth service not available."); setInitializing(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (initializing) { setInitializing(false); }
      console.log('Auth State Changed:', currentUser ? `User Logged In (${currentUser.email})` : 'User Logged Out');
    });
    return unsubscribe;
  }, []);

  if (initializing) { return null; }

  return (
    <NavigationContainer>
      {user ? (
        // Main App Stack (When Logged In)
        <MainStack.Navigator initialRouteName="Landing">
          <MainStack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
          <MainStack.Screen name="Camera" component={CameraScreen} options={{ title: 'Scan Barcode' }} />
          <MainStack.Screen name="Results" component={ResultsScreen} options={{ title: 'Product Analysis' }} />
          <MainStack.Screen name="AiChat" component={AiChatScreen} options={{ title: 'AI Food Assistant' }} />
          {/* --- ADD HISTORY SCREEN TO MAIN STACK --- */}
          <MainStack.Screen name="History" component={HistoryScreen} options={{ title: 'Scan History' }} />
          {/* --- END ADD HISTORY SCREEN --- */}
        </MainStack.Navigator>
      ) : (
        // Auth Stack (When Logged Out)
        <AuthStack.Navigator initialRouteName="Login">
          <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
          <AuthStack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
}