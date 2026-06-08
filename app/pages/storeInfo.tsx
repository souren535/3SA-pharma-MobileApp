import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";
import LottieView from "lottie-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttendanceGate from "../../components/AttendanceGate";
import {
  IMAGE_BASE_URL,
  useAttendanceStore,
  useLedgerStore,
  useOrderStore,
  useStoreDetailStore,
} from "../../store/store";
import API from "../../utils/api";

type TabName = "Orders" | "Transaction" | "Info";

const { width: screenWidth } = Dimensions.get("window");
const infoImageWidth = screenWidth - 32;

const formatDisplayDate = (date?: string | Date) => {
  if (!date) return "-";
  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) return String(date);
  return dateObj.toLocaleDateString("en-GB");
};

const formatPaymentDate = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getStatusMeta = (status?: string) => {
  const normalized = status?.toLowerCase();
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

export default function StoreInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeId = params.storeId as string;
  const [activeTab, setActiveTab] = useState<TabName>("Orders");
  const [transactionFilter, setTransactionFilter] = useState<
    "All" | "Credit" | "Debit"
  >("All");

  // Zustand stores
  const {
    shopDetail,
    fetchShopDetail,
    isLoading: detailLoading,
  } = useStoreDetailStore();
  const {
    shopOrders,
    fetchShopOrders,
    isLoading: ordersLoading,
  } = useOrderStore();
  const {
    ledger,
    summary,
    fetchLedger,
    collectPayment,
    isLoading: ledgerLoading,
    isSubmitting,
  } = useLedgerStore();
  const { isWorking } = useAttendanceStore();
  const [showAttendanceGate, setShowAttendanceGate] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (storeId) {
      fetchShopDetail(storeId);
      fetchShopOrders(storeId);
      fetchLedger(storeId);
    }
  }, [storeId]);

  // FAB animation and states
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(fabAnimation, {
      toValue: isFabOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 40,
    }).start();
  }, [isFabOpen]);

  const fabMenuTranslateY = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  const fabMenuOpacity = fabAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Modal states
  const [showVisitNoteModal, setShowVisitNoteModal] = useState(false);
  const [visitNoteText, setVisitNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  // Visit flow states
  const VISIT_TYPES = [
    { label: "Follow Up", value: "follow_up", icon: "replay" },
    { label: "New Order Discussion", value: "new_order", icon: "shopping-cart" },
    { label: "Payment Collection", value: "payment", icon: "account-balance-wallet" },
    { label: "Product Enquiry", value: "enquiry", icon: "help-outline" },
    { label: "Other", value: "other", icon: "edit" },
  ];
  const [showVisitTypeModal, setShowVisitTypeModal] = useState(false);
  const [selectedVisitType, setSelectedVisitType] = useState<string | null>(null);
  const [otherVisitNote, setOtherVisitNote] = useState("");
  const [showVisitCaptureModal, setShowVisitCaptureModal] = useState(false);
  const [visitSelfieUri, setVisitSelfieUri] = useState<string | null>(null);
  const [visitLocation, setVisitLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [visitLocationLoading, setVisitLocationLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const visitCameraRef = useRef<any>(null);

  // Create Transaction states
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transDate, setTransDate] = useState(new Date());
  const [transAmount, setTransAmount] = useState("");
  const [transMode, setTransMode] = useState("Cash");
  const [showTransModePicker, setShowTransModePicker] = useState(false);
  const [showTransDatePicker, setShowTransDatePicker] = useState(false);
  const [transNote, setTransNote] = useState("");
  const [activeStoreImageIndex, setActiveStoreImageIndex] = useState(0);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchShopDetail(storeId),
        fetchShopOrders(storeId),
        fetchLedger(storeId),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const showPopup = (title: string, message: string) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupVisible(true);
  };

  const rawShopDetail = shopDetail as any;
  const shopInfo = rawShopDetail?.shop || rawShopDetail; // Fallback if data is not nested
  const storeName =
    shopInfo?.name ||
    shopInfo?.shop_name ||
    (params.storeName as string) ||
    "Loading...";
  const storeCategory =
    shopInfo?.category || (params.storeCategory as string) || "";
  const storeContact =
    shopInfo?.contact || (params.storeContact as string) || "";
  const storeAddress =
    shopInfo?.address ||
    (params.storeAddress as string) ||
    "Address not available";

  const fallbackStoreImage =
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=400&auto=format&fit=crop";
  const normalizeImageUrl = (url?: string) => {
    if (!url) return fallbackStoreImage;
    return url.startsWith("http")
      ? url
      : `${IMAGE_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };
  const images = shopInfo?.images || rawShopDetail?.images;
  const storeImages =
    images && images.length > 0
      ? images
          .map((image: any) => normalizeImageUrl(image.image_url))
          .filter(Boolean)
      : [
          normalizeImageUrl(
            (params.storeImage as string) || fallbackStoreImage,
          ),
        ];
  const storeImage = storeImages[0];

  const tabs: TabName[] = ["Orders", "Transaction", "Info"];

  const renderOrders = () => {
    if (ordersLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#1A3F75"
          style={{ marginTop: 50 }}
        />
      );
    }
    if (!Array.isArray(shopOrders) || shopOrders.length === 0) {
      return (
        <Text className="text-center text-gray-500 mt-10">
          No orders found.
        </Text>
      );
    }
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
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
        {[...shopOrders].sort((a, b) => b.id - a.id).map((item) => {
          const statusMeta = getStatusMeta(item.status);
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
                    manualInvoiceNo: invoiceNo || "",
                    status: item.status || "",
                    amount: item.total_amount,
                    date: item.billing_date || item.created_at,
                  },
                })
              }
            >
              <View className="flex-row items-center flex-1 pr-2">
                {/* Left Document Icon */}
                <View className="w-11 h-11 rounded-xl items-center justify-center bg-[#F3F6F8]">
                  <Ionicons name="document-text" size={24} color="#4C73B6" />
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
                        <View className="flex-1 items-end">
                          <Text className="text-[16px] font-black text-[#FF4A4A]">
                            ₹{item.total_amount}
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
                      <Text className="text-xs text-gray-500 mr-4" numberOfLines={1}>
                        Billing Date :{" "}
                        {formatDisplayDate(
                          item.billing_date || item.created_at,
                        )}
                      </Text>
                      <View className="w-8 items-center" />
                    </View>
                  )}
                </View>
              </View>

              {/* Right-side Full-height Status Color Strip */}
              <View
                className="absolute right-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: statusMeta.color }}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const renderTransactions = () => {
    if (ledgerLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#1A3F75"
          style={{ marginTop: 50 }}
        />
      );
    }

    const safeLedger = Array.isArray(ledger) ? ledger : [];
    const filteredTransactions = safeLedger.filter((t) => {
      if (transactionFilter === "All") return true;
      if (transactionFilter === "Credit") return t.type === "Order";
      if (transactionFilter === "Debit") return t.type === "Payment";
      return false;
    });

    // Calculate Summary from Ledger or API Summary
    const totalOrdersCount = safeLedger.filter(
      (l) => l.type === "Order",
    ).length;
    const totalAmount =
      summary?.total_orders_value ??
      safeLedger
        .filter((l) => l.type === "Order")
        .reduce(
          (sum, item) => sum + parseFloat((item.amount as string) || "0"),
          0,
        );
    const totalPaid =
      summary?.total_received ??
      safeLedger
        .filter((l) => l.type === "Payment")
        .reduce(
          (sum, item) => sum + parseFloat((item.amount as string) || "0"),
          0,
        );
    const outstanding = summary?.outstanding_due ?? totalAmount - totalPaid;

    return (
      <View className="flex-1">
        {/* Fixed Summary Section */}
        <View className="mx-4 mt-4">
          {/* Summary */}
          <View className="bg-white rounded-2xl shadow-sm mb-5 overflow-hidden">
            <LinearGradient
              colors={["#1A3F75", "#2D5A9E"]}
              className="p-3 flex-row justify-between items-center"
            >
              <Text className="text-white text-base font-bold">
                Financial Summary
              </Text>
            </LinearGradient>

            <View className="p-3 flex-row flex-wrap">
              <View className="w-[50%] p-1.5">
                <Text className="text-[10px] text-gray-500 mb-0.5">
                  Total Orders
                </Text>
                <Text className="text-sm font-bold text-gray-800">
                  {totalOrdersCount}
                </Text>
              </View>
              <View className="w-[50%] p-1.5 border-l border-gray-100">
                <Text className="text-[10px] text-gray-500 mb-0.5">
                  Total Amount
                </Text>
                <Text className="text-sm font-bold text-[#16A34A]">
                  Rs. {totalAmount.toFixed(2)}
                </Text>
              </View>
              <View className="w-[50%] p-1.5 border-t border-gray-100">
                <Text className="text-[10px] text-gray-500 mb-0.5">
                  Total Paid
                </Text>
                <Text className="text-sm font-bold text-[#4C73B6]">
                  Rs. {totalPaid.toFixed(2)}
                </Text>
              </View>
              <View className="w-[50%] p-1.5 border-t border-l border-gray-100">
                <Text className="text-[10px] text-gray-500 mb-0.5">
                  Outstanding
                </Text>
                <Text className="text-sm font-bold text-[#DC2626]">
                  Rs. {outstanding.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Filter Bar */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-gray-800 text-sm">
              Transactions
            </Text>
            <TouchableOpacity
              className="flex-row items-center bg-white px-2.5 py-1.5 rounded-lg shadow-sm border border-gray-200"
              onPress={() => setShowFilterPopup(true)}
            >
              <Ionicons name="filter" size={14} color="#1A3F75" />
              <Text className="text-[#1A3F75] font-semibold text-[11px] ml-1">
                Filter: {transactionFilter}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Transactions List */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
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
          {filteredTransactions.length === 0 ? (
            <Text className="text-center text-gray-500 mt-5">
              No transactions found.
            </Text>
          ) : (
            filteredTransactions.map((item) => {
              const isCredit = item.type === "Order";
              return (
                <TouchableOpacity
                  key={item.id}
                  className="bg-white mb-3 p-4 rounded-xl shadow-sm"
                  onPress={() => {
                    if (isCredit) {
                      const idStr = item.id.toString();
                      const realId = idStr.includes("_")
                        ? idStr.split("_")[1]
                        : idStr;
                      router.push({
                        pathname: "/pages/orderDetails",
                        params: {
                          id: realId,
                          isOrder: "true",
                          orderNo: item.reference_no,
                          store: storeName,
                          amount: item.amount,
                          date: item.date,
                        },
                      });
                    } else {
                      const idStr = item.id.toString();
                      const realId = idStr.includes("_")
                        ? idStr.split("_")[1]
                        : idStr;
                      const orderObj = item.raw?.order || {};
                      router.push({
                        pathname: "/pages/paymentDetails",
                        params: {
                          transactionId: realId,
                          referenceNo: item.reference_no || "",
                          paymentDate: item.date,
                          amount: item.amount.toString(),
                          paymentMode: item.payment_mode || item.raw?.payment_mode || "Cash",
                          storeName: storeName,
                          orderNo: orderObj.order_no || item.raw?.order_no || "",
                          orderAmount: orderObj.total_amount || item.raw?.order_amount || "0",
                          paidAmount: orderObj.paid_amount || item.raw?.paid_amount || "0",
                          dueAmount: orderObj.due_amount || item.raw?.due_amount || "0",
                          orderStatus: orderObj.status || item.raw?.order_status || "",
                          paymentStatus: orderObj.payment_status || item.raw?.payment_status || "",
                          manual_invoice_no: orderObj.manual_invoice_no || item.raw?.manual_invoice_no || "",
                        },
                      });
                    }
                  }}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${isCredit ? "bg-[#FEE2E2]" : "bg-[#DCFCE7]"}`}
                      >
                        <Ionicons
                          name={isCredit ? "arrow-up" : "arrow-down"}
                          size={16}
                          color={isCredit ? "#DC2626" : "#16A34A"}
                        />
                      </View>
                      <View className="ml-3">
                        <Text className="text-[14px] font-bold text-gray-800">
                          {item.reference_no || item.type}
                        </Text>
                        <Text className="text-[11px] text-gray-400 mt-0.5">
                          {formatDisplayDate(item.date || item.created_at)}
                        </Text>
                      </View>
                    </View>
                    <Text
                      className={`text-sm font-bold ${isCredit ? "text-[#DC2626]" : "text-[#16A34A]"}`}
                    >
                      Rs. {item.amount}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                    <Text
                      className="text-xs text-gray-500 flex-1 mr-2"
                      numberOfLines={1}
                    >
                      {item.description || item.payment_mode}
                    </Text>
                    {isCredit ? (
                      <Text className="text-xs text-gray-600 font-semibold">
                        {item.status}
                      </Text>
                    ) : (
                      <Text className="text-xs text-gray-600 font-semibold">
                        {item.status}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    );
  };

  const renderInfo = () => {
    if (detailLoading) {
      return (
        <ActivityIndicator
          size="large"
          color="#1A3F75"
          style={{ marginTop: 50 }}
        />
      );
    }
    return (
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
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
        <View className="mx-4">
          {/* Store Images */}
          <View className="bg-white rounded-xl shadow-sm overflow-hidden mb-4">
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / infoImageWidth,
                );
                setActiveStoreImageIndex(index);
              }}
            >
              {storeImages.map((imageUrl: string, index: number) => (
                <Image
                  key={`${imageUrl}-${index}`}
                  source={{ uri: imageUrl }}
                  style={{ width: infoImageWidth, height: 180 }}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            {storeImages.length > 1 && (
              <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
                {storeImages.map((_: string, index: number) => (
                  <View
                    key={index}
                    className="h-2 rounded-full mx-1"
                    style={{
                      width: activeStoreImageIndex === index ? 18 : 8,
                      backgroundColor:
                        activeStoreImageIndex === index
                          ? "#FFFFFF"
                          : "rgba(255,255,255,0.55)",
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Store Details */}
          <View className="bg-white rounded-xl shadow-sm p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              Store Details
            </Text>

            {/* Row 1: Name, Category, Contact in same line */}
            <View className="flex-row -mx-1 mb-3">
              {[
                {
                  label: "Store Name",
                  value: storeName,
                  icon: "store" as const,
                  bg: "#EEF2FF",
                  color: "#4C73B6",
                },
                {
                  label: "Category",
                  value: storeCategory || "-",
                  icon: "category" as const,
                  bg: "#FEF3C7",
                  color: "#D97706",
                },
                {
                  label: "Contact",
                  value: storeContact || "-",
                  icon: "phone" as const,
                  bg: "#DCFCE7",
                  color: "#16A34A",
                  onPress: storeContact ? () => Linking.openURL(`tel:${storeContact}`) : undefined,
                },
              ].map((detail) => (
                <TouchableOpacity
                  key={detail.label}
                  className="flex-1 px-1"
                  activeOpacity={detail.onPress ? 0.6 : 1}
                  onPress={detail.onPress}
                  disabled={!detail.onPress}
                >
                  <View className="bg-gray-50 rounded-xl p-2.5 min-h-[88px] border border-gray-100">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mb-1.5"
                      style={{ backgroundColor: detail.bg }}
                    >
                      <MaterialIcons
                        name={detail.icon}
                        size={16}
                        color={detail.color}
                      />
                    </View>
                    <Text className="text-[10px] text-gray-400">
                      {detail.label}
                    </Text>
                    <Text
                      className="text-[12px] font-semibold text-gray-800"
                      numberOfLines={2}
                    >
                      {detail.value}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Row 2: Address (full width) */}
            <View className="px-0">
              <View className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <View className="flex-row items-center mb-1.5">
                  <View className="w-8 h-8 rounded-full bg-[#FEE2E2] items-center justify-center mr-2">
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color="#DC2626"
                    />
                  </View>
                  <Text className="text-[10px] text-gray-400">Address</Text>
                </View>
                <Text className="text-[13px] font-semibold text-gray-800">
                  {storeAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <LinearGradient
        colors={["#1A3F75", "#2D5A9E"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 0,
          paddingHorizontal: 20,
        }}
      >
        {/* Top Bar */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              className="bg-white/20 rounded-full p-2"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-white text-lg font-bold" numberOfLines={1}>
                {storeName}
              </Text>
              <Text className="text-white/70 text-xs mt-0.5">
                {storeCategory}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="w-9 h-9 bg-white/20 rounded-full items-center justify-center"
              onPress={() => {
                if (storeContact) {
                  Linking.openURL(`tel:${storeContact}`);
                }
              }}
            >
              <Ionicons name="call" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row">
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center pb-3"
            >
              <Text
                className={`text-sm font-bold ${activeTab === tab ? "text-white" : "text-white/50"}`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View className="absolute bottom-0 w-full h-[3px] bg-white rounded-full" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Fixed Tab Content */}
      <View className="flex-1">
        {activeTab === "Orders" && renderOrders()}
        {activeTab === "Transaction" && renderTransactions()}
        {activeTab === "Info" && renderInfo()}
      </View>

      {/* Animated FAB Menu Background Overlay (Only for Orders) */}
      {activeTab === "Orders" && isFabOpen && (
        <TouchableOpacity
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/20"
          activeOpacity={1}
          onPress={() => setIsFabOpen(false)}
        />
      )}

      {/* FAB Options (Only for Orders) */}
      {activeTab === "Orders" && (
        <Animated.View
          className="absolute bottom-[185px] right-6 items-end gap-3"
          style={{
            transform: [{ translateY: fabMenuTranslateY }],
            opacity: fabMenuOpacity,
          }}
          pointerEvents={isFabOpen ? "box-none" : "none"}
        >
          <TouchableOpacity
            className="flex-row items-center bg-white py-2 px-4 rounded-full shadow-md"
            onPress={() => {
              setIsFabOpen(false);
              router.push({
                pathname: "/pages/orderCreate",
                params: {
                  storeId,
                  storeName,
                  storeCategory,
                  storeContact,
                  storeImage,
                  fromStore: "true",
                },
              });
            }}
          >
            <Text className="mr-2 text-[#1A3F75] font-bold">Create Order</Text>
            <View className="w-10 h-10 bg-[#1A3F75] rounded-full items-center justify-center">
              <MaterialIcons name="add-shopping-cart" size={20} color="white" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center bg-white py-2 px-4 rounded-full shadow-md"
            onPress={() => {
              setIsFabOpen(false);
              setSelectedVisitType(null);
              setOtherVisitNote("");
              setShowVisitTypeModal(true);
            }}
          >
            <Text className="mr-2 text-[#1A3F75] font-bold">Visit Store</Text>
            <View className="w-10 h-10 bg-[#1A3F75] rounded-full items-center justify-center">
              <MaterialIcons name="note-add" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Main FAB (Hidden on Info tab) */}
      {activeTab !== "Info" && (
        <TouchableOpacity
          className="absolute bottom-[100px] right-6 w-14 h-14 bg-[#1A3F75] rounded-2xl items-center justify-center shadow-lg elevation-5"
          onPress={() => {
            if (!isWorking) {
              setShowAttendanceGate(true);
              return;
            }
            if (activeTab === "Orders") {
              setIsFabOpen(!isFabOpen);
            } else if (activeTab === "Transaction") {
              setTransDate(new Date());
              setShowTransactionModal(true);
            }
          }}
        >
          {activeTab === "Orders" ? (
            <Feather name={isFabOpen ? "x" : "plus"} size={26} color="white" />
          ) : (
            <Feather name="plus" size={26} color="white" />
          )}
        </TouchableOpacity>
      )}

      {/* Attendance Gate Modal */}
      <AttendanceGate
        visible={showAttendanceGate}
        onClose={() => setShowAttendanceGate(false)}
      />

      {/* ===== CREATE TRANSACTION MODAL ===== */}
      <Modal visible={showTransactionModal} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "padding"}
          style={{ flex: 1 }}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-end"
            activeOpacity={1}
            onPress={() => setShowTransactionModal(false)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-t-3xl p-6"
              style={{ maxHeight: "88%", paddingBottom: Platform.OS === "ios" ? insets.bottom + 16 : 24 }}
            >
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-lg font-bold text-gray-800">
                  Create New Transaction
                </Text>
                <TouchableOpacity
                  onPress={() => setShowTransactionModal(false)}
                >
                  <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 60 }}
              >
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Date
                  </Text>
                  <TouchableOpacity
                    className="flex-row justify-between items-center bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                    onPress={() => setShowTransDatePicker(true)}
                  >
                    <Text className="text-[14px] text-gray-800">
                      {formatDisplayDate(transDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#4C73B6"
                    />
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Amount (Rs.)
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-3.5 text-[14px] text-gray-800 border border-gray-100"
                    value={transAmount}
                    onChangeText={(t) =>
                      setTransAmount(t.replace(/[^0-9.]/g, ""))
                    }
                    placeholder="Enter amount"
                    keyboardType="numeric"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Payment Method / Mode
                  </Text>
                  <TouchableOpacity
                    className="flex-row justify-between items-center bg-gray-50 rounded-xl p-3.5 border border-gray-100"
                    onPress={() => setShowTransModePicker(true)}
                  >
                    <Text className="text-[14px] text-gray-800">
                      {transMode}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-1.5">
                    Note
                  </Text>
                  <TextInput
                    className="bg-gray-50 rounded-xl p-3.5 text-[14px] text-gray-800 border border-gray-100"
                    value={transNote}
                    onChangeText={setTransNote}
                    placeholder="Brief description..."
                    returnKeyType="done"
                  />
                </View>

                <TouchableOpacity
                  className={`bg-[#1A3F75] py-4 rounded-2xl items-center shadow-md ${isSubmitting ? "opacity-70" : ""}`}
                  disabled={isSubmitting}
                  onPress={async () => {
                    if (!transAmount) {
                      showPopup(
                        "Required",
                        "Please enter a transaction amount.",
                      );
                      return;
                    }
                    try {
                      await collectPayment(storeId, {
                        amount: parseFloat(transAmount),
                        payment_mode: transMode,
                        reference_no: transNote || `REF-${Date.now()}`,
                        payment_date: formatPaymentDate(transDate),
                      });

                      setShowTransactionModal(false);
                      setTransAmount("");
                      setTransNote("");
                      showPopup("Success", "Transaction saved successfully!");
                    } catch (error: any) {
                      showPopup(
                        "Error",
                        error.response?.data?.message ||
                          "Failed to save transaction.",
                      );
                    }
                  }}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-[15px] font-bold">
                      Submit
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>

              {showTransDatePicker && (
                <DateTimePicker
                  value={transDate}
                  mode="date"
                  onChange={(_, date) => {
                    setShowTransDatePicker(false);
                    if (date) setTransDate(date);
                  }}
                />
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== PAYMENT MODE PICKER MODAL ===== */}
      <Modal visible={showTransModePicker} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6"
            style={{ paddingBottom: insets.bottom + 84 }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Select Payment Mode
              </Text>
              <TouchableOpacity onPress={() => setShowTransModePicker(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            {["Cash", "UPI", "Bank Transfer", "Cheque"].map((mode) => (
              <TouchableOpacity
                key={mode}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-3 ${transMode === mode ? "bg-[#EFF6FF]" : "bg-gray-50"}`}
                onPress={() => {
                  setTransMode(mode);
                  setShowTransModePicker(false);
                }}
              >
                <Text
                  className={`font-bold ${transMode === mode ? "text-[#1A3F75]" : "text-gray-600"}`}
                >
                  {mode}
                </Text>
                {transMode === mode && (
                  <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== FILTER MODAL ===== */}
      <Modal visible={showFilterPopup} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl p-6"
            style={{
              paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 30,
            }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Filter Transactions
              </Text>
              <TouchableOpacity onPress={() => setShowFilterPopup(false)}>
                <Ionicons name="close-circle" size={28} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {["All", "Credit", "Debit"].map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`flex-row justify-between items-center p-4 rounded-xl mb-8 ${transactionFilter === filter ? "bg-[#EFF6FF]" : "bg-gray-50"}`}
                onPress={() => {
                  setTransactionFilter(filter as "All" | "Credit" | "Debit");
                  setShowFilterPopup(false);
                }}
              >
                <Text
                  className={`font-bold ${transactionFilter === filter ? "text-[#1A3F75]" : "text-gray-600"}`}
                >
                  {filter}
                </Text>
                {transactionFilter === filter && (
                  <Ionicons name="checkmark-circle" size={24} color="#1A3F75" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ===== VISIT TYPE SELECTION MODAL ===== */}
      <Modal visible={showVisitTypeModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Visit Store
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowVisitTypeModal(false);
                  setSelectedVisitType(null);
                  setOtherVisitNote("");
                }}
              >
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs font-bold text-gray-400 uppercase mb-3 tracking-wider">
              Select Visit Purpose
            </Text>

            {VISIT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                className={`flex-row items-center p-3.5 rounded-xl mb-2 border ${
                  selectedVisitType === type.value
                    ? 'bg-[#EFF6FF] border-[#BFDBFE]'
                    : 'bg-gray-50 border-gray-100'
                }`}
                onPress={() => setSelectedVisitType(type.value)}
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                    selectedVisitType === type.value ? 'bg-[#1A3F75]' : 'bg-gray-200'
                  }`}
                >
                  <MaterialIcons
                    name={type.icon as any}
                    size={18}
                    color={selectedVisitType === type.value ? 'white' : '#64748B'}
                  />
                </View>
                <Text
                  className={`flex-1 text-[14px] font-bold ${
                    selectedVisitType === type.value ? 'text-[#1A3F75]' : 'text-gray-700'
                  }`}
                >
                  {type.label}
                </Text>
                {selectedVisitType === type.value && (
                  <Ionicons name="checkmark-circle" size={22} color="#1A3F75" />
                )}
              </TouchableOpacity>
            ))}

            {/* Other text input */}
            {selectedVisitType === 'other' && (
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-[14px] text-gray-800 border border-gray-200 mt-2 mb-2"
                placeholder="Describe your visit purpose..."
                placeholderTextColor="#9CA3AF"
                value={otherVisitNote}
                onChangeText={setOtherVisitNote}
                multiline
                numberOfLines={3}
                style={{ minHeight: 80, textAlignVertical: "top" }}
                autoFocus
              />
            )}

            <TouchableOpacity
              className={`mt-3 py-3.5 rounded-2xl items-center shadow-md ${
                selectedVisitType ? 'bg-[#1A3F75]' : 'bg-gray-200'
              }`}
              disabled={!selectedVisitType || (selectedVisitType === 'other' && !otherVisitNote.trim())}
              onPress={async () => {
                if (!selectedVisitType) return;
                if (selectedVisitType === 'other' && !otherVisitNote.trim()) return;

                setShowVisitTypeModal(false);

                // Reset capture state
                setVisitSelfieUri(null);
                setVisitLocation(null);

                // Request permissions
                if (!cameraPermission?.granted) {
                  await requestCameraPermission();
                }
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                  showPopup("Permission Denied", "Location permission is required.");
                  return;
                }

                // Auto-fetch location
                setVisitLocationLoading(true);
                setShowVisitCaptureModal(true);
                try {
                  const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                  });
                  setVisitLocation({
                    lat: loc.coords.latitude,
                    lng: loc.coords.longitude,
                  });
                } catch (error) {
                  console.log("Location error:", error);
                }
                setVisitLocationLoading(false);
              }}
            >
              <Text
                className={`text-[15px] font-bold ${
                  selectedVisitType ? 'text-white' : 'text-gray-400'
                }`}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== VISIT SELFIE & LOCATION CAPTURE MODAL ===== */}
      <Modal
        visible={showVisitCaptureModal}
        animationType="slide"
        transparent={false}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#1E293B]">
                Capture Visit Details
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setVisitSelfieUri(null);
                  setVisitLocation(null);
                  setShowVisitCaptureModal(false);
                }}
                className="bg-gray-100 p-2 rounded-full"
              >
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Camera Section */}
            <View className="px-5 mt-4">
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                Take a Selfie
              </Text>
              <View
                className="bg-gray-100 mb-2 border border-gray-200"
                style={{
                  height: 300,
                  width: Dimensions.get("window").width - 40,
                  overflow: "hidden",
                  borderRadius: Platform.OS === "ios" ? 16 : 0,
                }}
              >
                {visitSelfieUri ? (
                  <View style={{ flex: 1 }}>
                    <Image
                      source={{ uri: visitSelfieUri }}
                      style={{ flex: 1 }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      className="absolute bottom-3 right-3 bg-white/90 px-4 py-2 rounded-xl"
                      onPress={() => setVisitSelfieUri(null)}
                    >
                      <Text className="text-[#1A3F75] font-bold text-xs">
                        Retake
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : cameraPermission?.granted ? (
                  <View
                    style={{
                      width: Dimensions.get("window").width - 40,
                      height: 300,
                      position: "relative",
                    }}
                  >
                    {showVisitCaptureModal && (
                      <CameraView
                        ref={visitCameraRef}
                        style={{
                          width: Dimensions.get("window").width - 40,
                          height: 300,
                        }}
                        facing="front"
                      />
                    )}
                    <TouchableOpacity
                      className="absolute bottom-4 self-center w-16 h-16 rounded-full bg-white border-4 border-[#1A3F75] items-center justify-center shadow-lg"
                      onPress={async () => {
                        if (visitCameraRef.current) {
                          const photo = await visitCameraRef.current.takePictureAsync({ quality: 0.7 });
                          setVisitSelfieUri(photo.uri);
                        }
                      }}
                    >
                      <View className="w-12 h-12 rounded-full bg-[#1A3F75]" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons name="camera-alt" size={40} color="#9CA3AF" />
                    <Text className="text-gray-400 mt-2 text-sm">
                      Camera permission required
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location Section */}
            <ScrollView className="px-5 mt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              <View className="mb-4">
                <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  Location Status
                </Text>
                <View className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                  {visitLocationLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#1A3F75" />
                      <Text className="ml-3 text-[#1A3F75] font-medium text-[14px]">
                        Capturing precise location...
                      </Text>
                    </View>
                  ) : visitLocation ? (
                    <View>
                      <View className="flex-row items-center mb-1">
                        <MaterialIcons name="location-on" size={18} color="#059669" />
                        <Text className="ml-2 text-green-700 font-bold text-[14px]">
                          Location captured successfully
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-[12px] ml-6">
                        Lat: {visitLocation.lat.toFixed(6)}, Lng: {visitLocation.lng.toFixed(6)}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <MaterialIcons name="location-off" size={18} color="#DC2626" />
                      <Text className="ml-2 text-red-600 font-bold text-[14px]">
                        Unable to capture location
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <View
                className="px-5 pt-3"
                style={{
                  paddingBottom: Platform.OS === "ios" ? insets.bottom + 10 : insets.bottom + 20,
                }}
              >
                <TouchableOpacity
                  className={`py-4 rounded-2xl items-center shadow-sm ${
                    visitSelfieUri && visitLocation ? "bg-[#1A3F75]" : "bg-gray-200"
                  }`}
                  onPress={async () => {
                    if (!visitSelfieUri || !visitLocation) return;

                    setIsSubmittingNote(true);
                    try {
                      const visitNote = selectedVisitType === 'other'
                        ? otherVisitNote
                        : VISIT_TYPES.find(v => v.value === selectedVisitType)?.label || selectedVisitType;

                      await API.post("/orders/visits", {
                        shop_id: parseInt(storeId),
                        visit_type: selectedVisitType,
                        notes: visitNote,
                        latitude: String(visitLocation.lat),
                        longitude: String(visitLocation.lng),
                        // TODO: Send image_url when API supports it
                        // image_url: visitSelfieUri,
                      });

                      setShowVisitCaptureModal(false);
                      setVisitSelfieUri(null);
                      setVisitLocation(null);
                      setSelectedVisitType(null);
                      setOtherVisitNote("");
                      showPopup("Success", "Visit recorded successfully!");
                    } catch (error) {
                      console.error("Failed to submit visit:", error);
                      showPopup(
                        "Error",
                        "Failed to record visit. Please try again.",
                      );
                    } finally {
                      setIsSubmittingNote(false);
                    }
                  }}
                  disabled={isSubmittingNote || !visitSelfieUri || !visitLocation}
                >
                  {isSubmittingNote ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      className={`text-[16px] font-bold ${!visitSelfieUri || !visitLocation ? "text-gray-400" : "text-white"}`}
                    >
                      Confirm & Submit Visit
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ===== VISIT NOTE MODAL (Legacy - kept for fallback) ===== */}
      <Modal visible={showVisitNoteModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-3xl w-full p-6 shadow-xl">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-800">
                Add Visit Note
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowVisitNoteModal(false);
                  setVisitNoteText("");
                }}
              >
                <Ionicons name="close-circle" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-gray-50 rounded-xl p-4 text-[14px] text-gray-800 border border-gray-200 mb-4"
              placeholder="Type your visit note here..."
              placeholderTextColor="#9CA3AF"
              value={visitNoteText}
              onChangeText={setVisitNoteText}
              multiline
              numberOfLines={4}
              style={{ minHeight: 100, textAlignVertical: "top" }}
              autoFocus
            />

            <TouchableOpacity
              className={`bg-[#1A3F75] py-3.5 rounded-2xl items-center shadow-md ${isSubmittingNote ? "opacity-70" : ""}`}
              disabled={isSubmittingNote}
              onPress={async () => {
                if (visitNoteText.trim()) {
                  setIsSubmittingNote(true);
                  try {
                    const { status } =
                      await Location.requestForegroundPermissionsAsync();
                    let lat = "0.000000";
                    let lng = "0.000000";
                    if (status === "granted") {
                      const location = await Location.getCurrentPositionAsync(
                        {},
                      );
                      lat = location.coords.latitude.toString();
                      lng = location.coords.longitude.toString();
                    }

                    await API.post("/orders/visits", {
                      shop_id: parseInt(storeId),
                      visit_type: "nil",
                      notes: visitNoteText,
                      latitude: lat,
                      longitude: lng,
                    });

                    setShowVisitNoteModal(false);
                    setVisitNoteText("");
                    showPopup("Success", "Visit note submitted successfully!");
                  } catch (error) {
                    console.error("Failed to submit visit note:", error);
                    showPopup(
                      "Error",
                      "Failed to submit visit note. Please try again.",
                    );
                  } finally {
                    setIsSubmittingNote(false);
                  }
                } else {
                  showPopup(
                    "Required",
                    "Please enter a visit note before submitting.",
                  );
                }
              }}
            >
              {isSubmittingNote ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-[15px] font-bold">
                  Submit Note
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ===== POPUP MODAL ===== */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl w-full p-6 items-center shadow-xl">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                popupTitle === "Success" ? "bg-[#ECFDF5]" : "bg-[#FEF2F2]"
              }`}
            >
              <Ionicons
                name={
                  popupTitle === "Success" ? "checkmark-circle" : "alert-circle"
                }
                size={32}
                color={popupTitle === "Success" ? "#059669" : "#DC2626"}
              />
            </View>
            <Text className="text-[18px] font-bold text-gray-800 mb-2 text-center">
              {popupTitle}
            </Text>
            <Text className="text-[14px] text-gray-500 text-center mb-6 leading-5">
              {popupMessage}
            </Text>
            <TouchableOpacity
              className="w-full py-3.5 rounded-2xl bg-[#1A3F75] items-center"
              onPress={() => setPopupVisible(false)}
            >
              <Text className="text-white font-bold text-[14px]">OK</Text>
            </TouchableOpacity>
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
