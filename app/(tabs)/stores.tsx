import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image, ActivityIndicator, Modal, Alert, TextInput, RefreshControl } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useShopStore, IMAGE_BASE_URL, useAttendanceStore } from '../../store/store';
import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
// Helper to get local YYYY-MM-DD string
const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to get dates for a given month and year
const getDatesForMonth = (monthIndex: number, year: number) => {
  const dates = [];
  const numDays = new Date(year, monthIndex + 1, 0).getDate();

  for (let i = 1; i <= numDays; i++) {
    const date = new Date(year, monthIndex, i);
    dates.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: i.toString(),
      fullDate: getLocalDateString(date),
    });
  }
  return dates;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function StoresScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { shops, fetchShops, isLoading } = useShopStore();

  const now = new Date();
  const [selectedDate, setSelectedDate] = useState(getLocalDateString(now));
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const { isWorking } = useAttendanceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShops().finally(() => setRefreshing(false));
  }, [fetchShops]);

  const monthDates = useMemo(() => getDatesForMonth(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  // Reset to today whenever the tab is focused
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const todayStr = getLocalDateString(today);
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      const todayDay = today.getDate();

      setSelectedDate(todayStr);
      setSelectedMonth(todayMonth);
      setSelectedYear(todayYear);

      // Auto-scroll to today
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: (todayDay - 1) * 73, animated: true });
      }, 500);

      fetchShops();

      return () => {
        setShowSearch(false);
        setSearchQuery("");
      };
    }, [fetchShops])
  );

  // Filter shops by selected date
  const filteredShops = useMemo(() => {
    // return shops.filter(shop => {
    //   const shopDate = shop.created_at.split('T')[0];
    //   return shopDate === selectedDate;
    // });
    if (!searchQuery) return shops;
    return shops.filter(shop => shop.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [shops, selectedDate, searchQuery]);

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
            {!showSearch ? (
              <View className="ml-4 flex-1">
                <Text className="text-[#1E293B] text-xl font-bold tracking-wider">Stores</Text>
                <Text className="text-gray-700 text-md opacity-90 tracking-wider">Listed Store</Text>
              </View>
            ) : (
              <TextInput
                className="flex-1 ml-4 bg-white/80 rounded-xl px-4 py-1.5 text-gray-800"
                placeholder="Search stores..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#1E293B"
                autoFocus
              />
            )}
          </View>
          <View className="flex-row gap-3 ml-2">
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={() => {
                if (showSearch) {
                  setSearchQuery("");
                  setShowSearch(false);
                } else {
                  setShowSearch(true);
                }
              }}
            >
              <Ionicons name={showSearch ? "close" : "search"} size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Attendance Required Screen */}
      {!isWorking ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-24 h-24 bg-[#FEF3C7] rounded-full items-center justify-center mb-5">
            <MaterialIcons name="fingerprint" size={48} color="#D97706" />
          </View>
          <Text className="text-gray-800 text-xl font-bold mb-2 text-center">Attendance Required</Text>
          <Text className="text-gray-500 text-center text-sm leading-5 mb-6">
            Please mark your attendance on the Home screen to view and manage stores.
          </Text>
          <TouchableOpacity
            className="bg-[#D97706] px-8 py-3.5 rounded-2xl shadow-md"
            onPress={() => router.push('/(tabs)')}
          >
            <Text className="text-white font-bold text-sm">Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
      <>
      {/* Fixed Date Filter */}
      {false && (
      <View className="bg-[#F3F6F8]">
        <View className="flex-row justify-end px-5 mt-3">
          <TouchableOpacity
            onPress={() => setShowMonthPicker(true)}
            className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm mr-2"
          >
            <Text className="text-white font-medium text-xs mr-1">{MONTHS[selectedMonth]}</Text>
            <Ionicons name="calendar-outline" size={12} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm">
            <Text className="text-white font-medium text-xs mr-1">{selectedYear}</Text>
          </View>
        </View>

        {/* Fixed Date Strip */}
        <View className="mt-3 mb-3 flex-row">
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {monthDates.map((d, i) => {
              const isActive = d.fullDate === selectedDate;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedDate(d.fullDate)}
                  className={`items-center justify-center w-[60px] h-[76px] mr-3 rounded-[18px] ${
                    isActive ? 'bg-[#4C73B6] shadow-md' : 'bg-white shadow-sm'
                  }`}
                >
                  <Text className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{d.day}</Text>
                  <Text className={`text-[22px] font-bold mt-1 ${isActive ? 'text-white' : 'text-gray-800'}`}>{d.date}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
      )}

      {/* Scrollable Store List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="transparent"
            colors={["transparent"]}
            style={{ backgroundColor: "transparent" }}
            progressBackgroundColor="transparent"
            progressViewOffset={-5000}
          />
        }
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <LottieView
              source={require('../../assets/animation/pill-optimized.json')}
              autoPlay
              loop
              style={{ width: 150, height: 150 }}
            />
            <Text className="text-gray-500 mt-4 font-medium tracking-wide">Loading Stores...</Text>
          </View>
        ) : filteredShops.length > 0 ? (
          filteredShops.map((item) => {
            const storeImageUrl = item.images && item.images.length > 0
              ? (item.images[0].image_url.startsWith('http') ? item.images[0].image_url : `${IMAGE_BASE_URL}${item.images[0].image_url.startsWith('/') ? '' : '/'}${item.images[0].image_url}`)
              : 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=200&auto=format&fit=crop';

            return (
              <TouchableOpacity
                key={item.id}
                className="bg-white mx-4 mb-3 p-3 rounded-xl shadow-sm flex-row items-center border border-gray-50"
                onPress={() => {
                  if (!isWorking) {
                    Alert.alert(
                      "Action Required",
                      "Please mark your attendance (start work) before viewing store details."
                    );
                    return;
                  }
                  router.push({
                    pathname: '/pages/storeInfo',
                    params: {
                      storeId: item.id,
                      storeName: item.shop_name,
                      storeCategory: item.category,
                      storeContact: item.contact,
                      storeImage: storeImageUrl
                    }
                  });
                }}
              >
                <Image
                  source={{ uri: storeImageUrl }}
                  className="w-[74px] h-[74px] rounded-xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-4 justify-center">
                  <Text className="text-[15px] font-bold text-gray-800" numberOfLines={1}>{item.shop_name}</Text>
                  <View className="flex-row items-center mt-1.5">
                    <MaterialIcons name="local-pharmacy" size={14} color="#64748B" />
                    <Text className="text-[11px] text-[#64748B] ml-1.5 font-medium">{item.category}</Text>
                    <Text className="text-[10px] text-gray-400 mx-2">|</Text>
                    <Ionicons name="map-outline" size={12} color="#64748B" />
                    <Text className="text-[11px] text-[#64748B] ml-1 font-medium" numberOfLines={1}>{item.route.name}</Text>
                  </View>
                  <View className="flex-row items-center mt-1">
                    <Feather name="phone" size={12} color="#64748B" />
                    <Text className="text-[11px] text-[#64748B] ml-1.5 font-medium">{item.contact}</Text>
                  </View>
                </View>
                <View className="ml-2 justify-center">
                  <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center py-20 px-10">
            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="storefront" size={40} color="#94A3B8" />
            </View>
            <Text className="text-gray-800 text-lg font-bold mb-1">No Stores Found</Text>
            <Text className="text-gray-500 text-center">There are no stores listed for this region or date yet.</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB - Navigate to Create Store page */}
      <TouchableOpacity
        className="absolute bottom-[125px] right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
        onPress={() => router.push('/pages/createStore')}
      >
        <Feather name="plus" size={26} color="white" />
      </TouchableOpacity>
      </>
      )}

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: insets.bottom + 20 }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-[#1A3F75]">Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close-circle" size={30} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  className={`p-4 rounded-2xl mb-3 flex-row justify-between items-center ${selectedMonth === index ? 'bg-[#EFF6FF]' : 'bg-gray-50'}`}
                  onPress={() => {
                    setSelectedMonth(index);
                    const isCurrentMonth = index === now.getMonth() && selectedYear === now.getFullYear();
                    const targetDate = isCurrentMonth ? now.getDate() : 1;
                    const dateObj = new Date(selectedYear, index, targetDate);
                    setSelectedDate(getLocalDateString(dateObj));
                    setShowMonthPicker(false);
                    // Scroll to the selected date
                    setTimeout(() => {
                      scrollRef.current?.scrollTo({ x: (targetDate - 1) * 73, animated: true });
                    }, 300);
                  }}
                >
                  <Text className={`text-lg ${selectedMonth === index ? 'text-[#1A3F75] font-bold' : 'text-gray-600 font-medium'}`}>
                    {month}
                  </Text>
                  {selectedMonth === index && <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6F8',
  },
});
