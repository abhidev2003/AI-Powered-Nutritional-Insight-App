// screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
// Import Firebase auth functions and the initialized auth object
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig.js is in the root

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    // Check if auth was initialized correctly
    if (!auth) {
        Alert.alert("Error", "Firebase Auth is not initialized correctly. Check firebaseConfig.js and .env file.");
        return;
    }

    setIsLoading(true);
    try {
      // Call Firebase Authentication create user function
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Signed up
      const user = userCredential.user;
      console.log('Created user:', user.email);
      Alert.alert('Signup Successful', `Account created for ${user.email}! Please Login.`);
      // Navigate to Login screen after successful signup
      navigation.navigate('Login');

    } catch (error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Signup Error:', errorCode, errorMessage);
      // Provide user-friendly error messages
      let friendlyMessage = "Signup failed. Please try again.";
      if (errorCode === 'auth/email-already-in-use') {
        friendlyMessage = "This email address is already in use.";
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = "Please enter a valid email address.";
      } else if (errorCode === 'auth/weak-password') {
        friendlyMessage = "Password is too weak. Please choose a stronger password.";
      }
      Alert.alert('Signup Failed', friendlyMessage);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

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
        placeholder="Password (min. 6 characters)"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />
       <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#888"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <View style={styles.buttonContainer}>
         {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
         ) : (
            <Button title="Sign Up" onPress={handleSignup} />
         )}
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
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