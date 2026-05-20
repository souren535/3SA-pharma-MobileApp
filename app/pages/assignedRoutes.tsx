import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouteStore } from '../../store/store';

export default function AssignedRoutesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { routes } = useRouteStore();

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
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">Assigned Routes</Text>
            <Text className="text-white/80 text-xs mt-1">View all your active assigned routes</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {routes.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
              <MaterialIcons name="alt-route" size={40} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 font-medium">No assigned routes yet</Text>
          </View>
        ) : (
          routes.map((route, idx) => (
            <View
              key={route.id || idx}
              className="bg-white mb-4 p-5 rounded-2xl shadow-sm border border-gray-100"
            >
              {/* Route Header Row */}
              <View className="flex-row items-center justify-between border-b border-gray-100 pb-3.5 mb-3.5">
                <View className="flex-row items-center flex-1 mr-2">
                  <View className="w-9 h-9 rounded-xl bg-[#F5F3FF] justify-center items-center mr-3">
                    <MaterialIcons name="alt-route" size={18} color="#7C3AED" />
                  </View>
                  <Text className="text-[16px] font-extrabold text-gray-900 flex-1" numberOfLines={1}>
                    {route.name}
                  </Text>
                </View>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <Text className="text-[11px] font-bold text-emerald-600 uppercase">Active</Text>
                </View>
              </View>

              {/* Areas List */}
              <Text className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
                Areas ({route.areas?.length || 0})
              </Text>
              
              {!route.areas || route.areas.length === 0 ? (
                <Text className="text-gray-500 text-sm italic">No areas listed for this route.</Text>
              ) : (
                <View className="flex-row flex-wrap gap-2">
                  {route.areas.map((area, aIdx) => (
                    <View
                      key={area.id || aIdx}
                      className="flex-row items-center bg-[#F3F4F6] px-3 py-1.5 rounded-xl border border-gray-200"
                    >
                      <MaterialIcons name="location-on" size={12} color="#64748B" />
                      <Text className="text-gray-700 text-xs font-bold ml-1">
                        {area.name}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
