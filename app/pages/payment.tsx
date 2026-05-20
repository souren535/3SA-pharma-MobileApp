import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePaymentStore } from "../../store/store";

export default function PaymentScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { paymentsHistory, isLoading, fetchPaymentsHistory } =
    usePaymentStore();

  // Tab State
  const [activeTab, setActiveTab] = useState<"transactions" | "details">(
    "transactions",
  );

  // Search & Suggestions State
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Month Filter State
  const [selectedMonth, setSelectedMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Helper to extract year and month directly from the raw string to avoid Herme's date parsing and timezone shift bugs
  const extractYearAndMonth = (dateStr: any) => {
    if (!dateStr)
      return { year: new Date().getFullYear(), month: new Date().getMonth() };
    const str = String(dateStr).trim();

    // Check YYYY-MM-DD
    const match = str.match(/(\d{4})[-/](\d{2})[-/](\d{2})/);
    if (match) {
      return {
        year: parseInt(match[1], 10),
        month: parseInt(match[2], 10) - 1, // 0-indexed month
      };
    }

    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    }

    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    };
  };

  // Robust date parser helper to prevent Hermes engine from failing on "YYYY-MM-DD HH:MM:SS"
  const parseDateSafely = (dateStr: any): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;

    const str = String(dateStr).trim();
    let d = new Date(str);
    if (!isNaN(d.getTime())) return d;

    // Convert spaces to T (ISO standard)
    const standardISO = str.replace(" ", "T");
    d = new Date(standardISO);
    if (!isNaN(d.getTime())) return d;

    // Manual splitting for full Herme's compatibility
    try {
      const datePart = str.split(" ")[0];
      const parts = datePart.split("-");
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        let hr = 0,
          min = 0,
          sec = 0;
        const timePart = str.split(" ")[1];
        if (timePart) {
          const tParts = timePart.split(":");
          if (tParts.length >= 2) {
            hr = parseInt(tParts[0], 10);
            min = parseInt(tParts[1], 10);
            if (tParts[2]) {
              sec = parseInt(tParts[2].split(".")[0], 10);
            }
          }
        }
        return new Date(y, m, day, hr, min, sec);
      }
    } catch (e) {
      console.log("Manual date parse failed:", str, e);
    }

    return new Date();
  };

  useEffect(() => {
    fetchPaymentsHistory();
  }, []);

  // Format payments for rendering
  const paymentsList = paymentsHistory.map((item) => {
    const storeName = item.order?.shop?.shop_name || "Unknown Store";
    const orderNo = item.order?.order_no || "";

    const rawDateStr = item.payment_date || item.created_at || "";
    const { year: rawYear, month: rawMonth } = extractYearAndMonth(rawDateStr);

    const dateObj = parseDateSafely(rawDateStr);
    const formattedDate = dateObj
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .toUpperCase();

    const amtNum = parseFloat(item.amount) || 0;

    return {
      id: item.id,
      orderId: item.order_id,
      type: "Payment Collection",
      date:
        formattedDate === "INVALID DATE"
          ? String(rawDateStr).split(" ")[0]
          : formattedDate,
      dateObj: dateObj, // Keep reference for filtering
      rawYear: rawYear,
      rawMonth: rawMonth,
      desc: `${item.payment_mode || "Cash"} Payment ${item.reference_no ? `(${item.reference_no})` : ""}`,
      store: storeName,
      amountNum: amtNum,
      amount: `+ Rs. ${amtNum.toFixed(2)}`,
      status: "Success",
      orderNo: orderNo,
    };
  });

  // Calculate stats based on formatted data
  const totalCollected = paymentsList.reduce(
    (sum, item) => sum + item.amountNum,
    0,
  );
  const totalCollections = paymentsList.length;
  const avgCollection =
    totalCollections > 0 ? totalCollected / totalCollections : 0;

  // Sort descending by ID/date to get the last payment first
  const sortedPayments = [...paymentsList].sort((a, b) => b.id - a.id);
  const lastPaymentAmount =
    sortedPayments.length > 0 ? sortedPayments[0].amountNum : 0;
  const lastPaymentDate =
    sortedPayments.length > 0 ? sortedPayments[0].date : "-";

  // Apply search & month filtering on sortedPayments
  const filteredPayments = sortedPayments.filter((item) => {
    // Search query filter
    const matchesSearch = item.store
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Month & Year filter
    let matchesMonth = true;
    if (selectedMonth) {
      matchesMonth =
        item.rawMonth === selectedMonth.month &&
        item.rawYear === selectedMonth.year;
    }

    return matchesSearch && matchesMonth;
  });

  // Calculate month-specific stats if selectedMonth is set
  const monthFiltered = selectedMonth
    ? paymentsList.filter(
        (p) =>
          p.rawMonth === selectedMonth.month &&
          p.rawYear === selectedMonth.year,
      )
    : [];

  const monthTotalCollected = monthFiltered.reduce(
    (sum, item) => sum + item.amountNum,
    0,
  );
  const monthTotalCollections = monthFiltered.length;
  const monthAvgCollection =
    monthTotalCollections > 0 ? monthTotalCollected / monthTotalCollections : 0;
  // const monthHighestCollection = monthFiltered.length > 0 ? Math.max(...monthFiltered.map(p => p.amountNum)) : 0;
  const monthCashCollected = monthFiltered
    .filter((p) => p.desc.toLowerCase().includes("cash"))
    .reduce((sum, p) => sum + p.amountNum, 0);
  const monthOnlineCollected = monthFiltered
    .filter((p) => !p.desc.toLowerCase().includes("cash"))
    .reduce((sum, p) => sum + p.amountNum, 0);

  // Handle Search Input Change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.length >= 2) {
      // Find unique matching store names from the paymentsList
      const matchingStores = Array.from(
        new Set(
          paymentsList
            .map((p) => p.store)
            .filter((name) => name.toLowerCase().includes(text.toLowerCase())),
        ),
      ).slice(0, 5); // Limit to 5 suggestions
      setSuggestions(matchingStores);
    } else {
      setSuggestions([]);
    }
  };

  // Select search suggestion
  const selectSuggestion = (storeName: string) => {
    setSearchQuery(storeName);
    setSuggestions([]);
  };

  // Clear search field
  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
  };

  // Generate last 6 months programmatically (relative to May 20, 2026)
  const getLast6Months = () => {
    const list = [];
    const now = new Date(); // Dynamic current device date

    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        monthName: d.toLocaleDateString("en-US", { month: "long" }),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      });
    }

    // Group items by year
    const groups: { [key: number]: typeof list } = {};
    list.forEach((m) => {
      if (!groups[m.year]) {
        groups[m.year] = [];
      }
      groups[m.year].push(m);
    });

    return groups;
  };

  const groupedMonths = getLast6Months();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1A3F75", "#1A3F75"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
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
            <Text className="text-white text-xl font-bold">Payments</Text>
            <Text className="text-white/80 text-xs mt-1">
              All Transaction History
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs Menu */}
      <View className="flex-row mx-4 mt-4 mb-2 bg-[#E2E8F0]/70 p-1 rounded-xl">
        <TouchableOpacity
          onPress={() => setActiveTab("transactions")}
          className={`flex-1 py-2.5 rounded-lg items-center justify-center ${activeTab === "transactions" ? "bg-[#1A3F75]" : ""}`}
        >
          <Text
            className={`font-bold text-sm uppercase tracking-wider ${activeTab === "transactions" ? "text-white" : "text-gray-600"}`}
          >
            All Transactions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("details")}
          className={`flex-1 py-2.5 rounded-lg items-center justify-center ${activeTab === "details" ? "bg-[#1A3F75]" : ""}`}
        >
          <Text
            className={`font-bold text-sm uppercase tracking-wider ${activeTab === "details" ? "text-white" : "text-gray-600"}`}
          >
            Details
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 pt-2 pb-4 relative">
        {/* ================= DETAILS TAB ================= */}
        {activeTab === "details" && (
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {/* Summary Section */}
            <View className="px-4 mb-5 mt-2">
              <View className="rounded-[24px] overflow-hidden shadow-sm">
                <LinearGradient
                  colors={["#1A3F75", "#4C73B6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ padding: 24 }}
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="rounded-2xl bg-white/20 p-3">
                      <Text className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
                        Total Collected
                      </Text>
                      <Text className="text-white text-2xl font-bold mt-1">
                        Rs.{" "}
                        {totalCollected.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </View>
                    <View className="bg-white/20 p-3 rounded-2xl">
                      <Ionicons name="wallet-outline" size={24} color="white" />
                    </View>
                  </View>
                  <View className="flex-row justify-between border-t border-white/10 pt-4">
                    <View>
                      <Text className="text-white/60 text-[9px] uppercase font-bold tracking-wider">
                        Last Payment
                      </Text>
                      <Text className="text-white font-bold text-xs">
                        Rs. {lastPaymentAmount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-white/60 text-[9px] uppercase font-bold tracking-wider">
                        Date
                      </Text>
                      <Text className="text-white font-bold text-xs">
                        {lastPaymentDate}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </View>

            {/* Performance Stats Cards */}
            <View className="flex-row px-4 mb-4 justify-between">
              <View className="bg-white rounded-2xl p-4 flex-1 mr-2 shadow-sm border border-gray-100">
                <View className="w-9 h-9 bg-green-50 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="stats-chart" size={18} color="#47B8A0" />
                </View>
                <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                  Total Collections
                </Text>
                <Text className="text-gray-800 text-base font-bold mt-1">
                  {totalCollections}
                </Text>
              </View>
              <View className="bg-white rounded-2xl p-4 flex-1 ml-2 shadow-sm border border-gray-100">
                <View className="w-9 h-9 bg-blue-50 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="trending-up" size={18} color="#1A3F75" />
                </View>
                <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                  Avg Collection
                </Text>
                <Text className="text-gray-800 text-base font-bold mt-1">
                  Rs. {avgCollection.toFixed(0)}
                </Text>
              </View>
            </View>

            {/* Filtered Month Summary Section (Row-wise cards) */}
            {selectedMonth && (
              <View className="px-4 mt-3 mb-6">
                {/* Header label for Filtered Month */}
                <View className="flex-row items-center justify-between mb-3 mt-3">
                  <Text className="text-gray-500 font-extrabold text-xs uppercase tracking-wider">
                    {groupedMonths[selectedMonth.year]?.find(
                      (m) => m.monthIndex === selectedMonth.month,
                    )?.monthName || "Selected"}{" "}
                    {selectedMonth.year} Summary
                  </Text>
                  <View className="bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                    <Text className="text-[#1A3F75] text-[9px] font-bold uppercase tracking-wider">
                      Filtered Performance
                    </Text>
                  </View>
                </View>

                {/* Row 1 Card: Month Total Revenue & Transactions count */}
                <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                      <Ionicons name="cash-outline" size={20} color="#10B981" />
                    </View>
                    <View>
                      <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                        Total{" "}
                        {
                          groupedMonths[selectedMonth.year]?.find(
                            (m) => m.monthIndex === selectedMonth.month,
                          )?.monthName
                        }{" "}
                        month Collactions
                      </Text>
                      <Text className="text-gray-800 text-lg font-black mt-0.5">
                        ₹
                        {monthTotalCollected.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Row 2 Card: Average Ticket Size & Peak Single Collection */}
                <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-4">
                      <Ionicons
                        name="trending-up-outline"
                        size={20}
                        color="#1A3F75"
                      />
                    </View>
                    <View>
                      <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                        Average collaction
                      </Text>
                      <Text className="text-gray-800 text-sm font-extrabold mt-0.5">
                        Avg: ₹
                        {monthAvgCollection.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </View>
                  </View>
                  <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center">
                    <Ionicons name="stats-chart" size={14} color="#1A3F75" />
                  </View>
                </View>

                {/* Row 3 Card: Cash vs Online Payment Split graphic and values */}
                <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-4">
                  <View className="flex-row items-center mb-3">
                    <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-4">
                      <Ionicons
                        name="pie-chart-outline"
                        size={20}
                        color="#8B5CF6"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">
                        Payment Mode
                      </Text>
                      <Text className="text-gray-800 text-xs font-extrabold mt-0.5">
                        Cash: ₹
                        {monthCashCollected.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}{" "}
                        | Online: ₹
                        {monthOnlineCollected.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </Text>
                    </View>
                  </View>

                  {/* Visual Bar split */}
                  <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden flex-row">
                    <View
                      style={{
                        width: `${monthTotalCollected > 0 ? (monthCashCollected / monthTotalCollected) * 100 : 50}%`,
                      }}
                      className="h-full bg-blue-500"
                    />
                    <View
                      style={{
                        width: `${monthTotalCollected > 0 ? (monthOnlineCollected / monthTotalCollected) * 100 : 50}%`,
                      }}
                      className="h-full bg-emerald-500"
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        )}

        {/* ================= TRANSACTIONS TAB ================= */}
        {activeTab === "transactions" && (
          <View className="flex-1">
            {/* Search Bar */}
            <View className="px-4 mb-3 relative z-50">
              <View className="flex-row items-center bg-white rounded-xl px-3 border border-gray-200/60 shadow-sm">
                <Ionicons name="search" size={18} color="#94A3B8" />
                <TextInput
                  className="flex-1 py-3 pl-2.5 text-gray-800 text-sm font-semibold"
                  placeholder="Search store name..."
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  placeholderTextColor="#94A3B8"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} className="p-1">
                    <Ionicons name="close-circle" size={18} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Autocomplete Suggestions Box */}
              {suggestions.length > 0 && (
                <View className="absolute left-4 right-4 top-[50px] bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1 max-h-[160px] overflow-hidden">
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {suggestions.map((storeName, idx) => (
                      <TouchableOpacity
                        key={`suggest-${idx}`}
                        onPress={() => selectSuggestion(storeName)}
                        className="px-4 py-3 border-b border-gray-50 flex-row items-center"
                      >
                        <Ionicons
                          name="storefront-outline"
                          size={14}
                          color="#64748B"
                        />
                        <Text className="text-gray-700 text-xs font-bold ml-2">
                          {storeName}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Active Month Filter Indicator */}
            {selectedMonth && (
              <View className="mx-4 mb-3 flex-row items-center">
                <View className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full flex-row items-center">
                  <MaterialIcons name="filter-list" size={14} color="#D97706" />
                  <Text className="text-[11px] font-bold text-[#D97706] ml-1 uppercase">
                    Filtered:{" "}
                    {
                      groupedMonths[selectedMonth.year]?.find(
                        (m) => m.monthIndex === selectedMonth.month,
                      )?.monthName
                    }{" "}
                    {selectedMonth.year}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedMonth(null)}
                    className="ml-2 bg-amber-200/50 rounded-full p-0.5"
                  >
                    <Ionicons name="close" size={12} color="#D97706" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <Text className="px-5 mb-4 text-gray-800 font-bold text-[16px]">
              {selectedMonth || searchQuery
                ? `Filtered Transactions (${filteredPayments.length})`
                : "Recent Transactions"}
            </Text>

            {/* Scrollable list */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
            >
              {isLoading ? (
                <View className="py-12 items-center justify-center">
                  <ActivityIndicator size="large" color="#1A3F75" />
                  <Text className="text-gray-400 text-xs mt-3 font-medium">
                    Loading history...
                  </Text>
                </View>
              ) : filteredPayments.length === 0 ? (
                <View className="py-12 items-center justify-center">
                  <Ionicons
                    name="receipt-outline"
                    size={40}
                    color="#CBD5E1"
                    className="mb-2"
                  />
                  <Text className="text-gray-400 text-sm font-semibold">
                    No transactions found
                  </Text>
                </View>
              ) : (
                filteredPayments.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    className="bg-white mx-4 mb-3 p-4 rounded-xl shadow-sm flex-row items-center border border-gray-50"
                    onPress={() =>
                      router.push({
                        pathname: "/pages/orderDetails",
                        params: {
                          id: item.id,
                          type: item.type,
                          date: item.date,
                          desc: item.desc,
                          store: item.store,
                          amount: item.amount,
                          orderNo: item.orderNo,
                          isOrder: "false",
                        },
                      })
                    }
                  >
                    {/* Circle Icon */}
                    <View className="w-11 h-11 rounded-full items-center justify-center bg-[#47B8A0]">
                      <Ionicons name="checkmark" size={18} color="white" />
                    </View>

                    {/* Content */}
                    <View className="flex-1 ml-3.5">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-[14px] font-extrabold text-gray-800">
                          {item.type}
                        </Text>
                        <Text className="text-xs font-bold text-[#3AA58E]">
                          {item.amount}
                        </Text>
                      </View>
                      <Text className="text-xs text-gray-600 mt-1">
                        Date: {item.date}
                      </Text>
                      <Text className="text-xs text-gray-600 mt-0.5">
                        {item.desc}
                      </Text>
                      <Text
                        className="text-xs font-semibold text-[#3AA58E] mt-1"
                        numberOfLines={1}
                      >
                        ({item.store})
                      </Text>
                    </View>

                    {/* Arrow */}
                    <View className="ml-2 justify-center">
                      <Ionicons
                        name="caret-forward"
                        size={13}
                        color="#A0AEC0"
                      />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        )}

        {/* ================= FLOATING FILTER BUTTON ================= */}
        {activeTab === "transactions" && (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => setFilterModalVisible(true)}
            activeOpacity={0.8}
            className="shadow-lg mb-[100px]"
          >
            <Ionicons name="funnel" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* ================= MONTH FILTER MODAL ================= */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40 justify-end"
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View
            className="bg-white rounded-t-[28px] p-6 max-h-[70%]"
            style={{ paddingBottom: insets.bottom + 20 }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-[17px] font-extrabold text-gray-900">
                Select Month
              </Text>
              <TouchableOpacity
                onPress={() => setFilterModalVisible(false)}
                className="p-1"
              >
                <Ionicons name="close-circle" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Reset filter option */}
              <TouchableOpacity
                onPress={() => {
                  setSelectedMonth(null);
                  setFilterModalVisible(false);
                }}
                className={`py-3 px-4 rounded-xl mb-4 items-center flex-row justify-center border ${!selectedMonth ? "bg-[#1A3F75] border-transparent" : "bg-white border-gray-200"}`}
              >
                <Text
                  className={`font-bold text-sm ${!selectedMonth ? "text-white" : "text-gray-700"}`}
                >
                  ALL MONTHS
                </Text>
              </TouchableOpacity>

              {/* Group months by Year */}
              {Object.keys(groupedMonths)
                .sort((a, b) => Number(b) - Number(a)) // Sort years descending
                .map((yearStr) => {
                  const year = Number(yearStr);
                  const months = groupedMonths[year];

                  return (
                    <View key={year} className="mb-4">
                      {/* Year display like "2026 -------------------" */}
                      <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-3">
                        {year} -----------------------------------
                      </Text>

                      {/* Month Buttons inside grid */}
                      <View className="flex-row flex-wrap gap-2.5">
                        {months.map((mObj, mIdx) => {
                          const isSelected =
                            selectedMonth?.month === mObj.monthIndex &&
                            selectedMonth?.year === mObj.year;
                          return (
                            <TouchableOpacity
                              key={`${mObj.monthName}-${mIdx}`}
                              onPress={() => {
                                setSelectedMonth({
                                  month: mObj.monthIndex,
                                  year: mObj.year,
                                });
                                setFilterModalVisible(false);
                              }}
                              style={{ width: "48%" }}
                              className={`py-3.5 px-4 rounded-xl border items-center justify-center ${isSelected ? "bg-[#1A3F75] border-transparent" : "bg-gray-50 border-gray-200"}`}
                            >
                              <Text
                                className={`font-extrabold text-xs uppercase tracking-wider ${isSelected ? "text-white" : "text-gray-700"}`}
                              >
                                {mObj.monthName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#1A3F75",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99,
  },
});
