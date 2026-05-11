import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const dates = [
  { day: 'WED', date: '17', active: false },
  { day: 'THU', date: '18', active: false },
  { day: 'FRI', date: '19', active: false },
  { day: 'SAT', date: '20', active: true },
  { day: 'SUN', date: '21', active: false },
  { day: 'MON', date: '22', active: false },
];

const orders = [
  { id: 1, type: 'Order', orderNo: 'ABC12345', billingDate: '04 APR 2026', store: 'Sri Hari Medicine Center', amount: '+ Rs. 5700', isOrder: true },
  { id: 2, type: 'Payment', date: '04 APR 2026', desc: 'Lorem Ipsum is simply dummy ...', store: 'Sri Hari Medicine Center', amount: '+ Rs. 8760', isOrder: false },
  { id: 3, type: 'Payment', date: '04 APR 2026', desc: 'Lorem Ipsum is simply dummy ...', store: 'Narmada Medical', amount: '+ Rs. 1260', isOrder: false },
  { id: 4, type: 'Order', orderNo: 'ABC12345', billingDate: '04 APR 2026', store: 'Sri Hari Medicine Center', amount: '+ Rs. 5800', isOrder: true },
  { id: 5, type: 'Order', orderNo: 'ABC12345', billingDate: '04 APR 2026', store: 'Sri Hari Medicine Center', amount: '+ Rs. 1200', isOrder: true },
];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient
        colors={['#1A3F75', '#F3F6F8']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 16, paddingHorizontal: 20 }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()} className='bg-white/60 p-1.5 rounded-full'>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-[#1E293B] text-xl font-bold">Orders</Text>
              <Text className="text-gray-600 text-xs opacity-90 mt-0.5">All Order & Payment Summary</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="search" size={20} color="#1E293B" />
            </TouchableOpacity>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="options" size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Fixed Date Filter */}
      <View className="bg-[#F3F6F8]">
        <View className="flex-row justify-end px-5 mt-3">
          <TouchableOpacity className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm mr-2">
            <Text className="text-white font-medium text-xs mr-1">March</Text>
            <Ionicons name="caret-down" size={12} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm">
            <Text className="text-white font-medium text-xs mr-1">2026</Text>
            <Ionicons name="caret-down" size={12} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Fixed Date Strip */}
        <View className="mt-3 mb-3 flex-row">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {dates.map((d, i) => (
              <TouchableOpacity
                key={i}
                className={`items-center justify-center w-[60px] h-[76px] mr-3 rounded-[18px] ${
                  d.active ? 'bg-[#4C73B6] shadow-md' : 'bg-white shadow-sm'
                }`}
              >
                <Text className={`text-[11px] font-bold ${d.active ? 'text-white' : 'text-gray-400'}`}>{d.day}</Text>
                <Text className={`text-[22px] font-bold mt-1 ${d.active ? 'text-white' : 'text-gray-800'}`}>{d.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Scrollable Order List */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {orders.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center"
            onPress={() => router.push({
              pathname: '/pages/orderDetails',
              params: item
            })}
          >
            {/* Circle Icon */}
            <View className={`w-12 h-12 rounded-full items-center justify-center ${item.isOrder ? 'bg-[#FF7676]' : 'bg-[#47B8A0]'}`}>
              <Text className="text-white text-xl font-bold">{item.type.charAt(0)}</Text>
            </View>

            {/* Content */}
            <View className="flex-1 ml-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-[15px] font-bold text-gray-800">{item.type}</Text>
                <Text className={`text-xs font-bold ${item.isOrder ? 'text-[#FF4A4A]' : 'text-[#3AA58E]'}`}>{item.amount}</Text>
              </View>
              <Text className="text-xs text-gray-600 mt-1">{item.isOrder ? `Order No : ${item.orderNo}` : `Date : ${item.date}`}</Text>
              {item.isOrder ? (
                <Text className="text-xs text-gray-600 mt-0.5">Billing Date : {item.billingDate}</Text>
              ) : (
                <Text className="text-xs text-gray-600 mt-0.5">{item.desc}</Text>
              )}
              <Text className="text-xs font-semibold text-[#3AA58E] mt-1">({item.store})</Text>
            </View>

            {/* Arrow */}
            <View className="ml-2 justify-center">
              <Ionicons name="caret-forward" size={14} color="#A0AEC0" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-[100px] right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
        onPress={() => router.push('/pages/orderCreate')}
      >
        <Feather name="plus" size={26} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
