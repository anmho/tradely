import { StatusBar, setStatusBarBackgroundColor } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to get portfolio
// function to update portfolio

async function getPortfolio() {}

export default function CurrencyDetail({}) {
  const [webSocket, setWebSocket] = useState();
  const [curPrice, setCurPrice] = useState();
  const [histPrices, setHistPrices] = useState();
  const [fromTicker, setFromTicker] = useState('ETH');
  const [toTicker, setToTicker] = useState('USD');
  const [portfolio, setPortfolio] = useState({});

  const getBalance = async (ticker) => {
    const balance = await AsyncStorage.getItem(ticker);
    return balance ? balance : 0;
  };

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

      // Get historical data
      const product_id = `${fromTicker}-${toTicker}`;
      const response =
        fetch(`https://api.pro.coinbase.com/products/${product_id}/candles`)
          .then((res) => res.json())
          .then((data) => {
            setHistPrices(data);
            console.log(data);
          });

      // initialize key - value storage
      //

      // if (!AsyncStorage.getItem('portfolio')) {

      const portfolio = { USD: 10_000 };
      AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
      // }

      return ws;
    };

    const ws = connectCoinbaseStreaming(fromTicker, toTicker);
    setWebSocket(ws);

    return () => ws.close();
  }, []);

  // async function getHistoricalData(fromTicker, toTicker) {
  //   const product_id = `${fromTicker}-${toTicker}`;
  //   const response =
  //     await fetch(`https://api.pro.coinbase.com/products/${product_id}/candles
  //   `);
  //   const data = await response.json();
  //   return await data;
  // }

  // console.log(histPrices);

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

    setPortfolio(portfolio);
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

    setPortfolio(portfolio);
    AsyncStorage.setItem('portfolio', JSON.stringify(portfolio));
    // use local storage to store transaction and update the currency quantities

    // return success or failure

    return true;
  }

  return (
    <View style={styles.container}>
      {/* Price/Chart */}
      <StatusBar style="auto" />
      <Text style={{ color: 'black' }}>{curPrice}</Text>

      {/* Currency Overview/Balance */}
      <View
        style={{
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          width: '90%',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignContent: 'center',
          flexDirection: 'row',
          padding: 10,
          borderRadius: 10,
        }}
      >
        <Image
          style={{ width: 50, height: 50, aspectRatio: 1 / 1 }}
          source={{
            uri: `https://cryptoicons.org/api/icon/${fromTicker.toLowerCase()}/200`,
          }}
        />
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <Text style={{ fontSize: 18 }}>Ethereum</Text>
          <Text>{(portfolio['ETH'] ? portfolio['ETH'] : 0).toFixed(2)}</Text>
        </View>
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center',
          }}
        >
          <Text>
            ${((portfolio['ETH'] ? portfolio['ETH'] : 0) * curPrice).toFixed(2)}
          </Text>
          {/* Portfolio percentage */}
          <Text>hello4</Text>
        </View>
      </View>

      {/* Transactions */}

      {/* Buy/Sell Buttons */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonContainer.inner}>
          <Pressable
            // title="buy"
            onPress={() => sendBuyOrder(500, curPrice, 'ETH')}
            style={styles.buyButton}
          >
            <Text style={styles.buttonContainer.text}>BUY</Text>
          </Pressable>
          <Pressable
            style={styles.sellButton}
            title="sell"
            onPress={() => sendSellOrder(500, curPrice, 'ETH')}
          >
            <Text style={styles.buttonContainer.text}>SELL</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '45%',
    borderRadius: 4,
    color: 'white',
    elevation: 3,
    color: '#fff',
    backgroundColor: 'blue',
    marginRight: 5,
  },

  sellButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    width: '45%',
    borderRadius: 4,
    elevation: 3,
    color: '#fff',
    backgroundColor: 'blue',
    marginLeft: 5,
  },
  buttonContainer: {
    inner: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    text: {
      color: '#fff',
    },
    width: '100%',
    position: 'absolute',
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingTop: 20,
    paddingBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
