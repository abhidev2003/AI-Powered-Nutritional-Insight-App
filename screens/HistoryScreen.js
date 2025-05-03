// screens/HistoryScreen.js
import React, { useState, useEffect, useCallback } from 'react';
// --- ADD Button TO THIS IMPORT ---
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform, Image, RefreshControl, Button } from 'react-native';
// --- END ADD ---
import { useFocusEffect } from '@react-navigation/native';

import { auth, db } from '../firebaseConfig';
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore";

export default function HistoryScreen({ navigation }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    // Reset states correctly based on whether it's initial load or refresh
    if (!isRefreshing) {
        setIsLoading(true); // Only show full loading on initial load
    }
    setError(null);

    if (!auth?.currentUser || !db) {
      console.log("User not logged in or DB not available.");
      setError("Please log in to view history.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    const userId = auth.currentUser.uid;
    console.log(`Workspaceing history for user: ${userId}`);

    try {
      const historyQuery = query(
        collection(db, "scanHistory"),
        where("userId", "==", userId),
        orderBy("scanTimestamp", "desc")
      );
      const querySnapshot = await getDocs(historyQuery);
      const items = [];
      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          ...doc.data()
        });
      });
      console.log(`Workspaceed ${items.length} history items.`);
      setHistoryItems(items);

    } catch (err) {
      console.error("Error fetching history from Firestore: ", err);
      // Check if it's the specific index error
      if (err.code === 'failed-precondition') {
          setError("Database index required. Please check Firebase console (Indexes tab) or server logs for a link to create it.");
      } else {
          setError("Could not load scan history. Please try again.");
      }
      setHistoryItems([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Don't set isLoading here, let fetchHistory handle it
      fetchHistory();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, []);

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer}>
      {item.imageUrl ? (
           <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover"/>
       ) : (
           <View style={styles.itemImagePlaceholder} />
       )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemText} numberOfLines={1}>{item.productName || 'N/A'}</Text>
        <Text style={styles.itemSubText}>Barcode: {item.barcode || 'N/A'}</Text>
        <Text style={styles.itemDate}>
          Scanned: {item.scanTimestamp instanceof Timestamp ? item.scanTimestamp.toDate().toLocaleString() : 'N/A'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && !isRefreshing) {
    return ( <View style={styles.center}><ActivityIndicator size="large" color="#007AFF" /><Text>Loading History...</Text></View> );
  }

  if (error) {
    return ( <View style={styles.center}><Text style={styles.errorText}>{error}</Text><Button title="Retry" onPress={fetchHistory} /></View> );
  }

  return (
    <FlatList
      style={styles.container}
      data={historyItems}
      renderItem={renderHistoryItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={historyItems.length === 0 ? styles.center : styles.list}
      ListEmptyComponent={() => ( !isLoading && <Text style={styles.emptyText}>No scan history found.</Text> )}
      refreshControl={ <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} /> }
    />
  );
}

// --- Styles --- (Same as before)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f9fa', }, list: { padding: 10, }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, }, itemContainer: { backgroundColor: '#fff', padding: 10, marginBottom: 10, borderRadius: 8, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', }, itemImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10, backgroundColor: '#f0f0f0', }, itemImagePlaceholder: { width: 50, height: 50, borderRadius: 5, marginRight: 10, backgroundColor: '#e9ecef', }, itemTextContainer: { flex: 1, }, itemText: { fontSize: 15, fontWeight: 'bold', color: '#333', }, itemSubText: { fontSize: 13, color: '#666', marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', }, itemDate: { fontSize: 11, color: '#999', marginTop: 4, textAlign: 'right', }, emptyText: { fontSize: 16, color: '#6c757d', marginTop: 50, }, errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 15, },
});