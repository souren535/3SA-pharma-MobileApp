import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useOrderStore, useAttendanceStore } from "../../store/store";

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const availableYears = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function OrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { allOrders, fetchAllOrders, isLoading } = useOrderStore();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const { isWorking } = useAttendanceStore();

  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchAllOrders();
    }, []),
  );

  // Center the selected date on load or change
  useEffect(() => {
    if (scrollViewRef.current) {
      // Approximate position (width per item is ~72px including margin)
      const index = selectedDate.getDate() - 1;
      scrollViewRef.current.scrollTo({ x: index * 72 - 100, animated: true });
    }
  }, [selectedDate]);

  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const daysInMonth = getDaysInMonth(
    selectedDate.getMonth(),
    selectedDate.getFullYear(),
  );

  const filteredOrders = (Array.isArray(allOrders) ? allOrders : []).filter(
    (order) => {
      const orderDate = new Date(order.billing_date || order.created_at);
      const isSameDate =
        orderDate.getDate() === selectedDate.getDate() &&
        orderDate.getMonth() === selectedDate.getMonth() &&
        orderDate.getFullYear() === selectedDate.getFullYear();

      const matchesSearch =
        searchQuery === "" ||
        order.order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shop?.shop_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      return isSameDate && matchesSearch;
    },
  );

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient
        colors={["#1A3F75", "#F3F6F8"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 16,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white/60 p-1.5 rounded-full"
            >
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            {!showSearch ? (
              <View className="ml-4 flex-1">
                <Text className="text-[#1E293B] text-xl font-bold">Orders</Text>
                <Text className="text-gray-600 text-xs opacity-90 mt-0.5">
                  All Order & Payment Summary
                </Text>
              </View>
            ) : (
              <TextInput
                className="flex-1 ml-4 bg-white/80 rounded-xl px-3 py-1.5 text-gray-800"
                placeholder="Search orders..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
            )}
          </View>
          <View className="flex-row gap-3 ml-2">
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={() => setShowSearch(!showSearch)}
            >
              <Ionicons
                name={showSearch ? "close" : "search"}
                size={20}
                color="#1E293B"
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Attendance Required Screen */}
      {!isWorking ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="w-24 h-24 bg-[#FEF3C7] rounded-full items-center justify-center mb-5">
            <Ionicons name="finger-print" size={48} color="#D97706" />
          </View>
          <Text className="text-gray-800 text-xl font-bold mb-2 text-center">
            Attendance Required
          </Text>
          <Text className="text-gray-500 text-center text-sm leading-5 mb-6">
            Please mark your attendance on the Home screen to view and manage
            orders.
          </Text>
          <TouchableOpacity
            className="bg-[#D97706] px-8 py-3.5 rounded-2xl shadow-md"
            onPress={() => router.push("/(tabs)")}
          >
            <Text className="text-white font-bold text-sm">Go to Home</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Fixed Date Filter */}
          <View className="bg-[#F3F6F8]">
            <View className="flex-row justify-end px-5 mt-3">
              <TouchableOpacity
                className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm mr-2"
                onPress={() => setShowMonthPicker(true)}
              >
                <Text className="text-white font-medium text-xs mr-1">
                  {monthNames[selectedDate.getMonth()]}
                </Text>
                <Ionicons name="caret-down" size={12} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row items-center bg-[#1A3F75] px-3 py-1.5 rounded-lg shadow-sm"
                onPress={() => setShowYearPicker(true)}
              >
                <Text className="text-white font-medium text-xs mr-1">
                  {selectedDate.getFullYear()}
                </Text>
                <Ionicons name="caret-down" size={12} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Fixed Date Strip */}
            <View className="mt-3 mb-3 flex-row">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
                ref={scrollViewRef}
              >
                {daysInMonth.map((d, i) => {
                  const isActive = d.getDate() === selectedDate.getDate();
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => setSelectedDate(d)}
                      className={`items-center justify-center w-[60px] h-[76px] mr-3 rounded-[18px] ${
                        isActive
                          ? "bg-[#4C73B6] shadow-md"
                          : "bg-white shadow-sm"
                      }`}
                    >
                      <Text
                        className={`text-[11px] font-bold ${isActive ? "text-white" : "text-gray-400"}`}
                      >
                        {dayNames[d.getDay()]}
                      </Text>
                      <Text
                        className={`text-[22px] font-bold mt-1 ${isActive ? "text-white" : "text-gray-800"}`}
                      >
                        {d.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Scrollable Order List */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 90 }}
            showsVerticalScrollIndicator={false}
          >
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color="#1A3F75"
                style={{ marginTop: 50 }}
              />
            ) : filteredOrders.length === 0 ? (
              <Text className="text-center text-gray-500 mt-10">
                No orders found for this date.
              </Text>
            ) : (
              filteredOrders.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center"
                  onPress={() =>
                    router.push({
                      pathname: "/pages/orderDetails",
                      params: {
                        id: item.id,
                        isOrder: "true",
                        orderNo: item.order_no,
                        store: item.shop?.shop_name,
                        amount: item.total_amount,
                      },
                    })
                  }
                >
                  {/* Circle Icon */}
                  <View className="w-12 h-12 rounded-xl items-center justify-center bg-[#F3F6F8]">
                    <Ionicons name="document-text" size={24} color="#4C73B6" />
                  </View>

                  {/* Content */}
                  <View className="flex-1 ml-4">
                    <View className="flex-row justify-between items-start">
                      <Text
                        className="text-sm font-bold text-gray-800"
                        numberOfLines={1}
                      >
                        {item.order_no}
                      </Text>
                      <Text className="text-xs font-bold text-[#FF4A4A]">
                        Rs. {item.total_amount}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-600 mt-0.5">
                      Billing Date :{" "}
                      {new Date(
                        item.billing_date || item.created_at,
                      ).toLocaleDateString()}
                    </Text>
                    <View className="flex-row justify-between items-center mt-1">
                      <View className="flex-row items-center">
                        <Text className="text-xs font-semibold text-gray-500">
                          Status :{" "}
                        </Text>
                        <Text
                          className="text-xs font-bold"
                          style={{
                            color:
                              item.status?.toLowerCase() === "pending"
                                ? "#F59E0B"
                                : item.status?.toLowerCase() === "accepted"
                                  ? "#3B82F6"
                                  : item.status?.toLowerCase() === "delivered"
                                    ? "#10B981"
                                    : item.status?.toLowerCase() === "completed"
                                      ? "#10B981"
                                      : item.status?.toLowerCase() ===
                                          "cancelled"
                                        ? "#EF4444"
                                        : item.status?.toLowerCase() ===
                                            "rejected"
                                          ? "#EF4444"
                                          : "#3AA58E",
                          }}
                        >
                          {item.status}
                        </Text>
                      </View>
                      <Text
                        className="text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md"
                        numberOfLines={1}
                      >
                        {item.shop?.shop_name || "Unknown Store"}
                      </Text>
                    </View>
                  </View>

                  {/* Arrow */}
                  <View className="ml-2 justify-center">
                    <Ionicons name="caret-forward" size={14} color="#A0AEC0" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            className="absolute bottom-[125px] right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
            onPress={() => router.push("/pages/orderCreate")}
          >
            <Feather name="plus" size={26} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Month Picker Modal */}
      <Modal visible={showMonthPicker} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Select Month
              </Text>
              <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-between">
              {monthNames.map((month, index) => (
                <TouchableOpacity
                  key={month}
                  className={`w-[30%] py-3 mb-3 items-center rounded-xl ${selectedDate.getMonth() === index ? "bg-[#1A3F75]" : "bg-gray-100"}`}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setMonth(index);
                    setSelectedDate(newDate);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text
                    className={`font-bold ${selectedDate.getMonth() === index ? "text-white" : "text-gray-700"}`}
                  >
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Year Picker Modal */}
      <Modal visible={showYearPicker} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Select Year
              </Text>
              <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <View className="flex-col">
              {availableYears.map((year) => (
                <TouchableOpacity
                  key={year}
                  className={`w-full py-4 mb-3 items-center rounded-xl ${selectedDate.getFullYear() === year ? "bg-[#1A3F75]" : "bg-gray-100"}`}
                  onPress={() => {
                    const newDate = new Date(selectedDate);
                    newDate.setFullYear(year);
                    setSelectedDate(newDate);
                    setShowYearPicker(false);
                  }}
                >
                  <Text
                    className={`font-bold ${selectedDate.getFullYear() === year ? "text-white" : "text-gray-700"}`}
                  >
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
});
