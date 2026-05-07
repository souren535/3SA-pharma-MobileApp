import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const storeOrders = [
  { id: 1, type: 'Order', orderNo: 'ABC12345', billingDate: '04 APR 2026', amount: '+ Rs. 5700', isOrder: true },
  { id: 2, type: 'Payment', date: '04 APR 2026', desc: 'Cash payment received', amount: '- Rs. 3000', isOrder: false },
  { id: 3, type: 'Order', orderNo: 'ABC12346', billingDate: '10 APR 2026', amount: '+ Rs. 3200', isOrder: true },
  { id: 4, type: 'Payment', date: '12 APR 2026', desc: 'UPI payment received', amount: '- Rs. 5700', isOrder: false },
  { id: 5, type: 'Order', orderNo: 'ABC12347', billingDate: '15 APR 2026', amount: '+ Rs. 4100', isOrder: true },
];

const storeTransactions = [
  { id: 1, date: '04 APR 2026', type: 'Credit', amount: '+ Rs. 5700', desc: 'Order #ABC12345', balance: 'Rs. 5700' },
  { id: 2, date: '06 APR 2026', type: 'Debit', amount: '- Rs. 3000', desc: 'Cash Payment', balance: 'Rs. 2700' },
  { id: 3, date: '10 APR 2026', type: 'Credit', amount: '+ Rs. 3200', desc: 'Order #ABC12346', balance: 'Rs. 5900' },
  { id: 4, date: '12 APR 2026', type: 'Debit', amount: '- Rs. 5700', desc: 'UPI Payment', balance: 'Rs. 200' },
  { id: 5, date: '15 APR 2026', type: 'Credit', amount: '+ Rs. 4100', desc: 'Order #ABC12347', balance: 'Rs. 4300' },
];

type TabName = 'Orders' | 'Transaction' | 'Info';

export default function StoreInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<TabName>('Orders');

  const storeName = (params.storeName as string) || 'Krishna Medical Stores';
  const storeCategory = (params.storeCategory as string) || 'Medicine Shop';
  const storeContact = (params.storeContact as string) || '+91 9876543210';
  const storeImage = (params.storeImage as string) || 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop';

  const tabs: TabName[] = ['Orders', 'Transaction', 'Info'];

  const renderOrders = () => (
    <>
      {storeOrders.map((item) => (
        <TouchableOpacity key={item.id} className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center">
          <View className={`w-11 h-11 rounded-full items-center justify-center ${item.isOrder ? 'bg-[#FF7676]' : 'bg-[#47B8A0]'}`}>
            <Text className="text-white text-lg font-bold">{item.type.charAt(0)}</Text>
          </View>
          <View className="flex-1 ml-3">
            <View className="flex-row justify-between items-start">
              <Text className="text-[14px] font-bold text-gray-800">{item.type}</Text>
              <Text className={`text-xs font-bold ${item.isOrder ? 'text-[#FF4A4A]' : 'text-[#3AA58E]'}`}>{item.amount}</Text>
            </View>
            <Text className="text-xs text-gray-500 mt-0.5">
              {item.isOrder ? `Order No : ${item.orderNo}` : `Date : ${item.date}`}
            </Text>
            {item.isOrder ? (
              <Text className="text-xs text-gray-500 mt-0.5">Billing Date : {item.billingDate}</Text>
            ) : (
              <Text className="text-xs text-gray-500 mt-0.5">{item.desc}</Text>
            )}
          </View>
          <Ionicons name="caret-forward" size={14} color="#A0AEC0" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      ))}
    </>
  );

  const renderTransactions = () => (
    <>
      {storeTransactions.map((item) => (
        <View key={item.id} className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <View className={`w-8 h-8 rounded-full items-center justify-center ${item.type === 'Credit' ? 'bg-[#DCFCE7]' : 'bg-[#FEE2E2]'}`}>
                <Ionicons
                  name={item.type === 'Credit' ? 'arrow-down' : 'arrow-up'}
                  size={16}
                  color={item.type === 'Credit' ? '#16A34A' : '#DC2626'}
                />
              </View>
              <View className="ml-3">
                <Text className="text-[14px] font-bold text-gray-800">{item.type}</Text>
                <Text className="text-[11px] text-gray-400 mt-0.5">{item.date}</Text>
              </View>
            </View>
            <Text className={`text-sm font-bold ${item.type === 'Credit' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{item.amount}</Text>
          </View>
          <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
            <Text className="text-xs text-gray-500">{item.desc}</Text>
            <Text className="text-xs text-gray-600 font-semibold">Bal: {item.balance}</Text>
          </View>
        </View>
      ))}
    </>
  );

  const renderInfo = () => (
    <View className="mx-4">
      {/* Store Image */}
      <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
        <Image
          source={{ uri: storeImage }}
          className="w-full h-[180px]"
          resizeMode="cover"
        />
      </View>

      {/* Store Details */}
      <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Store Details</Text>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#EEF2FF] items-center justify-center">
            <MaterialIcons name="store" size={18} color="#4C73B6" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Store Name</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeName}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#FEF3C7] items-center justify-center">
            <MaterialIcons name="category" size={18} color="#D97706" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Category</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeCategory}</Text>
          </View>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="w-9 h-9 rounded-full bg-[#DCFCE7] items-center justify-center">
            <MaterialIcons name="phone" size={18} color="#16A34A" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Contact</Text>
            <Text className="text-[14px] font-semibold text-gray-800">{storeContact}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-9 h-9 rounded-full bg-[#FEE2E2] items-center justify-center">
            <MaterialIcons name="location-on" size={18} color="#DC2626" />
          </View>
          <View className="ml-3">
            <Text className="text-[11px] text-gray-400">Address</Text>
            <Text className="text-[14px] font-semibold text-gray-800">123, Main Road, City Center</Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Summary</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-500">Total Orders</Text>
          <Text className="text-sm font-bold text-gray-800">24</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-500">Total Amount</Text>
          <Text className="text-sm font-bold text-[#16A34A]">Rs. 1,45,600</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-sm text-gray-500">Total Paid</Text>
          <Text className="text-sm font-bold text-[#4C73B6]">Rs. 1,20,300</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500">Outstanding</Text>
          <Text className="text-sm font-bold text-[#DC2626]">Rs. 25,300</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient
        colors={['#1A3F75', '#2D5A9E']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 0, paddingHorizontal: 20 }}
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>{storeName}</Text>
              <Text className="text-white/70 text-xs mt-0.5">{storeCategory}</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-9 h-9 bg-white/20 rounded-full items-center justify-center">
              <Ionicons name="call" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center pb-3"
            >
              <Text className={`text-sm font-bold ${activeTab === tab ? 'text-white' : 'text-white/50'}`}>{tab}</Text>
              {activeTab === tab && (
                <View className="absolute bottom-0 w-full h-[3px] bg-white rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Scrollable Content */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Orders' && renderOrders()}
        {activeTab === 'Transaction' && renderTransactions()}
        {activeTab === 'Info' && renderInfo()}
      </ScrollView>

      {/* FAB - Only on Orders tab */}
      {activeTab === 'Orders' && (
        <TouchableOpacity
          className="absolute bottom-10 right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
          onPress={() => router.push({ pathname: '/pages/orderCreate', params: { storeName, storeCategory, storeContact, storeImage, fromStore: 'true' } })}
        >
          <Feather name="plus" size={26} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
