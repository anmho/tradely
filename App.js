import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

async function getHistoricalData(fromTicker, toTicker) {
  const product_id = `${fromTicker}-${toTicker}`;
  const response =
    await fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
  `);
  const data = await response.json();
  return await data;
}

export default function App() {
  const [webSocket, setWebSocket] = useState();
  const [curPrice, setCurPrice] = useState();
  const [histPrices, setHistPrices] = useState();
  const [fromTicker, setFromTicker] = useState('ETH');
  const [toTicker, setToTicker] = useState('USD');

  useEffect(() => {
    const connectCoinbaseStreaming = (fromTicker, toTicker) => {
      const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
      const conversion_string = `${fromTicker}-${toTicker}`;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            product_ids: [conversion_string],
            channels: ['ticker'],
          })
        );
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        // console.log(data);
        if (data && data.price) {
          const price = data.price;
          setCurPrice(price);
        }
      };

      ws.onerror = (error) => {
        console.log(`WebSocket Error: ${error}`);
      };

      const product_id = `${fromTicker}-${toTicker}`;
      const response =
        fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
    `)
          .then((res) => res.json())
          .then((data) => setHistPrices(data));

      return ws;
    };

    const ws = connectCoinbaseStreaming(fromTicker, toTicker);
    setWebSocket(ws);

    return () => ws.close();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={{ color: 'black' }}>{curPrice}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
