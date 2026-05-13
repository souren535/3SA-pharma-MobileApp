import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotificationStore } from '../../store/store';
import { ActivityIndicator } from 'react-native';

export default function NotificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { notifications, isLoading, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
            <Text className="text-white/80 text-xs mt-1">You have {unreadCount} unread messages</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#1A3F75" />
            <Text className="text-gray-400 text-xs mt-3 font-medium">Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="text-gray-400 text-sm font-medium">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const isRead = item.is_read;
            const title = item.title || 'Notification';
            const desc = item.message || 'You have a new notification.';
            const time = new Date(item.created_at).toLocaleDateString('en-GB') + ' ' + new Date(item.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit'});
            
            return (
              <TouchableOpacity 
                key={item.id} 
                className={`bg-white p-4 rounded-xl shadow-sm mb-3 border ${isRead ? 'border-transparent' : 'border-[#4C73B6]/30'} flex-row items-start`}
                onPress={() => {
                  if (!isRead) markAsRead(item.id);
                }}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${isRead ? 'bg-[#F3F6F8]' : 'bg-[#EBF8F5]'}`}>
                  <Ionicons
                    name="notifications"
                    size={22}
                    color={isRead ? '#9CA3AF' : '#3AA58E'}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className={`font-bold text-[15px] ${isRead ? 'text-gray-700' : 'text-gray-900'}`}>{title}</Text>
                    <Text className="text-gray-400 text-[10px]">{time}</Text>
                  </View>
                  <Text className={`text-sm ${isRead ? 'text-gray-500' : 'text-gray-700'}`}>{desc}</Text>
                </View>
                {!isRead && <View className="w-2.5 h-2.5 bg-[#4C73B6] rounded-full mt-1.5 ml-2" />}
              </TouchableOpacity>
            );
          })
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
