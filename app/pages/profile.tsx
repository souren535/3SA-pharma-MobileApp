import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuItems = [
    { icon: 'person-outline', title: 'Edit Profile', route: null, color: '#4C73B6', bg: '#F0F4FF' },
    { icon: 'location-outline', title: 'Shipping Address', route: null, color: '#F59E0B', bg: '#FFF4E5' },
    { icon: 'time-outline', title: 'Order History', route: '/(tabs)/orders', color: '#3AA58E', bg: '#EBF8F5' },
    { icon: 'card-outline', title: 'Cards & Payments', route: '/pages/payment', color: '#8B5CF6', bg: '#F3E8FF' },
    { icon: 'notifications-outline', title: 'Notifications', route: '/pages/notifucation', color: '#FF4A4A', bg: '#FFF0F0' },
  ];

  const settingsItems = [
    { icon: 'settings-outline', title: 'Settings', route: null, color: '#64748B', bg: '#F1F5F9' },
    { icon: 'help-buoy-outline', title: 'Help & Support', route: '/pages/support', color: '#64748B', bg: '#F1F5F9' },
    { icon: 'log-out-outline', title: 'Logout', route: null, color: '#FF4A4A', bg: '#FFF0F0' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 60, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profile</Text>
          <View className="w-10 h-10" />
        </View>
        
        <View className="items-center mt-2">
          <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-3 border-2 border-white/50">
             <Ionicons name="person" size={40} color="#fff" />
          </View>
          <Text className="text-white text-xl font-bold">John Doe</Text>
          <Text className="text-white/80 text-sm mt-1">+91 9876543210</Text>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 -mt-6" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
         
         <View className="bg-white rounded-2xl shadow-sm mb-6 border border-gray-100 overflow-hidden">
           {menuItems.map((item, index) => (
             <TouchableOpacity 
               key={index} 
               className={`flex-row items-center justify-between p-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
               onPress={() => item.route && router.push(item.route as any)}
             >
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: item.bg }}>
                   <Ionicons name={item.icon as any} size={20} color={item.color} />
                 </View>
                 <Text className="text-gray-800 font-medium text-[15px]">{item.title}</Text>
               </View>
               <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
             </TouchableOpacity>
           ))}
         </View>

         <Text className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-3 ml-2">Preferences</Text>
         <View className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
           {settingsItems.map((item, index) => (
             <TouchableOpacity 
               key={index} 
               className={`flex-row items-center justify-between p-4 ${index !== settingsItems.length - 1 ? 'border-b border-gray-50' : ''}`}
               onPress={() => item.route && router.push(item.route as any)}
             >
               <View className="flex-row items-center">
                 <View className="w-10 h-10 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: item.bg }}>
                   <Ionicons name={item.icon as any} size={20} color={item.color} />
                 </View>
                 <Text className={`font-medium text-[15px] ${item.title === 'Logout' ? 'text-[#FF4A4A]' : 'text-gray-800'}`}>{item.title}</Text>
               </View>
               {item.title !== 'Logout' && <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />}
             </TouchableOpacity>
           ))}
         </View>

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
