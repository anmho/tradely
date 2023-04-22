import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CurrencyDetail from './screens/CurrencyDetail';

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
  const asset_amount = amount_usd / asset_price;
  console.log(asset_amount);

  const order = {
    type: 'sell',
    ticker: ticker,
    amount: asset_amount,
  };

  // now can essentially increment or decrement the amount in the 'database'

  const portfolio = JSON.parse(await AsyncStorage.getItem('portfolio'));

  console.log(portfolio);

  if (!portfolio[ticker] || portfolio[ticker] < asset_amount) return false;

  portfolio['USD'] += amount_usd;
  portfolio[ticker] = portfolio[ticker]
    ? portfolio[ticker] - asset_amount
    : asset_amount;

  AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
  // use local storage to store transaction and update the currency quantities

  console.log(portfolio);

  // return success or failure
  return true;
}

async function sendBuyOrder(amount_usd, asset_price, ticker) {
  const asset_amount = amount_usd / asset_price;

  const order = {
    type: 'sell',
    ticker: ticker,
    amount: asset_amount,
  };

  console.log(asset_amount);

  // now can essentially increment or decrement the amount in the 'database'

  const portfolio = JSON.parse(await AsyncStorage.getItem('portfolio'));

  console.log(portfolio);

  if (portfolio['USD'] < amount_usd) return false;

  portfolio['USD'] -= amount_usd;
  portfolio[ticker] = portfolio[ticker]
    ? portfolio[ticker] + asset_amount
    : asset_amount;

  AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
  // use local storage to store transaction and update the currency quantities

  // return success or failure

  return true;
}

export default function App() {
  const [webSocket, setWebSocket] = useState();
  const [curPrice, setCurPrice] = useState();
  const [histPrices, setHistPrices] = useState();
  const [fromTicker, setFromTicker] = useState('ETH');
  const [toTicker, setToTicker] = useState('USD');

  // useEffect(() => {
  //   const connectCoinbaseStreaming = (fromTicker, toTicker) => {
  //     const ws = new WebSocket('wss://ws-feed.exchange.coinbase.com');
  //     const conversion_string = `${fromTicker}-${toTicker}`;

  //     ws.onopen = () => {
  //       ws.send(
  //         JSON.stringify({
  //           type: 'subscribe',
  //           product_ids: [conversion_string],
  //           channels: ['ticker'],
  //         })
  //       );
  //     };

  //     ws.onmessage = (e) => {
  //       const data = JSON.parse(e.data);
  //       // console.log(data);
  //       if (data && data.price) {
  //         const price = data.price;
  //         setCurPrice(price);
  //       }
  //     };

  //     ws.onerror = (error) => {
  //       console.log(`WebSocket Error: ${error}`);
  //     };

  //     const product_id = `${fromTicker}-${toTicker}`;
  //     const response =
  //       fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
  //   `)
  //         .then((res) => res.json())
  //         .then((data) => setHistPrices(data));

  //     // initialize key - value storage
  //     //

  //     // if (!AsyncStorage.getItem('portfolio')) {

  //     const portfolio = { USD: 10_000 };
  //     AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
  //     // }

  //     return ws;
  //   };

  //   const ws = connectCoinbaseStreaming(fromTicker, toTicker);
  //   setWebSocket(ws);

  //   return () => ws.close();
  // }, []);

  return (
    <>
      <CurrencyDetail />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '80%',
    borderRadius: 4,
    color: 'white',
    elevation: 3,
    color: '#fff',
    backgroundColor: 'blue',
    marginBottom: 10,
  },

  sellButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '80%',
    borderRadius: 4,
    elevation: 3,
    color: '#fff',
    backgroundColor: 'blue',
  },
  buttonContainer: {
    text: {
      color: '#fff',
    },
    width: '100%',
    position: 'absolute',
    bottom: 30,
    flex: 0,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    // flexDirection: 'row',
  },
});
