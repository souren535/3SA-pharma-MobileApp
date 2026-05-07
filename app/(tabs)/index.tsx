import React from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="flex-1 bg-[#F1F5F9]">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== HEADER GRADIENT ===== */}
        <LinearGradient
          colors={["#19212C", "#598CD7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            paddingTop: insets.top + 12,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            overflow: "hidden",
          }}
          className="px-5 pb-8"
        >
          {/* Top row: Brand + Date */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[20px] font-extrabold text-white tracking-[0.5px]">
              Delivrise SFA
            </Text>
            <Text className="text-[13px] text-white/70 font-medium">
              {formattedDate}
            </Text>
          </View>

          {/* User card */}
          <View className="flex-row items-center bg-white/15 rounded-2xl py-3 px-3.5 mb-5">
            <View className="w-[38px] h-[38px] rounded-full bg-[#1A3F75] justify-center items-center mr-3">
              <Text className="text-[16px] font-bold text-white">S</Text>
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-white">
              Souren Khan
            </Text>
            <View className="items-center relative">
              <TouchableOpacity className="w-[40px] h-[40px] rounded-full bg-white justify-center items-center z-10">
                <MaterialIcons
                  name="power-settings-new"
                  size={24}
                  color="green"
                />
              </TouchableOpacity>
              <LottieView
                source={require("@/assets/animation/blink-animation.json")}
                autoPlay
                loop
                style={{
                  width: 100,
                  height: 100,
                  position: "absolute",
                  bottom: -30,
                  right: -30,
                  // zIndex: 10,
                }}
              />
            </View>
          </View>

          {/* Tagline / Stores Today Card inside header */}
          <View className="flex-row items-center bg-white rounded-[18px] p-[18px] mb-5 shadow-sm shadow-black/10">
            <View className="mr-3.5">
              <View className="w-[46px] h-[46px] rounded-[14px] bg-[#EFF6FF] justify-center items-center">
                <MaterialIcons name="store" size={22} color="#1E3A8A" />
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-[#64748B] mb-1">
                Stores Today
              </Text>
              <View className="flex-row items-baseline">
                <Text className="text-[26px] font-extrabold text-[#5789D1]">
                  5
                </Text>
                <Text className="text-[20px] font-normal text-[#94A3B8]">
                  {" "}
                  /{" "}
                </Text>
                <Text className="text-[26px] font-extrabold">12</Text>
              </View>
              <Text className="text-[12px] font-medium text-[#94A3B8] mt-0.5">
                Visited / Assigned
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ===== BODY CONTENT ===== */}
        <View className="px-4 -mt-3">
          {/* Today's Orders Section */}
          <View className="flex-row justify-between items-center mb-3 mt-8">
            <Text className="text-[17px] font-bold text-[#1E293B]">
              Today&apos;s Orders
            </Text>
            <TouchableOpacity>
              <MaterialIcons name="chevron-right" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-6 gap-[10px]">
            {/* Pending */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#FFFBEB]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2">
                <MaterialIcons name="schedule" size={18} color="#D97706" />
              </View>
              <Text className="text-[20px] font-extrabold mb-0.5 text-[#D97706]">
                4
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Pending
              </Text>
            </View>

            {/* Delivered */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#ECFDF5]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#D1FAE5]">
                <MaterialIcons name="check-circle" size={18} color="#059669" />
              </View>
              <Text className="text-[20px] font-extrabold mb-0.5 text-[#059669]">
                6
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Delivered
              </Text>
            </View>

            {/* Orders */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#EFF6FF]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#DBEAFE]">
                <MaterialIcons name="inventory" size={18} color="#2563EB" />
              </View>
              <Text className="text-[20px] font-extrabold mb-0.5 text-[#2563EB]">
                10
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Orders
              </Text>
            </View>

            {/* Cancelled */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#FEF2F2]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#FEE2E2]">
                <MaterialIcons name="cancel" size={18} color="#DC2626" />
              </View>
              <Text className="text-[20px] font-extrabold mb-0.5 text-[#DC2626]">
                2
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Cancelled
              </Text>
            </View>
          </View>

          {/* Priority Actions */}
          <View className="flex-row justify-between items-center mb-3 mt-1">
            <Text className="text-[17px] font-bold text-[#1E293B]">
              Priority Actions
            </Text>
          </View>

          {/* Visit Next Store */}
          <TouchableOpacity className="flex-row items-center bg-white rounded-2xl p-4 mb-2.5 shadow-sm shadow-black/5">
            <View className="w-[42px] h-[42px] rounded-[13px] justify-center items-center mr-3.5 bg-[#EDE9FE]">
              <MaterialIcons name="store" size={20} color="#7C3AED" />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1E293B] mb-0.5">
                Visit Next Store
              </Text>
              <Text className="text-[12px] font-medium text-[#94A3B8]">
                Sharma Medical Store, Andheri East
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
          </TouchableOpacity>

          {/* Place New Order */}
          <TouchableOpacity className="flex-row items-center bg-white rounded-2xl p-4 mb-2.5 shadow-sm shadow-black/5">
            <View className="w-[42px] h-[42px] rounded-[13px] justify-center items-center mr-3.5 bg-[#DBEAFE]">
              <MaterialIcons
                name="add-shopping-cart"
                size={20}
                color="#2563EB"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-[#1E293B] mb-0.5">
                Place New Order
              </Text>
              <Text className="text-[12px] font-medium text-[#94A3B8]">
                Create order for a store
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
