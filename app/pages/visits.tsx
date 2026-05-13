import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useVisitStore } from '../../store/store';

export default function VisitsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { visits, isLoading, fetchVisits } = useVisitStore();

  useEffect(() => {
    fetchVisits();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A3F75', '#1A3F75']}
        style={{ paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 20, paddingBottom: 24, paddingHorizontal: 20 }}
      >
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Visit History</Text>
            <Text className="text-white/80 text-xs mt-1">All your store visits</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#1A3F75" />
            <Text className="text-gray-400 text-xs mt-3 font-medium">Loading visits...</Text>
          </View>
        ) : visits.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="text-gray-400 text-sm font-medium">No visit history found</Text>
          </View>
        ) : (
          visits.map((visit) => {
            const dateObj = new Date(visit.created_at);
            const formattedDate = dateObj.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            const formattedTime = dateObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            });

            return (
              <View
                key={visit.id}
                className="bg-white mb-3 p-4 rounded-xl shadow-sm border border-gray-50"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-[#EEF2FF] rounded-full items-center justify-center mr-3">
                      <Ionicons name="storefront" size={18} color="#4C73B6" />
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className="text-[15px] font-bold text-gray-800" numberOfLines={1}>{visit.shop?.shop_name || 'Unknown Store'}</Text>
                      <Text className="text-[12px] text-gray-500 mt-0.5">{visit.shop?.owner_name}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs font-bold text-[#1A3F75]">{formattedDate}</Text>
                    <Text className="text-[10px] font-semibold text-gray-400">{formattedTime}</Text>
                  </View>
                </View>
                
                <View className="bg-gray-50 p-3 rounded-lg mt-2 border border-gray-100">
                  <Text className="text-[11px] font-bold text-gray-400 uppercase mb-1">Visit Note</Text>
                  <Text className="text-[13px] text-gray-700">{visit.notes || 'No notes added.'}</Text>
                </View>
              </View>
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
