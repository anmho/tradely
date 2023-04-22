import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getHistoricalData(fromTicker, toTicker) {
  const product_id = `${fromTicker}-${toTicker}`;
  const response =
    await fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
  `);
  const data = await response.json();
  return await data;
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Home</Text>
    </View>
  );
}
