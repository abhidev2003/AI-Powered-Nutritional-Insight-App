// firebaseConfig.js
import { initializeApp, getApp, getApps } from 'firebase/app'; // Import getApp, getApps for safety check
import { getAuth } from "firebase/auth";
// --- ADD FIRESTORE IMPORT ---
import { getFirestore } from "firebase/firestore";
// --- END ADD ---

// Read configuration from environment variables (set in .env file)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};

// Initialize Firebase App (ensure it only happens once)
let app;
if (getApps().length === 0) { // Check if Firebase hasn't been initialized yet
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully!");
    } catch (error) {
        console.error("Firebase initialization error:", error);
        if (!firebaseConfig.apiKey) {
            console.error("Firebase API Key is missing. Check .env file.");
        }
        app = null; // Ensure app is null if init fails
    }
} else {
    app = getApp(); // Get the already initialized app
    console.log("Firebase already initialized.");
}

// Initialize Firebase Services (Auth and Firestore)
let auth = null;
let db = null; // <-- Declare db variable

if (app) { // Only initialize services if app initialization was successful
    try {
        auth = getAuth(app);
        db = getFirestore(app); // <-- Initialize Firestore
        console.log("Firebase Auth & Firestore services initialized.");
    } catch(error) {
        console.error("Error initializing Firebase services:", error);
    }
} else {
    console.error("Firebase app initialization failed, cannot initialize services.");
}


// Export the initialized app and services
export { app, auth, db }; // <-- Export db as well