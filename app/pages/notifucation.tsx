import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const notifications = [
    { id: 1, title: 'Order Delivered', desc: 'Your order #ABC12345 has been delivered.', time: '2 mins ago', type: 'success', read: false },
    { id: 2, title: 'Payment Received', desc: 'Payment of Rs. 5700 was successful.', time: '1 hour ago', type: 'info', read: false },
    { id: 3, title: 'Special Offer', desc: 'Get 20% off on your next purchase.', time: 'Yesterday', type: 'offer', read: true },
    { id: 4, title: 'Order Dispatched', desc: 'Your order #XYZ9876 is out for delivery.', time: '2 days ago', type: 'delivery', read: true },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 24, paddingHorizontal: 20, }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Notifications</Text>
            <Text className="text-white/80 text-xs mt-1">You have 2 unread messages</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {notifications.map((item) => (
          <TouchableOpacity key={item.id} className={`bg-white p-4 rounded-xl shadow-sm mb-3 border ${item.read ? 'border-transparent' : 'border-[#4C73B6]/30'} flex-row items-start`}>
             <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.type === 'success' ? 'bg-[#EBF8F5]' : item.type === 'info' ? 'bg-[#F0F4FF]' : item.type === 'offer' ? 'bg-[#FFF4E5]' : 'bg-[#FFF0F0]'}`}>
               <Ionicons
                 name={item.type === 'success' ? 'checkmark-circle' : item.type === 'info' ? 'card' : item.type === 'offer' ? 'pricetag' : 'car'}
                 size={22}
                 color={item.type === 'success' ? '#3AA58E' : item.type === 'info' ? '#4C73B6' : item.type === 'offer' ? '#F59E0B' : '#FF4A4A'}
               />
             </View>
             <View className="flex-1">
               <View className="flex-row justify-between items-center mb-1">
                 <Text className={`font-bold text-[15px] ${item.read ? 'text-gray-700' : 'text-gray-900'}`}>{item.title}</Text>
                 <Text className="text-gray-400 text-[10px]">{item.time}</Text>
               </View>
               <Text className={`text-sm ${item.read ? 'text-gray-500' : 'text-gray-700'}`}>{item.desc}</Text>
             </View>
             {!item.read && <View className="w-2.5 h-2.5 bg-[#4C73B6] rounded-full mt-1.5 ml-2" />}
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
