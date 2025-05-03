// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// Import Firebase auth functions and the initialized auth object
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig.js is in the root

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Basic input check
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    // Check if auth was initialized correctly
    if (!auth) {
        Alert.alert("Error", "Firebase Auth is not initialized correctly. Check firebaseConfig.js and .env file.");
        return;
    }

    setIsLoading(true);
    try {
      // Call Firebase Authentication sign in function
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Signed in
      const user = userCredential.user;
      console.log('Logged in user:', user.email);
      Alert.alert('Login Successful', `Welcome back, ${user.email}!`);
      // --- TODO: Navigate to main app stack (We'll do this in the next step) ---

    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Login Error:', errorCode, errorMessage);
      // Provide user-friendly error messages
      let friendlyMessage = "Login failed. Please try again.";
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        friendlyMessage = "Invalid email or password.";
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      }
      Alert.alert('Login Failed', friendlyMessage);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <View style={styles.buttonContainer}>
         {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
         ) : (
            <Button title="Login" onPress={handleLogin} />
         )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} disabled={isLoading}>
        <Text style={styles.switchText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles (same as before)
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f8f9fa', },
  title: { fontSize: 28, fontWeight: 'bold', color: '#343a40', textAlign: 'center', marginBottom: 30, },
  input: { height: 50, borderColor: '#ced4da', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 15, fontSize: 16, backgroundColor: '#fff', },
  buttonContainer: { marginTop: 10, marginBottom: 20, minHeight: 40 }, // Added minHeight for Indicator
  switchText: { color: '#007AFF', textAlign: 'center', fontSize: 15, },
});