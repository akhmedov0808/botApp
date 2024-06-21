import React, {useEffect, useState} from 'react';
import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import axios from 'axios';

function App(): React.JSX.Element {
  const [checkStarted, setCheckStarted] = useState(false);
  const [checkStartCount, setCheckStartCount] = useState(0);

  const [activeOrderStarted, setActiveOrderStarted] = useState(false);
  const [activeOrderStartCount, setActiveOrderStart] = useState(0);

  function matchRatio(s1, s2) {
    const dp = Array(s1.length + 1)
      .fill(0)
      .map(() => Array(s2.length + 1).fill(0));

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    const lcsLength = dp[s1.length][s2.length];
    const ratio = (lcsLength / Math.max(s1.length, s2.length)) * 100;
    return ratio.toFixed(2);
  }

  const getCars = async () => {
    const {data} = await axios({
      method: 'post',
      url: 'https://savdo.uzavtosanoat.uz/b/ap/stream/ph&models_all_v2',
      data: {
        filial_id: 100,
        is_web: 'Y',
      },
    });
    if (
      data.filter(
        item =>
          matchRatio(item?.name.toLowerCase(), 'cobalt') > 55 ||
          matchRatio(item?.name.toLowerCase(), 'lacetti') > 55,
      ).length
    ) {
      console.log('123');

      const {data: test} = await axios({
        method: 'post',
        url: 'https://umidbeku.jprq.app/api/v1/shop/check',
        data: {data},
      });
      console.log(test);
    }
  };

  const handleActiveOrder = async activeOrder => {
    const url = `https://savdo.uzavtosanoat.uz/t/ap/runorder?mod=${activeOrder.model_id}&token=${activeOrder.person.rcode}`;

    const response = await axios.get(url);
    const data = response.data;
    console.log('handleActiveOrder', data);
    if (data.status === 1 || data.status === '1') {
      console.log('success');
      await axios({
        method: 'put',
        url: `https://umidbeku.jprq.app/api/v1/shop/active-orders/${activeOrder.id}`,
        data: {
          is_created: true,
          is_active: false,
        },
      });
    }
  };

  const sendCarRequests = () => {
    console.log('start', checkStarted);
    const promise = new Array(5).fill(null).map(qq => getCars());
    Promise.all(promise).finally(() => {
      console.log('end');
      setTimeout(() => setCheckStartCount(checkStartCount + 1), 5000);
    });
  };

  const sendActiveOrdersRequest = async () => {
    console.log('start', checkStarted);
    const {data: activeOrders} = await axios({
      method: 'get',
      url: 'https://umidbeku.jprq.app/api/v1/shop/active-orders',
    });
    console.log(activeOrders);
    const promise = activeOrders.map(item => handleActiveOrder(item));
    Promise.all(promise).finally(() => {
      console.log('end');
      setTimeout(() => setActiveOrderStart(activeOrderStartCount + 1), 5000);
    });
  };

  useEffect(() => {
    if (checkStarted) {
      sendCarRequests();
    }
  }, [checkStartCount, checkStarted]);

  useEffect(() => {
    if (activeOrderStarted) {
      sendActiveOrdersRequest();
    }
  }, [activeOrderStarted, activeOrderStartCount]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: 300,
          height: 40,
          borderRadius: 8,
          backgroundColor: checkStarted ? 'red' : 'green',
        }}
        onPress={() => setCheckStarted(!checkStarted)}>
        <Text style={{color: 'white', fontSize: 18}}>
          {checkStarted ? 'Stop check' : 'Start check'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          width: 300,
          height: 40,
          borderRadius: 8,
          backgroundColor: activeOrderStarted ? 'red' : 'green',
          marginTop: 40,
        }}
        onPress={() => setActiveOrderStarted(!activeOrderStarted)}>
        <Text style={{color: 'white', fontSize: 18}}>
          {activeOrderStarted ? 'Stop active order' : 'Start active order'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default App;
