import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePaymentStore } from '../../store/store';

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { paymentsHistory, isLoading, fetchPaymentsHistory } = usePaymentStore();

  useEffect(() => {
    fetchPaymentsHistory();
  }, []);

  // Format payments for rendering
  const paymentsList = paymentsHistory.map((item) => {
    const storeName = item.order?.shop?.shop_name || 'Unknown Store';
    const orderNo = item.order?.order_no || '';
    const dateObj = new Date(item.payment_date || item.created_at);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).toUpperCase();

    const amtNum = parseFloat(item.amount) || 0;

    return {
      id: item.id,
      orderId: item.order_id,
      type: 'Payment Collection',
      date: formattedDate,
      desc: `${item.payment_mode || 'Cash'} Payment ${item.reference_no ? `(${item.reference_no})` : ''}`,
      store: storeName,
      amountNum: amtNum,
      amount: `+ Rs. ${amtNum.toFixed(2)}`,
      status: 'Success',
      orderNo: orderNo,
    };
  });

  // Calculate stats
  const totalCollected = paymentsList.reduce((sum, item) => sum + item.amountNum, 0);
  const totalCollections = paymentsList.length;
  const avgCollection = totalCollections > 0 ? totalCollected / totalCollections : 0;

  // Sort descending by ID/date to get the last payment first
  const sortedPayments = [...paymentsList].sort((a, b) => b.id - a.id);
  const lastPaymentAmount = sortedPayments.length > 0 ? sortedPayments[0].amountNum : 0;
  const lastPaymentDate = sortedPayments.length > 0 ? sortedPayments[0].date : '-';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 24, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Payments</Text>
            <Text className="text-white/80 text-xs mt-1">All Transaction History</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Summary Section */}
        <View className="px-4 mb-6 mt-2">
          <View className="rounded-[24px] overflow-hidden shadow-md">
            <LinearGradient
              colors={['#1A3F75', '#4C73B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ padding: 24 }}
            >
              <View className="flex-row justify-between items-center mb-4">
                 <View className='rounded-2xl bg-white/20 p-3'>
                   <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Collected</Text>
                   <Text className="text-white text-3xl font-bold mt-1">Rs. {totalCollected.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                 </View>
                 <View className="bg-white/20 p-3 rounded-2xl">
                   <Ionicons name="wallet-outline" size={28} color="white" />
                 </View>
              </View>
              <View className="flex-row justify-between border-t border-white/10 pt-4">
                 <View>
                   <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Last Payment</Text>
                   <Text className="text-white font-bold text-sm">Rs. {lastPaymentAmount.toFixed(2)}</Text>
                 </View>
                 <View className="items-end">
                   <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Date</Text>
                   <Text className="text-white font-bold text-sm">{lastPaymentDate}</Text>
                 </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        <View className="flex-row px-4 mb-6 justify-between">
           <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
             <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mb-3">
               <Ionicons name="stats-chart" size={20} color="#47B8A0" />
             </View>
             <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Collections</Text>
             <Text className="text-gray-800 text-lg font-bold">{totalCollections}</Text>
           </View>
           <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
             <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mb-3">
               <Ionicons name="trending-up" size={20} color="#1A3F75" />
             </View>
             <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Avg Collection</Text>
             <Text className="text-gray-800 text-lg font-bold">Rs. {avgCollection.toFixed(0)}</Text>
           </View>
        </View>

        <Text className="px-5 mb-4 text-gray-800 font-bold text-[17px]">Recent Transactions</Text>
        
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#1A3F75" />
            <Text className="text-gray-400 text-xs mt-3 font-medium">Loading history...</Text>
          </View>
        ) : sortedPayments.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="text-gray-400 text-sm font-medium">No transaction history found</Text>
          </View>
        ) : (
          sortedPayments.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center border border-gray-50"
              onPress={() => router.push({
                pathname: '/pages/orderDetails',
                params: { 
                  id: item.id,
                  type: item.type,
                  date: item.date,
                  desc: item.desc,
                  store: item.store,
                  amount: item.amount,
                  orderNo: item.orderNo,
                  isOrder: 'false' 
                }
              })}
            >
              {/* Circle Icon */}
              <View className="w-12 h-12 rounded-full items-center justify-center bg-[#47B8A0]">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>

              {/* Content */}
              <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-start">
                  <Text className="text-[15px] font-bold text-gray-800">{item.type}</Text>
                  <Text className="text-xs font-bold text-[#3AA58E]">{item.amount}</Text>
                </View>
                <Text className="text-xs text-gray-600 mt-1">Date : {item.date}</Text>
                <Text className="text-xs text-gray-600 mt-0.5">{item.desc}</Text>
                <Text className="text-xs font-semibold text-[#3AA58E] mt-1" numberOfLines={1}>({item.store})</Text>
              </View>

              {/* Arrow */}
              <View className="ml-2 justify-center">
                <Ionicons name="caret-forward" size={14} color="#A0AEC0" />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
