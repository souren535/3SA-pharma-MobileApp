import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import API from '../../utils/api';

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // params will contain id, type, orderNo, billingDate, store, amount, isOrder, etc.
  const isOrder = params.isOrder === 'true';

  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (params.id && isOrder) {
      API.get(`/orders/${params.id}`)
        .then(res => setOrderDetails(res.data.data || res.data))
        .catch(err => console.error("Failed to fetch order details", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [params.id, isOrder]);

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
        {isLoading ? (
          <View className="py-10 items-center">
             <ActivityIndicator size="large" color="#1A3F75" />
          </View>
        ) : (
          <>
            {/* Main Card */}
            <View className="bg-white rounded-2xl shadow-sm p-5 mb-5">
              <View className="flex-row justify-between items-center border-b border-gray-100 pb-4 mb-4">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">{isOrder ? 'Order Number' : 'Transaction ID'}</Text>
                  <Text className="text-gray-800 text-base font-bold">{orderDetails?.order_no || params.orderNo || `TXN${params.id}9876`}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${isOrder ? 'bg-[#FF7676]/10' : 'bg-[#47B8A0]/10'}`}>
                  <Text className={`text-xs font-bold ${isOrder ? 'text-[#FF7676]' : 'text-[#47B8A0]'}`}>
                    {orderDetails?.status || params.type}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Date</Text>
                  <Text className="text-gray-800 font-medium">
                    {orderDetails?.created_at ? new Date(orderDetails.created_at).toLocaleDateString('en-GB') : (params.billingDate || params.date)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-500 text-xs mb-1">Amount</Text>
                  <Text className={`text-xl font-bold ${isOrder ? 'text-[#FF4A4A]' : 'text-[#3AA58E]'}`}>
                    ₹{orderDetails?.total_amount || params.amount?.toString().replace('Rs.', '').trim() || '0.00'}
                  </Text>
                </View>
              </View>

              <View className="bg-[#F3F6F8] p-4 rounded-xl mt-2 border border-gray-100">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="storefront-outline" size={16} color="#4C73B6" />
                  <Text className="text-[#4C73B6] text-xs font-semibold ml-1.5">Store Details</Text>
                </View>
                <Text className="text-gray-800 font-bold">{orderDetails?.shop?.shop_name || params.store}</Text>
                {orderDetails?.shop?.address && <Text className="text-gray-600 text-sm mt-2">{orderDetails.shop.address}</Text>}
              </View>
            </View>

            {isOrder && (
              <View className="bg-white rounded-2xl shadow-sm p-5 mb-5">
                <Text className="text-gray-800 font-bold mb-4 text-[16px]">Items Summary</Text>
                {orderDetails?.items && orderDetails.items.length > 0 ? orderDetails.items.map((item: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-50">
                      <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-12 h-12 bg-[#F3F6F8] rounded-xl items-center justify-center mr-3">
                          <Ionicons name="medical" size={20} color="#4C73B6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-semibold" numberOfLines={1}>{item.product?.product_name || `Product #${item.product_id}`}</Text>
                          <Text className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</Text>
                        </View>
                      </View>
                    </View>
                )) : (
                  [1, 2, 3].map((item, index) => (
                    <View key={index} className="flex-row justify-between items-center mb-4 pb-4 border-b border-gray-50">
                      <View className="flex-row items-center flex-1 pr-4">
                        <View className="w-12 h-12 bg-[#F3F6F8] rounded-xl items-center justify-center mr-3">
                          <Ionicons name="medical" size={20} color="#4C73B6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-800 font-semibold" numberOfLines={1}>Premium Medicine {item}</Text>
                          <Text className="text-gray-500 text-xs mt-1">Qty: 2</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
                
                <View className="flex-row justify-between mt-4 pt-4 border-t border-dashed border-gray-200">
                  <Text className="text-gray-800 font-bold text-[16px]">Total Amount</Text>
                  <Text className="text-[#FF4A4A] font-bold text-xl">₹{orderDetails?.total_amount || params.amount?.toString().replace('Rs.', '').trim() || '0.00'}</Text>
                </View>
              </View>
            )}
          </>
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
