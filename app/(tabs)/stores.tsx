import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
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

const stores = [
  { id: 1, name: 'Krishna Medical Stores', category: 'Medicine Shop', contact: '+91 9876543210', image: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop' },
  { id: 2, name: 'Radha Rakomari Store', category: 'Grocery Shop', contact: '+91 9123456780', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=200&auto=format&fit=crop' },
  { id: 3, name: 'Narmada Medical', category: 'Medicine Shop', contact: '+91 8765432109', image: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=200&auto=format&fit=crop' },
  { id: 4, name: 'Sri Hari Medicine Center', category: 'Pharmacy', contact: '+91 7654321098', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=200&auto=format&fit=crop' },
  { id: 5, name: 'MedPlus Pharmacy', category: 'Pharmacy', contact: '+91 6543210987', image: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=200&auto=format&fit=crop' },
  { id: 6, name: 'Apollo Medical Shop', category: 'Medicine Shop', contact: '+91 5432109876', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=200&auto=format&fit=crop' },
  { id: 7, name: 'Wellness Pharma Hub', category: 'Pharmacy', contact: '+91 4321098765', image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?q=80&w=200&auto=format&fit=crop' },
  { id: 8, name: 'Sanjivani Drug Store', category: 'Medicine Shop', contact: '+91 3210987654', image: 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea?q=80&w=200&auto=format&fit=crop' },
];

export default function StoresScreen() {
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
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View className="ml-4">
              <Text className="text-[#1E293B] text-xl font-bold tracking-wider">Stores</Text>
              <Text className="text-gray-700 text-md opacity-90 tracking-wider">Listed Store</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="search" size={20} color="#1E293B" />
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

      {/* Scrollable Store List */}
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        {stores.map((item) => (
          <TouchableOpacity
            key={item.id}
            className="bg-white mx-4 mb-3 p-3 rounded-xl shadow-sm flex-row items-center"
            onPress={() => router.push({ pathname: '/pages/storeInfo', params: { storeId: item.id, storeName: item.name, storeCategory: item.category, storeContact: item.contact, storeImage: item.image } })}
          >
            {/* Store Image */}
            <Image
              source={{ uri: item.image }}
              className="w-[70px] h-[70px] rounded-xl bg-gray-200"
              resizeMode="cover"
            />

            {/* Content */}
            <View className="flex-1 ml-4 justify-center">
              <Text className="text-[15px] font-bold text-gray-800">{item.name}</Text>
              <Text className="text-xs text-gray-600 mt-1">Category : {item.category}</Text>
              <Text className="text-xs text-gray-600 mt-0.5">Contact : {item.contact}</Text>
            </View>

            {/* Arrow */}
            <View className="ml-2 justify-center">
              <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB - Navigate to Create Store page */}
      <TouchableOpacity
        className="absolute bottom-[100px] right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
        onPress={() => router.push('/pages/createStore')}
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
