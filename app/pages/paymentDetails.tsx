import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const formatDisplayDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    // Handle "YYYY-MM-DD HH:MM:SS" format for Hermes
    const str = String(dateStr).trim();
    let d = new Date(str);
    if (isNaN(d.getTime())) {
      d = new Date(str.replace(" ", "T"));
    }
    if (isNaN(d.getTime())) {
      const parts = str.split(" ");
      const datePart = parts[0].split("-");
      if (datePart.length === 3) {
        const y = parseInt(datePart[0], 10);
        const m = parseInt(datePart[1], 10) - 1;
        const day = parseInt(datePart[2], 10);
        d = new Date(y, m, day);
      }
    }
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const getPaymentStatusMeta = (status?: string) => {
  const s = status?.toLowerCase() || "";
  if (s === "paid")
    return {
      icon: "checkmark-circle" as const,
      color: "#10B981",
      bg: "#DCFCE7",
      label: "Paid",
    };
  if (s === "partial")
    return {
      icon: "time" as const,
      color: "#F59E0B",
      bg: "#FEF3C7",
      label: "Partial",
    };
  if (s === "pending")
    return {
      icon: "time-outline" as const,
      color: "#F59E0B",
      bg: "#FEF3C7",
      label: "Pending",
    };
  return {
    icon: "checkmark-circle-outline" as const,
    color: "#3AA58E",
    bg: "#DCFCE7",
    label: status || "Success",
  };
};

export default function PaymentDetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract all params
  const transactionId = (params.transactionId as string) || "-";
  const referenceNo = (params.referenceNo as string) || "-";
  const paymentDate = (params.paymentDate as string) || "-";
  const amount = (params.amount as string) || "0.00";
  const paymentMode = (params.paymentMode as string) || "Cash";
  const storeName = (params.storeName as string) || "Unknown Store";
  const orderNo = (params.orderNo as string) || "-";
  const orderAmount = (params.orderAmount as string) || "0.00";
  const paidAmount = (params.paidAmount as string) || "0.00";
  const dueAmount = (params.dueAmount as string) || "0.00";
  const orderStatus = (params.orderStatus as string) || "-";
  const paymentStatus = (params.paymentStatus as string) || "-";
  const dispalyInvoiceNo = params.manual_invoice_no as string | undefined;
  const statusMeta = getPaymentStatusMeta(paymentStatus);

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
                Payment Details
              </Text>
              <Text className="text-white/80 text-xs mt-1">
                Transaction #{transactionId}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Info Card */}
        <View className="bg-white rounded-2xl shadow-sm p-5 mb-3 relative overflow-hidden">
          {/* Status Color Strip */}
          <View
            className="absolute right-0 top-0 bottom-0 w-1.5"
            style={{ backgroundColor: statusMeta.color }}
          />

          {/* Amount Hero Section */}
          <View className="items-center mb-5 pt-2 flex-row justify-between">
            {/* <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: statusMeta.bg }}
            >
              {/* <Ionicons name={statusMeta.icon} size={28} color={statusMeta.color} /> */}
            {/* </View> */}
            <Text className="text-5xl font-black text-[#3AA58E]">
              ₹{parseFloat(amount).toFixed(2)}
            </Text>
            <View
              className="mt-2 px-3 py-1 rounded-full"
              style={{ backgroundColor: statusMeta.bg }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: statusMeta.color }}
              >
                {statusMeta.label}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="border-t border-gray-100 mb-4" />

          {/* Transaction Details */}
          <View className="gap-3">
            {/* <DetailRow label="Transaction ID" value={`#${transactionId}`} /> */}
            <DetailRow label="Reference No" value={referenceNo} />
            <DetailRow
              label="Payment Date"
              value={formatDisplayDate(paymentDate)}
            />
            <DetailRow
              label="Payment Mode"
              capitalize={true}
              value={paymentMode}
            />
            <DetailRow
              label="Store"
              capitalize={true}
              value={storeName}
            />
          </View>
        </View>

        {/* Order Details Card */}
        <View className="bg-white rounded-2xl shadow-sm p-5 mb-3">
          <View className="flex-row items-center mb-4">
            <View className="w-9 h-9 bg-[#EEF2FF] rounded-full items-center justify-center mr-3">
              <Ionicons name="document-text" size={18} color="#4C73B6" />
            </View>
            <Text className="text-gray-800 font-bold text-[16px]">
              Order Details
            </Text>
          </View>

          <View className="gap-3">
            <DetailRow label="Order No" value={orderNo} />
            {dispalyInvoiceNo && dispalyInvoiceNo !== null && (
              <DetailRow label="Manual Invoice No" value={dispalyInvoiceNo} />
            )}
            <DetailRow label="Order Status" value={orderStatus} capitalize />
            {dispalyInvoiceNo && dispalyInvoiceNo !== null && (
              <>
                <DetailRow
                  label="Total Amount"
                  value={`₹${parseFloat(orderAmount).toFixed(2)}`}
                  valueColor="#FF4A4A"
                />
                <DetailRow
                  label="Paid Amount"
                  value={`₹${parseFloat(paidAmount).toFixed(2)}`}
                  valueColor="#3AA58E"
                />
                <DetailRow
                  label="Due Amount"
                  value={`₹${parseFloat(dueAmount).toFixed(2)}`}
                  valueColor={parseFloat(dueAmount) > 0 ? "#FF4A4A" : "#3AA58E"}
                />
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
  capitalize,
}: {
  label: string;
  value: string;
  valueColor?: string;
  capitalize?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-2 border-b border-gray-50">
      <Text className="text-xs text-gray-400 font-medium">{label}</Text>
      <Text
        className="text-sm font-bold text-gray-800"
        style={[
          valueColor ? { color: valueColor } : {},
          capitalize ? { textTransform: "capitalize" } : {},
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F6F8",
  },
});
