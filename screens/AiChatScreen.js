// screens/AiChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
// Import the Google AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- Access your API Key securely via Environment Variable ---
// Reads the key set in your .env file (because of the EXPO_PUBLIC_ prefix)
// Make sure your .env file has: EXPO_PUBLIC_GEMINI_API_KEY=your_actual_key
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// ---

// --- Configure the AI Client ---
let genAI;
let generativeModel;

if (!API_KEY) {
  // Warn if the API key is missing from the environment
  console.warn("Gemini API Key not found. Ensure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file and the app was restarted (npx expo start -c). AI Chat will use placeholder responses.");
} else {
  try {
      genAI = new GoogleGenerativeAI(API_KEY);
      // Choose a model - gemini-1.5-flash is a fast, multimodal model
      generativeModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      console.log("Gemini AI client initialized successfully.");
  } catch (error) {
      console.error("Failed to initialize Gemini AI Client:", error);
      // Keep genAI and generativeModel undefined if initialization fails
  }
}
// --- End AI Client Config ---


export default function AiChatScreen({ route, navigation }) {
  const productInfo = route?.params?.productInfo;
  const productName = productInfo?.product_name || 'the scanned product';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatError, setChatError] = useState(null); // State for API errors

  const scrollViewRef = useRef();

  // Initial greeting message
  useEffect(() => {
    setMessages([
      { sender: 'ai', text: `Hi! Ask me anything about ${productName}. ${!API_KEY ? '(Note: AI is not configured - using placeholders)' : ''}` }
    ]);
  }, [productName]);

  // Handle sending message
  const handleSend = async () => {
    if (inputText.trim() === '') return;
    setChatError(null); // Clear previous errors

    const userMessageText = inputText;
    // Add user message optimistically
    setMessages(prevMessages => [...prevMessages, { sender: 'user', text: userMessageText }]);
    setInputText('');
    setIsAiLoading(true);

    // --- Prepare context and prompt ---
    let productContext = `Product Name: ${productName}\n`;
    if (productInfo?.brands) productContext += `Brand: ${productInfo.brands}\n`;
    // Include ingredients if available
    const ingredients = productInfo?.ingredients_text_en || productInfo?.ingredients_text;
    if (ingredients) productContext += `Ingredients: ${ingredients}\n`;
    // Include API allergens if available
    const apiAllergens = productInfo?.allergens_tags?.map(tag => tag.replace(/^(en:|fr:|de:)/, '')) || [];
    if (apiAllergens.length > 0) productContext += `API Allergens: ${apiAllergens.join(', ')}\n`;
    // Add more context if needed (e.g., Nutri-Score, quantity)

    const prompt = `Context about the scanned food product:\n${productContext}\n\nUser question: ${userMessageText}\n\nAnswer:`;
    console.log("--- Sending Prompt to Gemini ---");
    // console.log(prompt); // Uncomment to debug the full prompt being sent

    let aiResponseText = "(Placeholder: AI not configured or error occurred)";

    // --- Make the API Call ---
    if (generativeModel) { // Only proceed if model was initialized successfully
        try {
            // Use generateContent for single-turn Q&A based on prompt
            const result = await generativeModel.generateContent(prompt);
            const response = await result.response;
            aiResponseText = await response.text(); // Extract the text response
            console.log("--- Received AI Response ---");

        } catch (error) {
            console.error("Gemini API Error:", error);
            setChatError(`AI Error: ${error.message}`);
            aiResponseText = "Sorry, I encountered an error trying to respond.";
        }
    } else {
        // Simulate delay if AI is not configured
         await new Promise(resolve => setTimeout(resolve, 500));
         aiResponseText = `(AI not configured) You asked about "${userMessageText}". Please check API key setup.`;
    }
    // --- End API Call ---

    // Add AI response to messages
    setMessages(prevMessages => [...prevMessages, { sender: 'ai', text: aiResponseText }]);
    setIsAiLoading(false);
  };

  // Auto-scroll logic
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Text style={styles.headerText}>Chatting about: {productName}</Text>

      <ScrollView
          style={styles.messagesContainer}
          ref={scrollViewRef}
          contentContainerStyle={{ paddingBottom: 10 }}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[ styles.messageBubble, msg.sender === 'user' ? styles.userMessage : styles.aiMessage ]}
          >
            <Text style={msg.sender === 'user' ? styles.userMessageText : styles.aiMessageText}>
              {msg.text}
            </Text>
          </View>
        ))}
        {isAiLoading && (
            <View style={[styles.messageBubble, styles.aiMessage]}>
                <ActivityIndicator size="small" color="#555" />
            </View>
        )}
         {chatError && (
             <View style={[styles.messageBubble, styles.errorMessage]}>
                <Text style={styles.errorMessageText}>{chatError}</Text>
             </View>
         )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your question..."
          placeholderTextColor="#999"
          editable={!isAiLoading}
        />
        <Button title="Send" onPress={handleSend} disabled={isAiLoading || inputText.trim() === ''} />
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Styles --- (Same as before, includes error message style)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f0f0', },
    headerText: { padding: 10, backgroundColor: '#e0e0e0', textAlign: 'center', fontWeight: 'bold', fontSize: 14, color: '#444', },
    messagesContainer: { flex: 1, paddingHorizontal: 10, paddingTop: 10, },
    messageBubble: { borderRadius: 15, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 8, maxWidth: '80%', },
    userMessage: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 5, },
    aiMessage: { backgroundColor: '#e5e5ea', alignSelf: 'flex-start', borderBottomLeftRadius: 5, },
    userMessageText: { color: '#fff', fontSize: 15, },
    aiMessageText: { color: '#000', fontSize: 15, },
    inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: '#ccc', backgroundColor: '#fff', },
    input: { flex: 1, height: 40, borderColor: '#ddd', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, marginRight: 10, backgroundColor: '#f9f9f9', },
    errorMessage: { backgroundColor: '#ffe0e0', alignSelf: 'stretch', maxWidth: '100%', marginTop: 5, },
    errorMessageText: { color: '#d8000c', fontSize: 14, }
});