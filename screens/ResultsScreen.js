// screens/ResultsScreen.js (Single Card Layout - Whitespace Check)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator, Alert, Platform, Image, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// --- Keywords ---
const ALLERGEN_KEYWORDS = ['milk', 'lactose', 'casein', 'whey', 'dairy', 'egg', 'albumin', 'soy', 'soya', 'lecithin', 'wheat', 'gluten', 'barley', 'rye', 'oats', 'peanut', 'nuts', 'almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'macadamia', 'fish', 'shellfish', 'crustacean', 'shrimp', 'crab', 'lobster', 'sesame'];
const ADDITIVE_KEYWORDS = ['sodium benzoate', 'aspartame', 'monosodium glutamate', 'msg', 'tartrazine', 'yellow 5', 'sulfites', 'sulphites'];
const NON_VEGAN_KEYWORDS = ['honey', 'gelatin', 'collagen', 'carmine', 'cochineal', 'shellac', 'l-cysteine'];
// --- End Keywords ---

const Separator = () => <View style={styles.separator} />;

export default function ResultsScreen({ route, navigation }) {
  const barcodeType = route?.params?.barcodeType;
  const barcodeData = route?.params?.barcodeData;

  const [productInfo, setProductInfo] = useState(null);
  const [foundWarnings, setFoundWarnings] = useState([]);
  const [dietaryStatus, setDietaryStatus] = useState('Unknown');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeIngredientsKeywords = (ingredientsText) => { if (!ingredientsText || typeof ingredientsText !== 'string') return []; const lowerCaseIngredients = ingredientsText.toLowerCase(); const warnings = new Set(); ALLERGEN_KEYWORDS.forEach(keyword => { const regex = new RegExp(`\\b${keyword}\\b`, 'i'); if (regex.test(lowerCaseIngredients)) warnings.add(`Potential Allergen: ${keyword}`); }); ADDITIVE_KEYWORDS.forEach(keyword => { const regex = new RegExp(`\\b${keyword}\\b`, 'i'); if (regex.test(lowerCaseIngredients)) warnings.add(`Additive Found: ${keyword}`); }); return Array.from(warnings); };
  const checkDietaryTags = (product) => { const tagsToCheck = [...(product.labels_tags || []), ...(product.ingredients_analysis_tags || [])]; if (tagsToCheck.includes('en:vegan')) return 'Likely Vegan'; if (tagsToCheck.includes('en:vegetarian')) return 'Likely Vegetarian'; return 'Unknown / Not Specified'; };
  const saveScanToHistory = async (productDataToSave) => { if (!auth?.currentUser || !db) { console.log("User not logged in or DB not available..."); return; } const userId = auth.currentUser.uid; try { const docRef = await addDoc(collection(db, "scanHistory"), { userId, barcode: productDataToSave.barcode || 'N/A', productName: productDataToSave.productName || 'N/A', imageUrl: productDataToSave.imageUrl || null, scanTimestamp: serverTimestamp() }); console.log("Scan history saved with ID: ", docRef.id); } catch (e) { console.error("Error adding document to Firestore: ", e); } };

  const handleAnalyzeBarcode = async () => {
    if (!barcodeData) { Alert.alert("Error", "No barcode data available."); return; } setIsLoading(true); setProductInfo(null); setFoundWarnings([]); setDietaryStatus('Unknown'); setError(null);
    const fieldsToRequest = ['product_name', 'ingredients_text', 'ingredients_text_en', 'allergens_tags', 'allergens', 'brands', 'quantity', 'nutriscore_grade', 'nutriscore_score', 'nutriments', 'image_front_url', 'labels_tags', 'ingredients_analysis_tags'].join(',');
    const apiUrl = `https://world.openfoodfacts.org/api/v2/product/${barcodeData}.json?fields=${fieldsToRequest}`;
    try {
      const response = await fetch(apiUrl, { headers: { 'User-Agent': 'NutritionalInsightApp/1.0' } });
      if (!response.ok) { throw new Error(response.status === 404 ? `Product not found.` : `HTTP error! status: ${response.status}`); }
      const data = await response.json();
      if (data.status === 1 && data.product) {
        setProductInfo(data.product);
        const ingredients = data.product.ingredients_text_en || data.product.ingredients_text || "";
        setFoundWarnings(analyzeIngredientsKeywords(ingredients));
        setDietaryStatus(checkDietaryTags(data.product));
        const historyData = { barcode: barcodeData, productName: data.product.product_name, imageUrl: data.product.image_front_url };
        await saveScanToHistory(historyData);
      } else { throw new Error(`Product data unavailable.`); }
    } catch (err) { console.error("API Fetch/Save Error:", err); setError(`${err.message}`); setProductInfo(null); }
    finally { setIsLoading(false); }
  };

  const handleGoBack = () => { navigation.goBack(); };
  const handleChat = () => { if (productInfo) { navigation.navigate('AiChat', { productInfo: productInfo }); } else { Alert.alert("No Product Data", "Analyze a product first."); } };

  // --- RENDER ALL INFO INSIDE ONE CARD ---
  const renderSingleCardContent = () => {
    if (!productInfo) return null;

    const imageUrl = productInfo.image_front_url;
    const ingredients = productInfo.ingredients_text_en || productInfo.ingredients_text || null; // Use null if not available
    const apiAllergens = productInfo.allergens_tags?.map(tag => tag.replace(/^(en:|fr:|de:)/, '')).join(', ') || (productInfo.allergens || null);
    const combinedWarnings = new Set(foundWarnings);
    if (apiAllergens) { combinedWarnings.add(`API Allergens: ${apiAllergens}`); }
    const warningsArray = Array.from(combinedWarnings);

    // Nutrition Data
    const nutriments = productInfo.nutriments || {};
    const energyKcal = nutriments['energy-kcal_100g'] || nutriments['energy_100g']; const sugars = nutriments['sugars_100g']; const fat = nutriments['fat_100g']; const saturatedFat = nutriments['saturated-fat_100g']; const sodium = nutriments['sodium_100g']; const proteins = nutriments['proteins_100g']; const nutriScore = productInfo.nutriscore_grade?.toUpperCase() || 'N/A';
    const hasNutritionData = [energyKcal, sugars, fat, saturatedFat, sodium, proteins].some(val => val !== undefined && val !== null && val !== "");
    const hasNutriScore = nutriScore !== 'N/A' && nutriScore !== 'UNKNOWN';
    const showNutritionSection = hasNutritionData || hasNutriScore;

    return (
        <View style={styles.card}>
            {/* Section 1: Product Info */}
            <Text style={styles.cardTitle}>Product Information</Text>
            {imageUrl ? (<Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />) : (<View style={styles.imagePlaceholder}><Text style={styles.imagePlaceholderText}>No Image Available</Text></View>)}
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Name:</Text><Text>{' '}</Text>{productInfo.product_name || 'N/A'}</Text>
            <Text style={[styles.detailItem, dietaryStatus === 'Likely Vegan' && styles.veganStatus, dietaryStatus === 'Likely Vegetarian' && styles.vegetarianStatus]}><Text style={styles.detailLabel}>Dietary Status:</Text><Text>{' '}</Text>{dietaryStatus}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Brands:</Text><Text>{' '}</Text>{productInfo.brands || 'N/A'}</Text>
            <Text style={styles.detailItem}><Text style={styles.detailLabel}>Quantity:</Text><Text>{' '}</Text>{productInfo.quantity || 'N/A'}</Text>
            {/* Section 2: Ingredients (Conditional) */}
            {(ingredients && ingredients.trim() !== '') ? (<>
                <Separator />
                <Text style={styles.cardTitle}>Ingredients</Text>
                <Text style={styles.ingredientsText}>{ingredients}</Text>
            </>) : null}
            {/* Section 3: Allergens/Warnings (Conditional) */}
            {(warningsArray.length > 0) ? (<>
                <Separator />
                <View style={styles.warningsSubCard}>
                     <Text style={styles.warningsTitle}>⚠️ Allergens & Warnings</Text>
                     {warningsArray.map((warning, index) => (
                         <Text key={index} style={styles.warningItem}>• {String(warning)}</Text>
                     ))}
                </View>
            </>) : null}
             {/* Section 4: Nutrition (Conditional) */}
             {showNutritionSection ? (<>
                 <Separator />
                 <Text style={styles.cardTitle}>Nutrition Highlights (per 100g)</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Energy:</Text><Text>{' '}</Text>{energyKcal !== undefined ? `${energyKcal} kcal` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Fat:</Text><Text>{' '}</Text>{fat !== undefined ? `${fat}g` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Saturated Fat:</Text><Text>{' '}</Text>{saturatedFat !== undefined ? `${saturatedFat}g` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Sugars:</Text><Text>{' '}</Text>{sugars !== undefined ? `${sugars}g` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Protein:</Text><Text>{' '}</Text>{proteins !== undefined ? `${proteins}g` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Sodium:</Text><Text>{' '}</Text>{sodium !== undefined ? `${sodium}g` : 'Not specified'}</Text>
                 <Text style={styles.detailItem}><Text style={styles.detailLabel}>Nutri-Score:</Text><Text>{' '}</Text>{nutriScore === 'UNKNOWN' ? 'N/A' : nutriScore}</Text>
             </>) : (<>
                 <Separator />
                 <Text style={styles.cardTitle}>Nutrition Highlights</Text>
                 <Text style={styles.ingredientsText}>Nutrition Data: Not specified</Text>
             </>)}
        </View>
    );
  }
  // --- End Single Card Content ---


  // --- Main Return ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.barcodeInfoArea}><Text style={styles.infoLabel}>Scanned Barcode ({barcodeType || 'N/A'}):</Text><Text style={styles.infoData}>{barcodeData || 'N/A'}</Text></View>
      <View style={styles.buttonContainer}><Button title={isLoading ? "Fetching Data..." : "Get Product Info"} onPress={handleAnalyzeBarcode} disabled={isLoading || !barcodeData} /><View style={{ marginTop: 15 }}><Button title="Scan Another" onPress={handleGoBack} color="#6c757d" disabled={isLoading} /></View></View>
      {/* Use fragments or null returns for conditional rendering */}
      <View style={styles.resultsContainer}>
        {isLoading ? (<ActivityIndicator size="large" color="#007AFF" style={{ marginVertical: 40 }} />)
        : error ? (<View style={styles.card}><Text style={styles.apiErrorText}>{error}</Text></View>)
        : productInfo ? (<>
            {renderSingleCardContent()}
            <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
              <Text style={styles.chatButtonText}>Chat with AI</Text>
            </TouchableOpacity>
          </>)
        : barcodeData ? (<Text style={styles.placeholderText}>Press "Get Product Info" to fetch data...</Text>)
        : (<Text style={styles.placeholderText}>Scan a barcode using the previous screen.</Text>)}
      </View>
    </ScrollView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', }, contentContainer:{ paddingHorizontal: 10, paddingVertical: 15, paddingBottom: 30 }, barcodeInfoArea: { backgroundColor: '#e9ecef', padding: 10, borderRadius: 6, marginBottom: 15, marginHorizontal: 5 }, infoLabel: { fontSize: 12, color: '#495057', fontWeight: '500', }, infoData: { fontSize: 14, color: '#212529', marginBottom: 3, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', }, buttonContainer: { marginBottom: 20, paddingHorizontal: 5, }, resultsContainer: { paddingHorizontal: 5, }, card: { backgroundColor: '#ffffff', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#e9ecef', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1, }, cardTitle: { fontSize: 17, fontWeight: '600', marginBottom: 12, color: '#212529', }, separator: { height: 1, backgroundColor: '#dee2e6', marginVertical: 15, }, productImage: { width: '90%', height: 180, alignSelf: 'center', marginBottom: 15, borderRadius: 5, }, imagePlaceholder: { width: '90%', height: 180, alignSelf: 'center', marginBottom: 15, borderRadius: 5, backgroundColor: '#f1f3f5', justifyContent: 'center', alignItems: 'center'}, imagePlaceholderText: { color: '#adb5bd', fontSize: 16 }, detailItem: { fontSize: 14, color: '#495057', lineHeight: 21, marginBottom: 5, }, detailLabel: { fontWeight: 'bold', color: '#212529', }, veganStatus: { color: '#28a745', fontWeight: 'bold', }, vegetarianStatus: { color: '#17a2b8', fontWeight: 'bold', }, ingredientsText: { fontSize: 14, color: '#495057', lineHeight: 20, }, warningsSubCard: { marginTop: 0, padding: 10, backgroundColor: '#f8d7da', borderRadius: 4, borderColor: '#f5c6cb', borderWidth: 1, }, warningsTitle:{ fontSize: 16, fontWeight: 'bold', color: '#721c24', marginBottom: 8, }, warningItem: { fontSize: 14, color: '#721c24', marginLeft: 5, marginBottom: 4, }, apiErrorText: { fontSize: 14, color: '#721c24', textAlign: 'center', padding: 10, }, placeholderText:{ fontSize: 14, color: '#6c757d', fontStyle: 'italic', textAlign: 'center', marginTop: 30, paddingHorizontal: 10 }, chatButton: { backgroundColor: '#f8f9fa', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginTop: 10, alignSelf: 'center', borderWidth: 1, borderColor: '#ced4da', elevation: 1, }, chatButtonText: { color: '#495057', fontSize: 15, fontWeight: '500', },
});