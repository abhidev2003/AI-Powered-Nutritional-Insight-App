// screens/CameraScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
// Import CameraView and the permission hook
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  // State to prevent navigating multiple times for the same scan
  const [isNavigating, setIsNavigating] = useState(false);

  // Request permission if needed and reset navigation lock on focus
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
        console.log('Camera permission not granted yet. Consider requesting.');
        // You might want to automatically request here, or have a button like before
        // requestPermission();
    }
    // Reset navigation lock when the screen focuses (allows scanning again if user comes back)
    const unsubscribe = navigation.addListener('focus', () => {
        setIsNavigating(false);
        console.log('CameraScreen focused, ready to scan again.'); // Log when ready again
    });
    return unsubscribe; // Cleanup the listener when the component unmounts
  }, [permission, navigation]);


  // --- Handle Barcode Scanning ---
  const handleBarcodeScanned = ({ type, data }) => {
    // Only proceed if we aren't already navigating away
    if (!isNavigating) {
        setIsNavigating(true); // Set lock to prevent re-triggering
        console.log(`Scanned barcode! Type: ${type}, Data: ${data}`);

        // Navigate to Results screen with barcode data
        navigation.navigate('Results', {
            barcodeType: type,
            barcodeData: data,
        });
    } else {
        console.log('Barcode scanned but already navigating...'); // Log if scan happens during navigation
    }
  };

  function toggleCameraFacing() {
    console.log('[CameraScreen Action] Toggling camera facing...');
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // --- Render Logic ---
  if (!permission) {
    // Permissions are still loading from the hook
    return <View style={styles.center}><Text style={styles.loadingText}>Requesting permissions...</Text></View>;
  }

  if (!permission.granted) {
    // Handle denied permission state - provide a button to request again
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Camera permission is required to scan barcodes.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
             <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
         {!permission.canAskAgain && (
             <Text style={styles.errorTextSmall}>You may need to enable camera permissions in your device settings.</Text>
         )}
      </View>
    );
  }

  // Render the camera view if permission granted
  console.log('[Render Check] Proceeding to render CameraView for barcode scanning...');

  return (
    <View style={styles.container}>
      <CameraView
          style={styles.camera}
          facing={facing}
          // Add barcode scanning props
          barcodeScannerEnabled={true} // Ensure scanner is enabled
          onBarcodeScanned={handleBarcodeScanned} // Call function when scanned
          barcodeScannerSettings={{
            // Specify common types - Add/remove as needed for your use case
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39', 'itf14'],
          }}
      />
      {/* Optional: Overlay elements like a viewfinder rectangle can go here */}
      {/* Example Viewfinder: */}
      {/* <View style={styles.viewfinder} /> */}

      {/* Keep only the Flip button */}
      <View style={styles.buttonContainer}>
         {/* Placeholder for spacing */}
         <View style={[styles.button, { backgroundColor: 'transparent' }]}></View>
         {/* Flip Button */}
         <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
             <Text style={styles.flipButtonText}>Flip</Text>
         </TouchableOpacity>
         {/* Placeholder for spacing */}
         <View style={[styles.button, { backgroundColor: 'transparent' }]}></View>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    camera: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: 'black' },
    loadingText: { color: '#ccc', fontSize: 16, textAlign: 'center' },
    errorText: { color: '#ff8a8a', fontSize: 17, textAlign: 'center', marginBottom: 20 },
    errorTextSmall: { color: '#aaa', fontSize: 13, textAlign: 'center', marginTop: 15 },
    permissionButton: { backgroundColor: '#007AFF', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8 },
    permissionButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    buttonContainer: { // Adjusted to space out items for potentially centering flip button
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 110,
        backgroundColor: 'rgba(0,0,0,0.5)',
        flexDirection: 'row',
        justifyContent: 'space-around', // Use space-around
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 20
    },
    button: {
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 35, // Make touch area circular
        backgroundColor: 'rgba(255, 255, 255, 0.3)', // Slight background for flip button
     },
    flipButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    // Example viewfinder style (optional)
    // viewfinder: {
    //   position: 'absolute',
    //   left: '10%',
    //   right: '10%',
    //   top: '30%',
    //   bottom: '30%',
    //   borderWidth: 2,
    //   borderColor: 'red',
    //   borderRadius: 10,
    // }
});