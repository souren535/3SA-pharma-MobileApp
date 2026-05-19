import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useRouter } from "expo-router";

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAttendanceStore,
  useDashboardStore,
  useNotificationStore,
  useRouteStore,
  useShopStore,
} from "../../store/store";
import API from "../../utils/api";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Attendance states (global store)
  const { isWorking, setIsWorking, loadAttendanceState } = useAttendanceStore();
  const { stats, unvisitedStores, activeStatus, fetchDashboardData } =
    useDashboardStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [attendanceType, setAttendanceType] = useState<"login" | "logout">(
    "login",
  );
  const [submitting, setSubmitting] = useState(false);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [showLottie, setShowLottie] = useState(true);
  const [isNextStoreExpanded, setIsNextStoreExpanded] = useState(false);
  const { shops, fetchShops } = useShopStore();
  const { routes, fetchRoutes } = useRouteStore();

  useEffect(() => {
    fetchShops();
    fetchRoutes();
    fetchDashboardData();
    fetchNotifications();
    // Restore attendance state from storage
    loadAttendanceState();
  }, []);

  // activeStatus sync removed to prevent the backend from incorrectly resetting local attendance state on app reload

  React.useEffect(() => {
    // Continuous pulse animation for the glowing ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    if (isWorking) {
      setShowLottie(true);
    } else {
      setShowLottie(true);
      // Bounce the button one time
      Animated.sequence([
        Animated.spring(bounceAnim, {
          toValue: 1.2,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();

      // Stop showing the glowing ring after a few seconds when work ends
      const timer = setTimeout(() => {
        setShowLottie(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isWorking]);

  // Custom popup modal states
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState<"confirm" | "info">("info");
  const [popupOnConfirm, setPopupOnConfirm] = useState<(() => void) | null>(
    null,
  );

  // Show custom popup instead of Alert.alert
  const showPopup = (
    title: string,
    message: string,
    type: "confirm" | "info" = "info",
    onConfirm?: () => void,
  ) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupType(type);
    setPopupOnConfirm(() => onConfirm || null);
    setPopupVisible(true);
  };

  const handlePowerPress = () => {
    console.log("Power button pressed, isWorking:", isWorking);
    if (isWorking) {
      // Stop work flow — open modal for logout selfie
      showPopup(
        "Stop Working",
        "Are you sure you want to stop your work day?",
        "confirm",
        async () => {
          console.log("Logout confirmed");
          setPopupVisible(false);
          setAttendanceType("logout");
          setSelfieUri(null);
          // Request permissions
          if (!cameraPermission?.granted) {
            await requestCameraPermission();
          }
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            showPopup(
              "Permission Denied",
              "Location permission is required to end your work day.",
              "info",
            );
            return;
          }
          // Auto-fetch location
          setLocationLoading(true);
          setShowAttendanceModal(true);
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            setLocation({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
          } catch (error) {
            console.log("Location error:", error);
          }
          setLocationLoading(false);
        },
      );
    } else {
      // Start work flow
      showPopup(
        "Start Working",
        "Are you sure you want to start your work day?",
        "confirm",
        async () => {
          console.log("Login confirmed");
          setPopupVisible(false);
          setAttendanceType("login");
          // Request permissions
          if (!cameraPermission?.granted) {
            await requestCameraPermission();
          }
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            showPopup(
              "Permission Denied",
              "Location permission is required.",
              "info",
            );
            return;
          }
          // Auto-fetch location
          setLocationLoading(true);
          setShowAttendanceModal(true);
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            setLocation({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
            });
          } catch (error) {
            console.log("Location error:", error);
          }
          setLocationLoading(false);
        },
      );
    }
  };

  const takeSelfie = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });
      setSelfieUri(photo.uri);
    }
  };

  const handleAttendanceSubmit = async () => {
    if (!selfieUri) {
      showPopup("Required", "Please take a selfie first.", "info");
      return;
    }
    if (!location) {
      showPopup("Required", "Location not captured yet.", "info");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("face_image", {
        uri: selfieUri,
        type: "image/jpeg",
        name: "selfie.jpg",
      } as any);

      if (attendanceType === "login") {
        // LOGIN API
        formData.append("latitude", String(location!.lat));
        formData.append("longitude", String(location!.lng));

        await API.post("/attendance/login", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await setIsWorking(true);
        setSelfieUri(null);
        setLocation(null);
        setShowAttendanceModal(false);
        showPopup(
          "Success",
          "Attendance marked successfully! Your work day has started.",
          "info",
        );
      } else {
        // LOGOUT API
        const fallbackShopId = shops.length > 0 ? String(shops[0].id) : "1";
        formData.append("last_shop_id", fallbackShopId);
        formData.append("latitude", String(location!.lat));
        formData.append("longitude", String(location!.lng));

        await API.post("/attendance/logout", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await setIsWorking(false);
        setSelfieUri(null);
        setLocation(null);
        setShowAttendanceModal(false);
        showPopup(
          "Work Ended",
          "Your work day has been stopped successfully.",
          "info",
        );
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "";
      console.log("Attendance error:", error.response?.data || error.message);

      // If the server says "Already logged in", treat it as a success
      if (
        attendanceType === "login" &&
        errorMsg.toLowerCase().includes("already logged in")
      ) {
        await setIsWorking(true);
        setSelfieUri(null);
        setLocation(null);
        setShowAttendanceModal(false);
        showPopup(
          "Already Active",
          "You are already logged in for today. Your work day is active.",
          "info",
        );
      } else {
        showPopup(
          "Error",
          errorMsg || `Attendance ${attendanceType} failed. Please try again.`,
          "info",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Dynamic colors based on work status
  const powerIconColor = isWorking ? "#059669" : "#DC2626";

  return (
    <View className="flex-1 bg-[#F1F5F9]">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <View className="flex-1 pb-4">
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
            <View className="flex-row items-center">
              <Text className="text-[13px] text-white/70 font-medium mr-4">
                {formattedDate}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/pages/notifucation")}
                className="relative"
              >
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="white"
                />
                {unreadCount > 0 && (
                  <View className="absolute right-0.5 top-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1A3F75]" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* User card */}
          <View className="flex-row items-center bg-white/15 rounded-2xl py-3 px-3.5 mb-5">
            <View className="w-[38px] h-[38px] rounded-full bg-[#1A3F75] justify-center items-center mr-3">
              <Text className="text-[16px] font-bold text-white">S</Text>
            </View>
            <Text className="flex-1 text-[16px] font-semibold text-white">
              Souren Khan
            </Text>
            <View
              style={{
                alignItems: "center",
                position: "relative",
                width: 40,
                height: 40,
              }}
            >
              {/* Glowing ring behind button (zIndex: 0) */}
              {showLottie && (
                <Animated.View
                  pointerEvents="none"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    position: "absolute",
                    zIndex: 0,
                    backgroundColor: isWorking ? "#059669" : "#DC2626",
                    transform: [{ scale: pulseAnim }],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.5],
                      outputRange: [0.6, 0],
                    }),
                  }}
                />
              )}
              {/* Button on top (zIndex: 10) */}
              <Animated.View
                style={{ transform: [{ scale: bounceAnim }], zIndex: 10 }}
              >
                <TouchableOpacity
                  onPress={handlePowerPress}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    elevation: 5,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                  }}
                >
                  <MaterialIcons
                    name="power-settings-new"
                    size={24}
                    color={powerIconColor}
                  />
                </TouchableOpacity>
              </Animated.View>
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
                  {stats?.today_visits || 0}
                </Text>
                <Text className="text-[20px] font-normal text-[#94A3B8]">
                  {" "}
                  /{" "}
                </Text>
                <Text className="text-[26px] font-extrabold">
                  {(stats?.today_visits || 0) + unvisitedStores.length}
                </Text>
              </View>
              <Text className="text-[12px] font-medium text-[#94A3B8] mt-0.5">
                Visited Today
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ===== BODY CONTENT ===== */}
        <View className="px-4 -mt-3 flex-1">
          {/* Today's Performance Section */}
          <View className="flex-row justify-between items-center mb-3 mt-8">
            <Text className="text-[17px] font-bold text-[#1E293B]">
              Today's Performance
            </Text>
          </View>

          <View className="flex-row justify-between mb-6 gap-[10px]">
            {/* Sales */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#ECFDF5]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#D1FAE5]">
                <MaterialIcons name="trending-up" size={18} color="#059669" />
              </View>
              <Text className="text-[16px] font-extrabold mb-0.5 text-[#059669]">
                ₹{stats?.today_sales || 0}
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Sales
              </Text>
            </View>

            {/* Collection */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#EFF6FF]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#DBEAFE]">
                <MaterialIcons
                  name="account-balance-wallet"
                  size={18}
                  color="#2563EB"
                />
              </View>
              <Text className="text-[16px] font-extrabold mb-0.5 text-[#2563EB]">
                ₹{stats?.today_collection || 0}
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Collected
              </Text>
            </View>

            {/* Visits */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#FFFBEB]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#FEF3C7]">
                <MaterialIcons name="storefront" size={18} color="#D97706" />
              </View>
              <Text className="text-[16px] font-extrabold mb-0.5 text-[#D97706]">
                {stats?.today_visits || 0}
              </Text>
              <Text className="text-[11px] font-semibold text-[#64748B]">
                Visits
              </Text>
            </View>

            {/* Monthly */}
            <View className="flex-1 items-center rounded-2xl py-3.5 px-1.5 bg-[#F5F3FF]">
              <View className="w-[34px] h-[34px] rounded-[10px] justify-center items-center mb-2 bg-[#EDE9FE]">
                <MaterialIcons name="insert-chart" size={18} color="#7C3AED" />
              </View>
              <Text className="text-[14px] font-extrabold mb-0.5 text-[#7C3AED]">
                ₹
                {(stats?.monthly_sales || 0).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </Text>
              <Text className="text-[10px] font-semibold text-[#64748B]">
                Monthly
              </Text>
            </View>
          </View>

          {/* Priority Actions */}
          <View className="flex-row justify-between items-center mb-3 mt-1">
            <Text className="text-[17px] font-bold text-[#1E293B]">
              Priority Actions
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          {/* Assigned Route Card */}
          {routes.length > 0 && (
            <View className="flex-row items-center bg-white rounded-[18px] p-[18px] mb-2.5 shadow-sm shadow-black/10">
              <View className="mr-3.5">
                <View className="w-[46px] h-[46px] rounded-[14px] bg-[#F5F3FF] justify-center items-center">
                  <MaterialIcons name="alt-route" size={22} color="#7C3AED" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-semibold text-[#64748B] mb-1">
                  Assigned Route
                </Text>
                <Text className="text-[18px] font-extrabold text-[#1E293B]">
                  {routes[0].name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <MaterialIcons name="location-on" size={12} color="#94A3B8" />
                  <Text className="text-[12px] font-medium text-[#94A3B8] ml-0.5">
                    {routes[0].areas?.length || 0} Areas
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Visit Next Store */}
          {unvisitedStores.length > 0 && (
            <View className="bg-white rounded-2xl mb-2.5 shadow-sm shadow-black/5 overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={() => setIsNextStoreExpanded(!isNextStoreExpanded)}
              >
                <View className="w-[42px] h-[42px] rounded-[13px] justify-center items-center mr-3.5 bg-[#EDE9FE]">
                  <MaterialIcons name="store" size={20} color="#7C3AED" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#1E293B] mb-0.5">
                    Visit Next Store
                  </Text>
                  <Text
                    className="text-[12px] font-medium text-[#94A3B8]"
                    numberOfLines={1}
                  >
                    {unvisitedStores[0].shop_name}, {unvisitedStores[0].address}
                  </Text>
                </View>
                <MaterialIcons
                  name={isNextStoreExpanded ? "expand-less" : "expand-more"}
                  size={24}
                  color="#94A3B8"
                />
              </TouchableOpacity>

              {isNextStoreExpanded && (
                <View className="px-4 pb-4 pt-1 border-t border-gray-100">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-500 text-xs font-semibold">
                      Owner:
                    </Text>
                    <Text className="text-gray-800 text-xs font-bold">
                      {unvisitedStores[0].owner_name}
                    </Text>
                  </View>
                  <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500 text-xs font-semibold">
                      Contact:
                    </Text>
                    <Text className="text-gray-800 text-xs font-bold">
                      {unvisitedStores[0].contact}
                    </Text>
                  </View>

                  <TouchableOpacity
                    className="bg-[#2563EB] py-3 rounded-xl items-center flex-row justify-center"
                    onPress={() => {
                      if (!isWorking) {
                        showPopup("Action Required", "Please start your work day before placing an order.", "info");
                        return;
                      }
                      router.push({
                        pathname: "/pages/orderCreate",
                        params: {
                          storeId: unvisitedStores[0].id.toString(),
                          storeName: unvisitedStores[0].shop_name,
                          fromStore: "true",
                        },
                      });
                    }}
                  >
                    <MaterialIcons
                      name="add-shopping-cart"
                      size={18}
                      color="white"
                    />
                    <Text className="text-white font-bold ml-2 text-sm">
                      Place Order for this Store
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Place New Order */}
          <TouchableOpacity
            className="flex-row items-center bg-white rounded-2xl p-4 mb-2.5 shadow-sm shadow-black/5"
            onPress={() => router.push("/pages/orderCreate")}
          >
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
          </ScrollView>
        </View>
      </View>

      {/* ===== CUSTOM POPUP MODAL ===== */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center px-8">
          <View className="bg-white rounded-3xl w-full p-6 items-center shadow-xl">
            {/* Icon */}
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                popupType === "confirm"
                  ? "bg-[#EFF6FF]"
                  : popupTitle === "Success"
                    ? "bg-[#ECFDF5]"
                    : popupTitle.includes("Denied") || popupTitle === "Required"
                      ? "bg-[#FEF2F2]"
                      : "bg-[#EFF6FF]"
              }`}
            >
              <MaterialIcons
                name={
                  popupType === "confirm"
                    ? "help-outline"
                    : popupTitle === "Success"
                      ? "check-circle"
                      : popupTitle.includes("Denied") ||
                          popupTitle === "Required"
                        ? "error-outline"
                        : "info-outline"
                }
                size={32}
                color={
                  popupType === "confirm"
                    ? "#1A3F75"
                    : popupTitle === "Success"
                      ? "#059669"
                      : popupTitle.includes("Denied") ||
                          popupTitle === "Required"
                        ? "#DC2626"
                        : "#1A3F75"
                }
              />
            </View>

            <Text className="text-[18px] font-bold text-gray-800 mb-2 text-center">
              {popupTitle}
            </Text>
            <Text className="text-[14px] text-gray-500 text-center mb-6 leading-5">
              {popupMessage}
            </Text>

            {popupType === "confirm" ? (
              <View className="flex-row gap-3 w-full">
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-2xl bg-gray-100 items-center"
                  onPress={() => setPopupVisible(false)}
                >
                  <Text className="text-gray-600 font-bold text-[14px]">
                    No
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3.5 rounded-2xl bg-[#1A3F75] items-center"
                  onPress={() => popupOnConfirm?.()}
                >
                  <Text className="text-white font-bold text-[14px]">Yes</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="w-full py-3.5 rounded-2xl bg-[#1A3F75] items-center"
                onPress={() => setPopupVisible(false)}
              >
                <Text className="text-white font-bold text-[14px]">OK</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* ===== ATTENDANCE MODAL ===== */}
      <Modal
        visible={showAttendanceModal}
        animationType="slide"
        transparent={false}
      >
        <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
          <View className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-3 pb-4 border-b border-gray-100">
              <Text className="text-xl font-bold text-[#1E293B]">
                {attendanceType === "login"
                  ? "Mark Attendance"
                  : "End Work Day"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelfieUri(null);
                  setLocation(null);
                  setShowAttendanceModal(false);
                }}
                className="bg-gray-100 p-2 rounded-full"
              >
                <MaterialIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Camera Section - Moved OUTSIDE ScrollView to prevent Android SurfaceView bleeding */}
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
                  borderRadius: Platform.OS === "ios" ? 16 : 0, // Android SurfaceView doesn't clip borderRadius natively
                }}
              >
                {selfieUri ? (
                  <View style={{ flex: 1 }}>
                    <Image
                      source={{ uri: selfieUri }}
                      style={{ flex: 1 }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      className="absolute bottom-3 right-3 bg-white/90 px-4 py-2 rounded-xl"
                      onPress={() => setSelfieUri(null)}
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
                    {showAttendanceModal && (
                      <CameraView
                        ref={cameraRef}
                        style={{
                          width: Dimensions.get("window").width - 40,
                          height: 300,
                        }}
                        facing="front"
                      />
                    )}
                    <TouchableOpacity
                      className="absolute bottom-4 self-center w-16 h-16 rounded-full bg-white border-4 border-[#1A3F75] items-center justify-center shadow-lg"
                      onPress={takeSelfie}
                    >
                      <View className="w-12 h-12 rounded-full bg-[#1A3F75]" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <MaterialIcons
                      name="camera-alt"
                      size={40}
                      color="#9CA3AF"
                    />
                    <Text className="text-gray-400 mt-2 text-sm">
                      Camera permission required
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Scrollable area for remaining content */}
            <ScrollView
              className="px-5 mt-2"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              {/* Location Section */}
              <View className="mb-4">
                <Text className="text-[12px] font-bold text-gray-400 uppercase mb-2 tracking-wider">
                  Location Status
                </Text>
                <View className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                  {locationLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator size="small" color="#1A3F75" />
                      <Text className="ml-3 text-[#1A3F75] font-medium text-[14px]">
                        Capturing precise location...
                      </Text>
                    </View>
                  ) : location ? (
                    <View>
                      <View className="flex-row items-center mb-1">
                        <MaterialIcons
                          name="location-on"
                          size={18}
                          color="#059669"
                        />
                        <Text className="ml-2 text-green-700 font-bold text-[14px]">
                          Location captured successfully
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-[12px] ml-6">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
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
                  paddingBottom:
                    Platform.OS === "ios"
                      ? insets.bottom + 10
                      : insets.bottom + 20,
                }}
              >
                <TouchableOpacity
                  className={`py-4 rounded-2xl items-center shadow-sm ${
                    selfieUri && location
                      ? attendanceType === "login" ? "bg-[#1A3F75]" : "bg-[#DC2626]"
                      : "bg-gray-200"
                  }`}
                  onPress={handleAttendanceSubmit}
                  disabled={submitting || !selfieUri || !location}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text className={`text-[16px] font-bold ${(!selfieUri || !location) ? 'text-gray-400' : 'text-white'}`}>
                      {attendanceType === "login"
                        ? "Confirm & Start Work"
                        : "Confirm & End Work"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
