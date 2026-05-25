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
  RefreshControl,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useOrderStore, useAttendanceStore } from "../../store/store";
import LottieView from "lottie-react-native";

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

const getStatusColor = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "pending") return "#F59E0B";
  if (s === "accepted") return "#3B82F6";
  if (s === "delivered" || s === "completed") return "#10B981";
  if (s === "cancelled" || s === "rejected") return "#EF4444";
  return "#3AA58E";
};

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
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
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

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
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllOrders().finally(() => setRefreshing(false));
  }, [fetchAllOrders]);

  const scrollViewRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      setSelectedDate(new Date());
      fetchAllOrders();
      return () => {
        setShowSearch(false);
        setSearchQuery("");
      };
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

  const filteredOrders = (Array.isArray(allOrders) ? allOrders : [])
    .filter((order) => {
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
    })
    .sort((a, b) => b.id - a.id);

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
                placeholderTextColor={"#1E293B"}
                onChangeText={setSearchQuery}
                autoFocus
              />
            )}
          </View>
          <View className="flex-row gap-3 ml-2">
            <TouchableOpacity
              className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm"
              onPress={() => {
                if (showSearch) {
                  setSearchQuery("");
                  setShowSearch(false);
                } else {
                  setShowSearch(true);
                }
              }}
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
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="transparent"
                colors={["transparent"]}
                style={{ backgroundColor: "transparent" }}
                progressBackgroundColor="transparent"
                progressViewOffset={-1000}
              />
            }
          >

            {isLoading && !refreshing ? (
              <View className="flex-1 items-center justify-center py-20">
                <LottieView
                  source={require("../../assets/animation/pill-optimized.json")}
                  autoPlay
                  loop
                  style={{ width: 150, height: 150 }}
                />
                <Text className="text-gray-500 mt-4 font-medium tracking-wide">
                  Loading Orders...
                </Text>
              </View>
            ) : filteredOrders.length === 0 ? (
              <Text className="text-center text-gray-500 mt-10">
                No orders found for this date.
              </Text>
            ) : (
              filteredOrders.map((item) => {
                const statusColor = getStatusColor(item.status);
                const invoiceNo = item.manual_invoice_no || item.invoice_no;
                return (
                  <TouchableOpacity
                    key={item.id}
                    className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center justify-between relative overflow-hidden"
                    onPress={() =>
                      router.push({
                        pathname: "/pages/orderDetails",
                        params: {
                          id: item.id,
                          isOrder: "true",
                          orderNo: item.order_no,
                          store: item.shop?.shop_name,
                          amount: item.total_amount,
                          date: item.billing_date || item.created_at,
                        },
                      })
                    }
                  >
                    <View className="flex-row items-center flex-1 pr-2">
                      {/* Left Document Icon */}
                      <View className="w-11 h-11 rounded-xl items-center justify-center bg-[#F3F6F8]">
                        <Ionicons
                          name="document-text"
                          size={24}
                          color="#4C73B6"
                        />
                      </View>

                      {/* Middle Info Column */}
                      <View className="flex-1 ml-3 pr-4">
                        <View className="flex-row items-center justify-between">
                          <Text
                            className="text-[14px] font-bold text-gray-800"
                            numberOfLines={1}
                          >
                            {item.order_no}
                          </Text>
                        </View>

                        {invoiceNo && invoiceNo !== null ? (
                          <View>
                            <View className="flex-row items-center justify-between mt-1">
                              <Text
                                className="text-xs text-gray-600 mr-4"
                                numberOfLines={1}
                              >
                                Invoice : {invoiceNo}
                              </Text>
                              <View className="flex-1 items-start">
                                <Text className="text-[15px] font-black text-[#FF4A4A]">
                                  Rs. {item.total_amount}
                                </Text>
                              </View>
                              <View className="w-8 items-center" />
                            </View>
                            <Text className="text-xs text-gray-500 mt-1">
                              Billing Date :{" "}
                              {formatDisplayDate(
                                item.billing_date || item.created_at,
                              )}
                            </Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center justify-between mt-1">
                            <Text
                              className="text-xs text-gray-500 mr-4"
                              numberOfLines={1}
                            >
                              Billing Date :{" "}
                              {formatDisplayDate(
                                item.billing_date || item.created_at,
                              )}
                            </Text>
                            <View className="w-8 items-center" />
                          </View>
                        )}

                        {/* Store name at the bottom-right of the card */}
                        <View className="bg-gray-100 py-1 px-2 rounded-lg self-end mt-1.5">
                          <Text
                            className="text-[10px] text-gray-500 font-semibold"
                            numberOfLines={1}
                          >
                            {item.shop?.shop_name || "Unknown Store"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Right-side Full-height Status Color Strip */}
                    <View
                      className="absolute right-0 top-0 bottom-0 w-1.5"
                      style={{ backgroundColor: statusColor }}
                    />
                  </TouchableOpacity>
                );
              })
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

      {/* Full Screen Loading Overlay */}
      {refreshing && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 9999, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView
            source={require("../../assets/animation/pill-optimized.json")}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
});
