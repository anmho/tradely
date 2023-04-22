import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

async function getHistoricalData(fromTicker, toTicker) {
  const product_id = `${fromTicker}-${toTicker}`;
  const response =
    await fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
  `);
  const data = await response.json();
  return await data;
}

// limit order only -- assume orders are always filled
// lets assume everyone is purchasing in USD
async function sendSellOrder(amount_usd, asset_price, ticker) {
  const amount = amount_usd / asset_price;

  const order = {
    type: 'sell',
    ticker: ticker,
    amount: amount,
  };

  // now can essentially increment or decrement the amount in the 'database'

  const portfolio = JSON.parse(AsyncStorage.getItem('portfolio'));

  if (portfolio[ticker] >= amount) return false;

  portfolio[ticker] -= amount;

  AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
  // use local storage to store transaction and update the currency quantities

  // return success or failure
  return true;
}

async function sendBuyOrder() {}

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

      // initialize key - value storage
      //

      if (!AsyncStorage.getItem('portfolio')) {
        AsyncStorage.setItem('portfolio', JSON.stringify({}));
      }

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
      <Button title="buy" />
      <Button title="sell" />
      {/* <Text>{AsyncStorage.getItem('portfolio')}</Text> */}
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
