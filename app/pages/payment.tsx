import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const payments = [
  { id: 1, type: 'Payment', date: '04 APR 2026', desc: 'Transaction Successful', store: 'Sri Hari Medicine Center', amount: '+ Rs. 8760', status: 'Success' },
  { id: 2, type: 'Payment', date: '04 APR 2026', desc: 'UPI Transaction', store: 'Narmada Medical', amount: '+ Rs. 1260', status: 'Success' },
  { id: 3, type: 'Payment', date: '03 APR 2026', desc: 'Card Payment', store: 'Krishna Medical Stores', amount: '+ Rs. 4500', status: 'Pending' },
  { id: 4, type: 'Payment', date: '02 APR 2026', desc: 'Net Banking', store: 'MedPlus Pharmacy', amount: '+ Rs. 2300', status: 'Success' },
  { id: 5, type: 'Payment', date: '01 APR 2026', desc: 'Wallet Payment', store: 'Apollo Medical Shop', amount: '+ Rs. 1100', status: 'Failed' },
  { id: 6, type: 'Payment', date: '30 MAR 2026', desc: 'Cash on Delivery', store: 'Wellness Pharma Hub', amount: '+ Rs. 500', status: 'Success' },
];

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
                   <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">Total Outstanding</Text>
                   <Text className="text-white text-3xl font-bold mt-1">Rs. 24,500</Text>
                 </View>
                 <View className="bg-white/20 p-3 rounded-2xl">
                   <Ionicons name="wallet-outline" size={28} color="white" />
                 </View>
              </View>
              <View className="flex-row justify-between border-t border-white/10 pt-4">
                 <View>
                   <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Last Payment</Text>
                   <Text className="text-white font-bold text-sm">Rs. 8,760.00</Text>
                 </View>
                 <View className="items-end">
                   <Text className="text-white/60 text-[10px] uppercase font-bold tracking-wider">Date</Text>
                   <Text className="text-white font-bold text-sm">04 Apr 2026</Text>
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
             <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Transactions</Text>
             <Text className="text-gray-800 text-lg font-bold">128</Text>
           </View>
           <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
             <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mb-3">
               <Ionicons name="trending-up" size={20} color="#1A3F75" />
             </View>
             <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Success Rate</Text>
             <Text className="text-gray-800 text-lg font-bold">98.5%</Text>
           </View>
        </View>

        <Text className="px-5 mb-4 text-gray-800 font-bold text-[17px]">Recent Transactions</Text>
        {payments.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center"
            onPress={() => router.push({
              pathname: '/pages/orderDetails',
              params: { ...item, isOrder: 'false' }
            })}
          >
            {/* Circle Icon */}
            <View className={`w-12 h-12 rounded-full items-center justify-center ${item.status === 'Success' ? 'bg-[#47B8A0]' : item.status === 'Pending' ? 'bg-orange-400' : 'bg-red-400'}`}>
              <Ionicons name={item.status === 'Success' ? 'checkmark' : item.status === 'Pending' ? 'time' : 'close'} size={20} color="white" />
            </View>

            {/* Content */}
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-[15px] font-bold text-gray-800">{item.type}</Text>
                <Text className={`text-xs font-bold ${item.status === 'Success' ? 'text-[#3AA58E]' : item.status === 'Pending' ? 'text-orange-500' : 'text-red-500'}`}>{item.amount}</Text>
              </View>
              <Text className="text-xs text-gray-600 mt-1">Date : {item.date}</Text>
              <Text className="text-xs text-gray-600 mt-0.5">{item.desc}</Text>
              <Text className="text-xs font-semibold text-[#3AA58E] mt-1">({item.store})</Text>
            </View>

            {/* Arrow */}
            <View className="ml-2 justify-center">
              <Ionicons name="caret-forward" size={14} color="#A0AEC0" />
            </View>
          </TouchableOpacity>
        ))}
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
