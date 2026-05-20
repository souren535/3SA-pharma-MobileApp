import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNotificationStore } from '../../store/store';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications, fetchNotifications, isLoading, markAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    // You could navigate to specific details here if needed
  };

  return (
    <View className="flex-1 bg-[#F3F6F8]">
      {/* Header */}
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ 
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, 
          paddingBottom: 24, 
          paddingHorizontal: 20 
        }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="ml-4">
            <Text className="text-white text-xl font-bold">Notifications</Text>
            <Text className="text-white/80 text-xs mt-1">Stay updated with latest activities</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#1A3F75" />
          </View>
        ) : notifications.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium">No notifications yet</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const getNotificationIconDetails = (targetType: string, isRead: boolean) => {
              if (isRead) {
                switch (targetType?.toLowerCase()) {
                  case 'order':
                    return { icon: 'shopping-cart', bgColor: 'bg-gray-50', iconColor: '#9CA3AF' };
                  case 'warning':
                  case 'alert':
                    return { icon: 'warning', bgColor: 'bg-gray-50', iconColor: '#9CA3AF' };
                  case 'announcement':
                  case 'broadcast':
                    return { icon: 'campaign', bgColor: 'bg-gray-50', iconColor: '#9CA3AF' };
                  default:
                    return { icon: 'notifications', bgColor: 'bg-gray-50', iconColor: '#9CA3AF' };
                }
              }
              
              switch (targetType?.toLowerCase()) {
                case 'order':
                  return { icon: 'shopping-cart', bgColor: 'bg-blue-50', iconColor: '#1A3F75' };
                case 'warning':
                case 'alert':
                  return { icon: 'warning', bgColor: 'bg-red-50', iconColor: '#DC2626' };
                case 'announcement':
                case 'broadcast':
                  return { icon: 'campaign', bgColor: 'bg-amber-50', iconColor: '#D97706' };
                default:
                  return { icon: 'notifications', bgColor: 'bg-sky-50', iconColor: '#0284C7' };
              }
            };

            const iconDetails = getNotificationIconDetails(item.target_type, item.is_read);

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleNotificationPress(item)}
                className={`bg-white mb-3 p-4 rounded-2xl shadow-sm border-l-4 ${
                  item.is_read ? 'border-gray-200' : 'border-[#1A3F75]'
                }`}
              >
                <View className="flex-row items-start">
                  <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${iconDetails.bgColor}`}>
                    <MaterialIcons 
                      name={iconDetails.icon as any} 
                      size={20} 
                      color={iconDetails.iconColor} 
                    />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className={`text-[15px] ${item.is_read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                        {item.title}
                      </Text>
                      {!item.is_read && (
                        <View className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </View>
                    <Text className="text-gray-500 text-sm leading-5">
                      {item.message}
                    </Text>
                    <Text className="text-gray-400 text-[10px] mt-2 uppercase font-bold tracking-wider">
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
