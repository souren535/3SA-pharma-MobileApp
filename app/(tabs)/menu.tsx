import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Modal,
} from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAuthStore,
  useAttendanceStore,
  usePaymentStore,
  useDashboardStore,
  IMAGE_BASE_URL,
} from "@/store/store";

const { width } = Dimensions.get("window");

export default function MenuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const { isWorking } = useAttendanceStore();
  const { paymentsHistory, fetchPaymentsHistory } = usePaymentStore();
  const { stats, fetchDashboardData } = useDashboardStore();

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  React.useEffect(() => {
    fetchPaymentsHistory();
    fetchDashboardData();
  }, []);

  const getProfileImageSource = () => {
    const img = user?.profile_image;
    if (!img || img === "null" || img === "undefined" || img.trim() === "") {
      return require("../../assets/images/avatar.png");
    }
    if (img.startsWith("http")) {
      return { uri: img };
    }
    return { uri: `${IMAGE_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}` };
  };

  const MENU_ITEMS = [
    {
      id: "profile",
      title: user?.name || "Salesman User",
      subtitle: `${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Sales Executive"} (ID: #${user?.employee_id || user?.id || "N/A"})`,
      icon: "person-circle-outline",
      type: "profile",
      image: getProfileImageSource(),
      route: "/pages/profile" as const,
    },
    {
      id: "payment",
      title: "Payments",
      // subtitle: {
      //   title: "Balance",
      //   subTitle: `₹${(stats?.today_collection || 0).toLocaleString('en-IN')}`
      // },
      icon: "wallet-outline",
      gradient: ["#6366f1", "#4f46e5"] as const,
      stats: `${paymentsHistory.length} Transactions`,
      route: "/pages/payment" as const,
    },
    {
      id: "support",
      title: "Help & Support",
      subtitle: "Get instant help from our team",
      icon: "chatbubble-ellipses-outline",
      gradient: ["#ec4899", "#db2777"] as const,
      route: "/pages/support" as const,
    },
    {
      id: "visits",
      title: "Visit History",
      subtitle: "View all your store visits",
      icon: "location-outline",
      gradient: ["#10b981", "#059669"] as const,
      route: "/pages/visits" as const,
    },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.replace("/(auth)");
  };

  const renderCard = (item: any) => {
    if (item.type === "profile") {
      return (
        <TouchableOpacity
          key={item.id}
          className="bg-white rounded-[32px] p-6 mb-4 shadow-sm border border-slate-100 flex-row items-center"
          activeOpacity={0.7}
          onPress={() => item.route && router.push(item.route)}
        >
          <Image
            source={item.image}
            className="w-16 h-16 rounded-full border-2 border-indigo-100"
            contentFit="cover"
            transition={500}
          />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-slate-900">
              {item.title}
            </Text>
            <Text className="text-slate-500 text-sm">{item.subtitle}</Text>
            <View className="flex-row items-center mt-2">
              <View className="bg-green-100 px-2 py-0.5 rounded-full">
                <Text className="text-green-700 text-[10px] font-bold uppercase">
                  Active
                </Text>
              </View>
              <Text className="text-slate-400 text-xs ml-2">
                Last sync: 10m ago
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        className="mb-4"
        onPress={() => item.route && router.push(item.route)}
      >
        <LinearGradient
          colors={item.gradient || ["#f8fafc", "#f1f5f9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-[32px] p-6 flex-row items-center overflow-hidden"
        >
          <View className="bg-white/20 p-3 rounded-2xl mr-4">
            <Ionicons name={item.icon as any} size={28} color="white" />
          </View>

          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{item.title}</Text>
            {typeof item.subtitle === "object" ? (
              <View className="flex-row items-center">
                <Text className="text-white/80 text-sm">
                  {item.subtitle.title}:{" "}
                </Text>
                <Text className="text-white font-bold text-sm">
                  {item.subtitle.subTitle}
                </Text>
              </View>
            ) : (
              <Text className="text-white/80 text-sm">{item.subtitle}</Text>
            )}
          </View>

          {item.stats ? (
            <View className="bg-white/30 px-3 py-1 rounded-full">
              <Text className="text-white text-[10px] font-bold">
                {item.stats}
              </Text>
            </View>
          ) : null}

          <Ionicons
            name="chevron-forward"
            size={20}
            color="rgba(255,255,255,0.6)"
            className="ml-2"
          />
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#f8fafc]">
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
            <View className="ml-4">
              <Text className="text-[#1E293B] text-xl font-bold tracking-wider">
                Menu
              </Text>
              <Text className="text-gray-700 text-sm opacity-90">
                Configure your workspace
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Attendance Warning Banner */}
        {!isWorking && (
          <View className="bg-[#FEF3C7] rounded-2xl p-4 mb-4 flex-row items-center border border-[#FDE68A]">
            <View className="bg-[#F59E0B] p-2 rounded-xl mr-3">
              <Ionicons name="warning" size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-[#92400E] font-bold text-sm">
                Attendance Not Marked
              </Text>
              <Text className="text-[#B45309] text-xs mt-0.5">
                Mark attendance to unlock all features
              </Text>
            </View>
          </View>
        )}

        {/* Always show profile card */}
        {MENU_ITEMS.filter((item) => item.id === "profile").map(renderCard)}

        {/* Show other menu items only when attendance is marked */}
        {isWorking &&
          MENU_ITEMS.filter((item) => item.id !== "profile").map(renderCard)}

        {/* Preferences - only when attendance is marked */}
        {isWorking && (
          <View className="mt-6 mb-4">
            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
              Preferences
            </Text>

            <TouchableOpacity
              className="bg-white rounded-3xl p-4 mb-2 flex-row items-center border border-slate-100 shadow-sm"
              onPress={() => router.push("/pages/notifucation")}
            >
              <View className="bg-indigo-50 p-2 rounded-xl mr-3">
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color="#6366f1"
                />
              </View>
              <Text className="flex-1 text-slate-700 font-medium">
                Notifications
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          className="mt-8 bg-red-50 rounded-3xl p-5 flex-row items-center justify-center border border-red-100"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text className="ml-2 text-red-600 font-bold text-lg">Logout</Text>
        </TouchableOpacity>

        <View className="items-center mt-8 opacity-30">
          <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            SFA Pro v1.0.42
          </Text>
          <Text className="text-[10px] text-slate-500">
            Built with by 3SA Team
          </Text>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutModal} transparent={true} animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="bg-white w-full rounded-[32px] p-8 items-center shadow-xl">
            <View className="bg-red-50 p-4 rounded-full mb-4">
              <Ionicons name="log-out" size={32} color="#ef4444" />
            </View>
            <Text className="text-2xl font-bold text-slate-900 mb-2">
              Logout?
            </Text>
            <Text className="text-slate-500 text-center mb-8 text-lg">
              Are you sure you want to log out of your account?
            </Text>

            <View className="flex-row w-full gap-3">
              <TouchableOpacity
                className="flex-1 bg-slate-100 py-4 rounded-2xl items-center"
                onPress={() => setShowLogoutModal(false)}
              >
                <Text className="text-slate-700 font-bold text-lg">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-4 rounded-2xl items-center shadow-sm shadow-red-200"
                onPress={confirmLogout}
              >
                <Text className="text-white font-bold text-lg">
                  Yes, Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
