# AI-Powered Nutritional Insight App

This is a mobile application developed as a Mini Project for Lourdes Matha College of Science and Technology (LMCST), designed to help users quickly understand the contents of packaged food products. It utilizes barcode scanning, external APIs, and basic analysis to provide nutritional insights, allergen warnings, and dietary status information.

## Features

* **Barcode Scanning:** Uses the device camera (`expo-camera`) to automatically detect and scan product barcodes (EAN, UPC, etc.).
* **Product Data Retrieval:** Fetches detailed product information (name, ingredients, nutrition facts, images, tags) from the [Open Food Facts API](https://world.openfoodfacts.org/data) based on the scanned barcode.
* **Ingredient Analysis:** Performs client-side keyword matching on retrieved ingredient lists to identify and flag common allergens (milk, gluten, nuts, soy, etc.) and selected additives.
* **Dietary Status Check:** Analyzes product tags from the API (e.g., `labels_tags`) to indicate if a product is likely vegan or vegetarian.
* **User Authentication:** Secure email/password signup and login managed by Firebase Authentication.
* **Scan History:** Saves a history of scanned products (linked to the logged-in user) using Cloud Firestore. Users can view their past scans.
* **AI Chat Assistant:** Integrates with the Google AI (Gemini) API to allow users to ask contextual questions about the scanned product.
* **Cross-Platform:** Built with React Native and Expo, designed to run on both Android and iOS (primarily tested on Android).

## Technologies Used

* **Frontend:** React Native, Expo SDK (~52), React Navigation
* **Camera/Scanning:** `expo-camera` (`CameraView`)
* **Authentication:** Firebase Authentication (Email/Password)
* **Database:** Cloud Firestore (for Scan History)
* **External APIs:**
    * Open Food Facts API (for product data)
    * Google AI / Gemini API (for AI Chat) via `@google/generative-ai` SDK
* **Build/Development:** Expo CLI, Expo Development Client, EAS Build (optional for standalone builds)
* **Version Control:** Git, GitHub

## Setup Instructions

Follow these steps to set up and run the project locally for development.

**Prerequisites:**

* Node.js (LTS version recommended) and npm
* Git
* Expo CLI (`npm install -g expo-cli`)
* EAS CLI (`npm install -g eas-cli`)
* An Expo account ([signup](https://expo.dev/signup))
* A Firebase project ([console](https://console.firebase.google.com/))
* A Google AI / Gemini API Key ([ai.google.dev](https://ai.google.dev/))
* An Android Emulator or Physical Device with the Expo Go app (for initial setup) or a Development Build installed.

**Steps:**

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/abhidev2003/AI-Powered-Nutritional-Insight-App.git](https://github.com/abhidev2003/AI-Powered-Nutritional-Insight-App.git)
    cd AI-Powered-Nutritional-Insight-App
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Set Up Firebase:**
    * Go to your Firebase project console.
    * Enable **Authentication** -> Sign-in method -> **Email/Password**.
    * Go to Project Settings -> General -> Your apps -> Add app -> Select **Web** (`</>`).
    * Register the web app (no need for hosting).
    * Copy the `firebaseConfig` object values (apiKey, authDomain, projectId, etc.).
    * Enable **Firestore Database** -> Create database -> Start in **test mode** -> Select a location.

4.  **Set Up Google AI (Gemini):**
    * Go to [Google AI Studio](https://ai.google.dev/).
    * Create an API key. Copy it securely.

5.  **Configure API Keys (CRITICAL):**
    * In the root directory of the project, create a file named exactly `.env`
    * Add your Firebase and Gemini keys to this file, prefixing each variable name with `EXPO_PUBLIC_`:

        ```dotenv
        # .env file contents

        # Firebase Configuration Keys
        EXPO_PUBLIC_FIREBASE_API_KEY=PASTE_YOUR_FIREBASE_API_KEY_HERE
        EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=PASTE_YOUR_FIREBASE_AUTH_DOMAIN_HERE
        EXPO_PUBLIC_FIREBASE_PROJECT_ID=PASTE_YOUR_FIREBASE_PROJECT_ID_HERE
        EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=PASTE_YOUR_FIREBASE_STORAGE_BUCKET_HERE
        EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=PASTE_YOUR_FIREBASE_MESSAGING_SENDER_ID_HERE
        EXPO_PUBLIC_FIREBASE_APP_ID=PASTE_YOUR_FIREBASE_APP_ID_HERE
        # Add measurementId if provided and needed
        # EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=PASTE_YOUR_FIREBASE_MEASUREMENT_ID_HERE

        # Gemini API Key
        EXPO_PUBLIC_GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
        ```
    * **IMPORTANT:** Ensure the `.env` file is listed in your `.gitignore` file to prevent accidentally committing your secret keys!

6.  **Set Up Firestore Index:**
    * Run the app once (see next step). When you navigate to the History screen for the first time, check the Metro bundler terminal logs.
    * You will likely see a `FirebaseError` mentioning a required index and providing a URL.
    * Copy that URL and paste it into your browser. It will take you to the Firebase console to create the necessary composite index for the `scanHistory` collection (on fields `userId` Ascending and `scanTimestamp` Descending).
    * Click "Create" and wait for the index status to become "Enabled" (this may take a few minutes).

## Running the App

**1. Using Development Build (Recommended for testing all features):**

* **Install Dev Client:** `npx expo install expo-dev-client` (should already be in dependencies).
* **Build:** Create a development build for your device/emulator:
    ```bash
    # Login to EAS if needed: eas login
    # Configure project for EAS Build if needed: eas build:configure
    eas build --profile development --platform android
    # or --platform ios
    ```
* Install the generated `.apk` or app file onto your device/emulator.
* **Start the Metro Server:**
    ```bash
    npx expo start
    ```
* **Launch the installed Development Build app** (the one with your app's name/icon, NOT Expo Go). It should connect to the Metro server.

**2. Using Expo Go (Limited Functionality):**

* You can try running with Expo Go for basic UI checks, but features requiring native capabilities beyond the standard Expo Go set (like potentially `expo-text-extractor` if added later) or specific build configurations might not work correctly.
    ```bash
    npx expo start
    ```
* Scan the QR code with the Expo Go app on your device.

## Contributing & License

This project was developed as an academic requirement. You are welcome to copy, modify, and use this code as a base for your own projects.


