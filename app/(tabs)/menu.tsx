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
  console.log("USER", user);

  const MENU_ITEMS = [
    {
      id: "profile",
      title: user?.name || "Salesman User",
      // subtitle: `${user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}`,
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
      const hasProfileImage = !!(
        user?.profile_image &&
        user.profile_image !== "null" &&
        user.profile_image !== "undefined" &&
        user.profile_image.trim() !== ""
      );
      const firstChar = user?.name?.trim()?.charAt(0)?.toUpperCase();

      return (
        <TouchableOpacity
          key={item.id}
          className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 flex-row items-center justify-between"
          activeOpacity={0.7}
          onPress={() => item.route && router.push(item.route)}
        >
          <View className="flex-row items-center flex-1">
            {hasProfileImage ? (
              <Image
                source={item.image}
                className="w-16 h-16 rounded-full border-2 border-slate-100"
                style={{ width: 64, height: 64, borderRadius: 32 }}
                contentFit="cover"
                transition={500}
              />
            ) : firstChar ? (
              <View className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-slate-100 justify-center items-center">
                <Text className="text-2xl font-extrabold text-[#1A3F75]">
                  {firstChar}
                </Text>
              </View>
            ) : (
              <Image
                source={require("../../assets/images/avatar.png")}
                className="w-16 h-16 rounded-full border-2 border-slate-100"
                style={{ width: 64, height: 64, borderRadius: 32 }}
                contentFit="cover"
                transition={500}
              />
            )}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-extrabold text-[#1A3F75]">
                Hi {user?.name || "Salesman"}!
              </Text>
              {user?.phone && (
                <Text className="text-slate-500 text-sm font-semibold mt-0.5">
                  {user.phone}
                </Text>
              )}
              <View className="flex-row items-center mt-1.5 flex-wrap gap-2">
                <View className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <Text className="text-emerald-700 text-[10px] font-bold uppercase">
                    Active
                  </Text>
                </View>
                <Text className="text-slate-400 text-xs">
                  Last sync: 10m ago
                </Text>
              </View>
            </View>
          </View>
          <View className="w-8" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderOptionRow = (item: any, isLast: boolean) => {
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        className={`flex-row items-center py-4 px-5 justify-between ${
          !isLast ? "border-b border-slate-100" : ""
        }`}
        onPress={() => item.route && router.push(item.route)}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center border border-slate-100">
            <Ionicons name={item.icon as any} size={20} color="#1A3F75" />
          </View>
          <Text className="text-[#1E293B] text-[15px] font-extrabold ml-4 flex-1">
            {item.title}
          </Text>
        </View>
        <View className="flex-row items-center">
          {item.stats ? (
            <Text className="text-slate-400 text-xs font-semibold mr-2">
              {item.stats}
            </Text>
          ) : null}
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
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
                My Profile
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
        {isWorking && (
          <View className="mt-4">
            <Text className="text-[#1A3F75] text-[16px] font-extrabold mb-3 px-1">
              Workspace Options
            </Text>
            <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {MENU_ITEMS.filter((item) => item.id !== "profile").map((item, index, arr) =>
                renderOptionRow(item, index === arr.length - 1)
              )}
            </View>
          </View>
        )}

        {/* Preferences - only when attendance is marked */}
        {isWorking && (
          <View className="mt-6">
            <Text className="text-[#1A3F75] text-[16px] font-extrabold mb-3 px-1">
              Preferences
            </Text>
            <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <TouchableOpacity
                className="flex-row items-center py-4 px-5 justify-between"
                onPress={() => router.push("/pages/notifucation")}
              >
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-slate-50 items-center justify-center border border-slate-100">
                    <Ionicons name="notifications-outline" size={20} color="#1A3F75" />
                  </View>
                  <Text className="text-[#1E293B] text-[15px] font-extrabold ml-4 flex-1">
                    Notifications
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
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
            Lead Flow V1.0.0
          </Text>
          <Text className="text-[10px] text-slate-500">
            By 3SA WEBX
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
                  Yes
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
