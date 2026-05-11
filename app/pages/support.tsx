import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
            <Text className="text-white text-xl font-bold">Help & Support</Text>
            <Text className="text-white/80 text-xs mt-1">We are here to help you</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
         {/* Search */}
         <View className="bg-white px-4 py-3 rounded-xl flex-row items-center shadow-sm mb-6 border border-gray-100">
           <Ionicons name="search" size={20} color="#A0AEC0" />
           <TextInput
             placeholder="Search for help..."
             className="flex-1 ml-3 text-gray-800 text-sm"
             placeholderTextColor="#A0AEC0"
           />
         </View>

         {/* Options */}
         <View className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#EBF8F5] rounded-full items-center justify-center mr-3">
                  <Ionicons name="chatbubbles-outline" size={20} color="#3AA58E" />
                </View>
                <Text className="text-gray-800 font-medium">Chat with us</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#FFF0F0] rounded-full items-center justify-center mr-3">
                  <Ionicons name="call-outline" size={20} color="#FF4A4A" />
                </View>
                <Text className="text-gray-800 font-medium">Call Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-[#F0F4FF] rounded-full items-center justify-center mr-3">
                  <Ionicons name="mail-outline" size={20} color="#4C73B6" />
                </View>
                <Text className="text-gray-800 font-medium">Email us</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#A0AEC0" />
            </TouchableOpacity>
         </View>

         <Text className="text-gray-800 font-bold text-lg mb-4">FAQs</Text>
         {[
           { q: 'How to track my order?', a: 'You can easily track your order in the Orders tab by selecting the specific order.' },
           { q: 'What is the refund policy?', a: 'Refunds are processed within 5-7 business days after the cancellation is approved.' },
           { q: 'How to contact the store directly?', a: 'Store contact details are available in the order details screen.' }
         ].map((faq, i) => (
           <View key={i} className="bg-white p-4 rounded-xl shadow-sm mb-3 border border-gray-100">
             <Text className="text-gray-800 font-bold mb-2">{faq.q}</Text>
             <Text className="text-gray-500 text-sm leading-5">{faq.a}</Text>
           </View>
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
