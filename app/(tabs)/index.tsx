import React, { useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Modal,
  Platform,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import LottieView from "lottie-react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { Image } from "expo-image";
import API from "../../utils/api";
import { useEffect } from "react";
import { useShopStore, useRouteStore } from "../../store/store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Attendance states
  const [isWorking, setIsWorking] = useState(false);
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
  const lottieRef = useRef<LottieView>(null);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [showLottie, setShowLottie] = useState(true);
  const { shops, fetchShops } = useShopStore();
  const { routes, fetchRoutes } = useRouteStore();

  useEffect(() => {
    fetchShops();
    fetchRoutes();
    // Restore attendance state from storage
    AsyncStorage.getItem('isWorking').then((val) => {
      if (val === 'true') {
        setIsWorking(true);
      }
    });
  }, []);

  React.useEffect(() => {
    if (isWorking) {
      // Working: show green looping animation
      setShowLottie(true);
    } else {
      // Not working: show red animation once, then hide
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

      // Play lottie once then hide after ~2 seconds
      lottieRef.current?.play();
      const timer = setTimeout(() => {
        setShowLottie(false);
      }, 2000);
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
          // Request camera permission for logout selfie
          if (!cameraPermission?.granted) {
            await requestCameraPermission();
          }
          setShowAttendanceModal(true);
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
    if (attendanceType === "login" && !location) {
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

        setIsWorking(true);
        await AsyncStorage.setItem('isWorking', 'true');
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

        await API.post("/attendance/logout", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setIsWorking(false);
        await AsyncStorage.setItem('isWorking', 'false');
        setSelfieUri(null);
        setLocation(null);
        setShowAttendanceModal(false);
        // Play red lottie animation once
        setTimeout(() => {
          lottieRef.current?.play();
        }, 300);
        showPopup(
          "Work Ended",
          "Your work day has been stopped successfully.",
          "info",
        );
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || '';
      console.log("Attendance error:", error.response?.data || error.message);

      // If the server says "Already logged in", treat it as a success
      if (attendanceType === 'login' && errorMsg.toLowerCase().includes('already logged in')) {
        setIsWorking(true);
        await AsyncStorage.setItem('isWorking', 'true');
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
            <View style={{ alignItems: 'center', position: 'relative', width: 40, height: 40 }}>
              {/* Lottie behind button (zIndex: 0) */}
              {showLottie && (
                <View
                  pointerEvents="none"
                  style={{
                    width: 100,
                    height: 100,
                    position: "absolute",
                    top: -30,
                    left: -30,
                    zIndex: 0,
                  }}
                >
                  <LottieView
                    key={`lottie-${isWorking}-${showLottie}`}
                    ref={lottieRef}
                    source={require("@/assets/animation/blink-animation.json")}
                    autoPlay={isWorking}
                    loop={isWorking}
                    colorFilters={[
                      {
                        keypath: "**",
                        color: isWorking ? "#059669" : "#DC2626",
                      },
                    ]}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
              {/* Button on top (zIndex: 10) */}
              <Animated.View style={{ transform: [{ scale: bounceAnim }], zIndex: 10 }}>
                <TouchableOpacity
                  onPress={handlePowerPress}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 5,
                    shadowColor: '#000',
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
                  {shops.length}
                </Text>
                <Text className="text-[20px] font-normal text-[#94A3B8]">
                  {" "}
                  /{" "}
                </Text>
                <Text className="text-[26px] font-extrabold">12</Text>
              </View>
              <Text className="text-[12px] font-medium text-[#94A3B8] mt-0.5">
                Visited Today
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
      <Modal visible={showAttendanceModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="bg-white rounded-t-3xl"
            style={{
              maxHeight: Dimensions.get("window").height * 0.85,
              paddingBottom: Platform.OS === "ios" ? insets.bottom + 20 : 30,
            }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-800">
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
              >
                <MaterialIcons name="close" size={26} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-5 mt-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Camera Section */}
              <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                Take a Selfie
              </Text>
              <View
                className="bg-gray-100 rounded-2xl overflow-hidden mb-5"
                style={{ height: 300 }}
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
                  <View style={{ flex: 1 }}>
                    <CameraView
                      ref={cameraRef}
                      style={{ flex: 1 }}
                      facing="front"
                    />
                    <TouchableOpacity
                      className="absolute bottom-4 self-center w-16 h-16 rounded-full bg-white border-4 border-[#1A3F75] items-center justify-center"
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

              {/* Location Section — only for login */}
              {attendanceType === "login" && (
                <>
                  <Text className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Location (Auto-Captured)
                  </Text>
                  <View className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-100">
                    {locationLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#1A3F75" />
                        <Text className="ml-3 text-gray-500 text-sm">
                          Fetching location...
                        </Text>
                      </View>
                    ) : location ? (
                      <View>
                        <View className="flex-row items-center mb-2">
                          <MaterialIcons
                            name="my-location"
                            size={18}
                            color="#059669"
                          />
                          <Text className="ml-2 text-green-700 font-bold text-sm">
                            Location Captured ✓
                          </Text>
                        </View>
                        <Text className="text-gray-600 text-xs">
                          Lat: {location.lat.toFixed(6)}
                        </Text>
                        <Text className="text-gray-600 text-xs mt-1">
                          Lng: {location.lng.toFixed(6)}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-gray-400 text-sm">
                        Location not available
                      </Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>

            {/* Submit Button */}
            <View className="px-5 pt-3">
              <TouchableOpacity
                className={`py-4 rounded-2xl items-center shadow-md ${
                  attendanceType === "login"
                    ? selfieUri && location
                      ? "bg-[#1A3F75]"
                      : "bg-gray-300"
                    : selfieUri
                      ? "bg-[#DC2626]"
                      : "bg-gray-300"
                }`}
                onPress={handleAttendanceSubmit}
                disabled={
                  submitting ||
                  !selfieUri ||
                  (attendanceType === "login" && !location)
                }
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-[15px] font-bold">
                    {attendanceType === "login"
                      ? "Submit Attendance"
                      : "End Work Day"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
