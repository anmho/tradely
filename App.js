import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [webSocket, setWebSocket] = useState();

  const [curPrice, setCurPrice] = useState();
  useEffect(() => {
    const connectCoinbaseStreaming = (from_ticker, to_ticker) => {
      const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
      const conversion_string = `${from_ticker}-${to_ticker}`;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'subscribe',
            product_ids: [conversion_string],
            channels: [
              'level2',
              'heartbeat',
              {
                name: 'ticker',
                product_ids: [conversion_string],
              },
            ],
          })
        );
      };
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        if (data && data.changes) {
          const price = data.changes[0][1];
          console.log(price);
          setCurPrice(price);
        }
      };

      ws.onerror = (error) => {
        console.log(`WebSocket Error: ${error}`);
      };

      return ws;
    };

    const ws = connectCoinbaseStreaming('ETH', 'USD');

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
