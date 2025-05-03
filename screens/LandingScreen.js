// screens/LandingScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, StatusBar, Button, Alert } from 'react-native';
import { signOut } from "firebase/auth";
import { auth } from '../firebaseConfig'; // Assuming firebaseConfig.js is in the root

export default function LandingScreen({ navigation }) {

  const handleLogout = async () => {
    if (!auth) { Alert.alert("Error", "Authentication service not available."); return; }
    console.log("Attempting logout...");
    try {
      await signOut(auth);
      console.log("User signed out successfully!");
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert("Logout Failed", `An error occurred: ${error.message}`);
    }
  };

  return (
    <ImageBackground source={require('../assets/bg.jpg')} style={styles.background}>
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.title}>AI-Powered Nutritional Insight App</Text>

        {/* Button to navigate to Camera Screen */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.buttonText}>Scan Barcode</Text>
        </TouchableOpacity>

        {/* --- ADD HISTORY BUTTON --- */}
        <View style={styles.secondaryButtonContainer}>
             <Button
                title="View Scan History"
                onPress={() => navigation.navigate('History')} // Navigate to 'History' route
                color="#17a2b8" // Info color
             />
        </View>
        {/* --- END ADD HISTORY BUTTON --- */}


        {/* Logout Button */}
        <View style={styles.logoutButtonContainer}>
             <Button
                title="Logout"
                onPress={handleLogout}
                color="#dc3545" // Red color for logout
             />
        </View>

      </View>
    </ImageBackground>
  );
}

// Updated Styles
const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: 'cover', justifyContent: 'center', },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 50, textAlign: 'center', },
  button: { backgroundColor: '#4CAF50', paddingVertical: 15, paddingHorizontal: 50, borderRadius: 30, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, marginBottom: 20, }, // Reduced margin
  buttonText: { fontSize: 18, color: '#fff', fontWeight: 'bold', },
  secondaryButtonContainer: { // Style for History button
      width: '80%', // Match main button width maybe?
      marginBottom: 30, // Spacing before logout
  },
  logoutButtonContainer: { width: '60%', }
});