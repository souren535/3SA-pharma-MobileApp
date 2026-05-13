import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AttendanceGateProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * A modal that warns the user they must mark attendance before performing
 * restricted actions like creating stores, orders, or transactions.
 */
export default function AttendanceGate({ visible, onClose }: AttendanceGateProps) {
  const router = useRouter();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 justify-center items-center px-8">
        <View className="bg-white rounded-3xl w-full p-6 items-center shadow-xl">
          {/* Icon */}
          <View className="w-20 h-20 rounded-full bg-[#FEF3C7] items-center justify-center mb-4">
            <MaterialIcons name="fingerprint" size={40} color="#D97706" />
          </View>

          {/* Title */}
          <Text className="text-[20px] font-bold text-gray-800 mb-2 text-center">
            Attendance Required
          </Text>

          {/* Message */}
          <Text className="text-[14px] text-gray-500 text-center mb-6 leading-5">
            Please mark your attendance first before performing this action. Go to the Home screen and tap the power button to start your work day.
          </Text>

          {/* Buttons */}
          <View className="flex-row w-full gap-3">
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-2xl bg-gray-100 items-center"
              onPress={onClose}
            >
              <Text className="text-gray-600 font-bold text-[14px]">Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3.5 rounded-2xl bg-[#D97706] items-center"
              onPress={() => {
                onClose();
                router.push('/(tabs)');
              }}
            >
              <Text className="text-white font-bold text-[14px]">Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
