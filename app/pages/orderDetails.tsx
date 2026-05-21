import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import API from "../../utils/api";

const formatDisplayDate = (date?: string | string[]) => {
  const value = Array.isArray(date) ? date[0] : date;
  if (!value) return "-";
  const dateObj = new Date(value);
  if (isNaN(dateObj.getTime())) return value;
  return dateObj.toLocaleDateString("en-GB");
};

const getStatusMeta = (status?: string | string[]) => {
  const value = Array.isArray(status) ? status[0] : status;
  const normalized = value?.toLowerCase();
  if (normalized === "pending")
    return { icon: "time-outline" as const, color: "#F59E0B", bg: "#FEF3C7" };
  if (normalized === "accepted")
    return {
      icon: "checkmark-done-outline" as const,
      color: "#3B82F6",
      bg: "#DBEAFE",
    };
  if (normalized === "delivered" || normalized === "completed")
    return {
      icon: "checkmark-circle-outline" as const,
      color: "#10B981",
      bg: "#DCFCE7",
    };
  if (normalized === "cancelled" || normalized === "rejected")
    return {
      icon: "close-circle-outline" as const,
      color: "#EF4444",
      bg: "#FEE2E2",
    };
  return { icon: "ellipse-outline" as const, color: "#3AA58E", bg: "#DCFCE7" };
};

const cleanAmount = (amount?: string | string[] | number) => {
  const value = Array.isArray(amount) ? amount[0] : amount;
  return value?.toString().replace("Rs.", "").replace("₹", "").trim() || "0.00";
};

export default function OrderDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // params will contain id, type, orderNo, billingDate, store, amount, isOrder, etc.
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Default to Order unless it's explicitly a payment
  const isOrder = params.type !== "Payment" && params.isOrder !== "false";

  useEffect(() => {
    console.log("OrderDetails params:", params);
    if (params.id) {
      setIsLoading(true);
      API.get(`/orders/${params.id}`)
        .then((res) => {
          const data = res.data.data || res.data;
          console.log("Fetched order details:", data);
          setOrderDetails(data);
        })
        .catch((err) => console.error("Failed to fetch order details", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [params.id]);

  const displayOrderNo =
    orderDetails?.order_no || params.orderNo || `ORD-${params.id || "N/A"}`;
  const displayInvoiceNo =
    orderDetails?.manual_invoice_no ||
    orderDetails?.invoice_no ||
    params.manualInvoiceNo;
  const displayDate =
    orderDetails?.billing_date ||
    orderDetails?.created_at ||
    params.billingDate ||
    params.date;
  const displayAmount = orderDetails?.total_amount || params.amount;
  const statusMeta = getStatusMeta(
    orderDetails?.status || params.status || params.type || "Pending",
  );
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={["#1A3F75", "#1A3F75"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">
                {isOrder ? "Order Details" : "Payment Details"}
              </Text>
              <Text className="text-white/80 text-xs mt-1">
                {displayOrderNo}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 py-10 items-center justify-center">
          <ActivityIndicator size="large" color="#1A3F75" />
          <Text className="text-gray-500 mt-4 font-medium">
            Loading order details...
          </Text>
        </View>
      ) : (
        <View className="flex-1 p-5 pb-0">
          {/* Main Card */}
          <View className="bg-white rounded-2xl shadow-sm p-5 mb-2 relative overflow-hidden">
            {/* Right-side Full-height Status Color Strip */}
            <View
              className="absolute right-0 top-0 bottom-0 w-1.5"
              style={{ backgroundColor: statusMeta.color }}
            />
            <View className="flex-row justify-between items-start border-b border-gray-100 pb-4 mb-4">
              <View className="flex-1 pr-4">
                <Text className="text-gray-500 text-xs mb-1">
                  {isOrder ? "Order Number" : "Transaction ID"}
                </Text>
                <Text
                  className="text-gray-800 text-base font-bold"
                  numberOfLines={1}
                >
                  {displayOrderNo}
                </Text>
              </View>
            </View>

            {displayInvoiceNo && displayInvoiceNo !== null ? (
              <View>
                <View className="flex-row items-center mb-3">
                  <View className="flex-1 pr-3">
                    <Text className="text-gray-500 text-xs mb-1">
                      Invoice Number
                    </Text>
                    <Text
                      className="text-gray-800 font-semibold"
                      numberOfLines={1}
                    >
                      {displayInvoiceNo}
                    </Text>
                  </View>
                </View>
                <View className="items-start flex-row justify-between">
                  <View>
                    <Text className="text-gray-500 text-xs mb-1">Date</Text>
                    <Text className="text-gray-800 font-medium">
                      {formatDisplayDate(displayDate)}
                    </Text>
                  </View>
                  <Text className="text-[16px] font-bold text-[#FF4A4A]">
                    ₹{cleanAmount(displayAmount)}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Date</Text>
                  <Text className="text-gray-800 font-medium">
                    {formatDisplayDate(displayDate)}
                  </Text>
                </View>
                {/* <View className="items-end">
                  <Text
                    className={`text-xl font-bold ${isOrder ? "text-[#FF4A4A]" : "text-[#3AA58E]"}`}
                  >
                    ₹{cleanAmount(displayAmount)}
                  </Text>
                </View> */}
              </View>
            )}
          </View>

          {isOrder && (
            <View
              className="bg-white rounded-2xl shadow-sm p-5 flex-1"
              style={{ marginBottom: insets.bottom > 0 ? insets.bottom : 20 }}
            >
              <Text className="text-gray-800 font-bold mb-3 text-[16px]">
                Items Summary
              </Text>
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 16 }}
              >
                {(() => {
                  const itemsList =
                    orderDetails?.items ||
                    orderDetails?.order_details ||
                    orderDetails?.order_items ||
                    orderDetails?.products ||
                    [];

                  return itemsList.length > 0 ? (
                    itemsList.map((item: any, index: number) => (
                      <View
                        key={index}
                        className="flex-row justify-between items-center py-2.5 border-b border-gray-50"
                      >
                        <View className="w-8 h-8 rounded-lg bg-gray-100 mr-2 flex-row items-center justify-center">
                          <Text className="text-gray-500 font-bold">{index > 9 ? index + 1 : "0" + (index + 1)}</Text>
                        </View>
                        <Text
                          className="text-gray-800 font-semibold flex-1 pr-4"
                          numberOfLines={1}
                        >
                          {item?.product?.name ||
                           item?.product?.product_name ||
                           item?.name ||
                           item?.product_name ||
                           `Product #${item?.product_id || "Unknown"}`}
                        </Text>
                        <View className="items-end">
                          <Text className="text-gray-700 font-semibold text-sm">
                            x{item?.quantity || item?.qty || 1}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="py-4 items-center">
                      <Text className="text-gray-400 text-sm">
                        No items found for this order.
                      </Text>
                    </View>
                  );
                })()}
              </ScrollView>
            </View>
          )}
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
