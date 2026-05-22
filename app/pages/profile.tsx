import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore, IMAGE_BASE_URL } from "@/store/store";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { compressToWebP } from "../../utils/imageCompress";
import { authService } from "@/service/auth.service";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [isUploading, setIsUploading] = React.useState(false);
  const [showPickerModal, setShowPickerModal] = React.useState(false);

  // ── Popup Modal State ──
  const [popupVisible, setPopupVisible] = React.useState(false);
  const [popupTitle, setPopupTitle] = React.useState('');
  const [popupMessage, setPopupMessage] = React.useState('');
  const [popupIsSuccess, setPopupIsSuccess] = React.useState(false);

  const showPopup = (title: string, message: string, isSuccess?: boolean) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupIsSuccess(isSuccess ?? title === 'Success');
    setPopupVisible(true);
  };

  const img = user?.profile_image;
  const hasProfileImage = !!(img && img !== "null" && img !== "undefined" && img.trim() !== "");

  // Resolve the profile image source safely
  const getProfileImageSource = () => {
    const img = user?.profile_image;
    if (!img || img === "null" || img === "undefined" || img.trim() === "") {
      return require("../../assets/images/avatar.png");
    }
    if (img.startsWith("http")) {
      return { uri: img };
    }
    // Prefix relative paths (e.g., starting with "/storage") with the base URL
    return { uri: `${IMAGE_BASE_URL}${img.startsWith("/") ? "" : "/"}${img}` };
  };

  const uploadImage = async (uri: string) => {
    setIsUploading(true);
    try {
      const compressedUri = await compressToWebP(uri, 0.7);

      const formData = new FormData();
      let fileUri = compressedUri;
      if (Platform.OS === 'android' && !fileUri.startsWith('file://') && !fileUri.startsWith('content://') && !fileUri.startsWith('http')) {
        fileUri = `file://${fileUri}`;
      }

      if (Platform.OS === 'android' && fileUri.startsWith('file://')) {
        try {
          let decoded = fileUri;
          while (decoded.includes('%')) {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
          }
          fileUri = decoded;
        } catch (e) {
          console.warn('URI decode failed:', e);
        }
      }

      formData.append("profile_image", {
        uri: fileUri,
        name: "profile_image.webp",
        type: "image/webp",
      } as any);

      const updatedUser = await authService.updateProfileImage(formData);
      setUser(updatedUser);
      showPopup("Success", "Profile image updated successfully.", true);
    } catch (err: any) {
      console.error("Upload error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to upload image.";
      showPopup("Error", errMsg, false);
    } finally {
      setIsUploading(false);
    }
  };

  const takePhoto = async () => {
    setShowPickerModal(false);
    // Delay to let the modal close smoothly before opening camera
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showPopup("Permission Denied", "Camera permission is required to take photos.", false);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Camera error:", err);
      showPopup("Error", "Could not open camera.", false);
    }
  };

  const pickFromGallery = async () => {
    setShowPickerModal(false);
    // Delay to let the modal close smoothly before opening library
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showPopup("Permission Denied", "Gallery permission is required to select photos.", false);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled && result.assets?.length > 0) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Gallery error:", err);
      showPopup("Error", "Could not open gallery.", false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#1A3F75", "#1A3F75"]}
        style={{
          paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 20,
          paddingBottom: 32,
          paddingHorizontal: 20,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Profile</Text>
          <View className="w-10 h-10" />
        </View>

        <View className="items-center mt-2">
          <TouchableOpacity
            onPress={() => !isUploading && !hasProfileImage && setShowPickerModal(true)}
            activeOpacity={hasProfileImage ? 1 : 0.85}
            disabled={isUploading || hasProfileImage}
            style={{ position: "relative" }}
          >
            <Image
              source={getProfileImageSource()}
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.3)",
                marginBottom: 12,
                opacity: isUploading ? 0.6 : 1,
              }}
              contentFit="cover"
            />
            {isUploading ? (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)',
              }}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            ) : !hasProfileImage ? (
              <View style={{
                position: 'absolute',
                bottom: 12,
                right: 0,
                backgroundColor: '#fff',
                width: 30,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 4
              }}>
                <Ionicons name="camera" size={16} color="#1A3F75" />
              </View>
            ) : null}
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            {user?.name || "Salesman User"}
          </Text>
          <Text className="text-white/80 text-sm mt-1">
            {user?.email || "salesman@example.com"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 mt-2"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
          <Text className="text-lg font-bold text-slate-800 mb-4">
            Personal Details
          </Text>

          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="briefcase-outline" size={24} color="#059669" />
            </View>
            <View className="flex-1 border-b border-slate-50 pb-4">
              <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Role
              </Text>
              <Text className="text-slate-800 font-bold text-base mt-1">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "Salesman"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="call-outline" size={24} color="#D97706" />
            </View>
            <View className="flex-1 border-b border-slate-50 pb-4">
              <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Contact Number
              </Text>
              <Text className="text-slate-800 font-bold text-base mt-1">
                {user?.phone || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-rose-50 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="location-outline" size={24} color="#E11D48" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Address
              </Text>
              <Text className="text-slate-800 font-bold text-base mt-1">
                {user?.address || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Photo Picker Modal */}
      <Modal
        visible={showPickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPickerModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
          activeOpacity={1}
          onPress={() => setShowPickerModal(false)}
        >
          <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <View style={{ width: 48, height: 6, backgroundColor: "#E2E8F0", borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#1E293B", textAlign: "center", marginBottom: 24 }}>
              Change Profile Photo
            </Text>

            <TouchableOpacity
              onPress={takePhoto}
              style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#F8FAFC", borderRadius: 16, marginBottom: 12 }}
            >
              <View style={{ width: 48, height: 48, backgroundColor: "#EEF2F6", borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Ionicons name="camera-outline" size={24} color="#1A3F75" />
              </View>
              <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>
                Take Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickFromGallery}
              style={{ flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#F8FAFC", borderRadius: 16, marginBottom: 20 }}
            >
              <View style={{ width: 48, height: 48, backgroundColor: "#EEF2F6", borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
                <Ionicons name="images-outline" size={24} color="#1A3F75" />
              </View>
              <Text style={{ color: "#334155", fontWeight: "700", fontSize: 16 }}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowPickerModal(false)}
              style={{ backgroundColor: "#F1F5F9", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
            >
              <Text style={{ color: "#475569", fontWeight: "800", fontSize: 16 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Popup Modal ── */}
      <Modal visible={popupVisible} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
          <View style={{ backgroundColor: 'white', borderRadius: 24, width: '100%', padding: 24, alignItems: 'center' }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              backgroundColor: popupIsSuccess ? '#ECFDF5' : '#FEF2F2',
            }}>
              <Ionicons
                name={popupIsSuccess ? 'checkmark-circle' : 'alert-circle'}
                size={32}
                color={popupIsSuccess ? '#059669' : '#DC2626'}
              />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>{popupTitle}</Text>
            <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>{popupMessage}</Text>
            <TouchableOpacity
              style={{ width: '100%', paddingVertical: 14, borderRadius: 16, backgroundColor: '#1A3F75', alignItems: 'center' }}
              onPress={() => setPopupVisible(false)}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>OK</Text>
            </TouchableOpacity>
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
