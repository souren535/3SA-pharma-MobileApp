import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // params will contain id, type, orderNo, billingDate, store, amount, isOrder, etc.
  const isOrder = params.isOrder === 'true';

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">{isOrder ? 'Order Details' : 'Payment Details'}</Text>
              <Text className="text-white/80 text-xs mt-1">{params.store}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View className="bg-white rounded-2xl shadow-sm p-5 mb-5">
          <View className="flex-row justify-between items-center border-b border-gray-100 pb-4 mb-4">
            <View>
              <Text className="text-gray-500 text-xs mb-1">{isOrder ? 'Order Number' : 'Transaction ID'}</Text>
              <Text className="text-gray-800 text-base font-bold">{params.orderNo || `TXN${params.id}9876`}</Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${isOrder ? 'bg-[#FF7676]/10' : 'bg-[#47B8A0]/10'}`}>
              <Text className={`text-xs font-bold ${isOrder ? 'text-[#FF7676]' : 'text-[#47B8A0]'}`}>
                {params.type}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-gray-500 text-xs mb-1">Date</Text>
              <Text className="text-gray-800 font-medium">{params.billingDate || params.date}</Text>
            </View>
            <View className="items-end">
              <Text className="text-gray-500 text-xs mb-1">Amount</Text>
              <Text className={`text-xl font-bold ${isOrder ? 'text-[#FF4A4A]' : 'text-[#3AA58E]'}`}>{params.amount}</Text>
            </View>
          </View>

          <View className="bg-[#F3F6F8] p-4 rounded-xl mt-2 border border-gray-100">
            <View className="flex-row items-center mb-2">
              <Ionicons name="storefront-outline" size={16} color="#4C73B6" />
              <Text className="text-[#4C73B6] text-xs font-semibold ml-1.5">Store Details</Text>
            </View>
            <Text className="text-gray-800 font-bold">{params.store}</Text>
            {params.desc && <Text className="text-gray-600 text-sm mt-2">{params.desc}</Text>}
          </View>
        </View>

        {isOrder && (
          <View className="bg-white rounded-2xl shadow-sm p-5 mb-5">
             <Text className="text-gray-800 font-bold mb-4 text-[16px]">Items Summary</Text>
             {/* Dummy Items */}
             {[1, 2, 3].map((item, index) => (
                <View key={index} className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-50">
                  <View className="flex-row items-center flex-1 pr-4">
                    <View className="w-12 h-12 bg-[#F3F6F8] rounded-xl items-center justify-center mr-3">
                      <Ionicons name="medical" size={20} color="#4C73B6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-800 font-semibold" numberOfLines={1}>Premium Medicine {item}</Text>
                      <Text className="text-gray-500 text-xs mt-1">Qty: 2 x Rs. 500</Text>
                    </View>
                  </View>
                  <Text className="text-gray-800 font-bold">Rs. 1000</Text>
                </View>
             ))}
             <View className="flex-row justify-between mt-2 pt-2">
               <Text className="text-gray-600 font-medium">Subtotal</Text>
               <Text className="text-gray-800 font-medium">Rs. 3000</Text>
             </View>
             <View className="flex-row justify-between mt-2">
               <Text className="text-gray-600 font-medium">Discount</Text>
               <Text className="text-[#3AA58E] font-medium">- Rs. 500</Text>
             </View>
             <View className="flex-row justify-between mt-2">
               <Text className="text-gray-600 font-medium">Taxes</Text>
               <Text className="text-gray-800 font-medium">Rs. 200</Text>
             </View>
             <View className="flex-row justify-between mt-4 pt-4 border-t border-dashed border-gray-200">
               <Text className="text-gray-800 font-bold text-[16px]">Total Amount</Text>
               <Text className="text-[#FF4A4A] font-bold text-xl">{params.amount}</Text>
             </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Action */}
      <View className="absolute bottom-0 w-full bg-white px-5 py-4 border-t border-gray-100 pb-8 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <TouchableOpacity className="bg-[#1A3F75] py-4 rounded-xl items-center flex-row justify-center shadow-sm">
          <Feather name="download" size={18} color="white" className="mr-2" />
          <Text className="text-white font-bold text-base ml-2">Download Receipt</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
