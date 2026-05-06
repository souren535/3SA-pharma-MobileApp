import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section - Logo & Branding */}
          <View style={{ alignItems: "center", paddingTop: 10 }}>
            <Image
              source={require("../../assets/images/delivery-icon.png")}
              style={{ width: 200, height: 200 }}
              contentFit="contain"
            />
            <Text
              style={{
                fontFamily: "Lobster",
                fontSize: 100,
                color: "#1A3F75",
                marginTop: -35,
              }}
            >
              Delivery
            </Text>
          </View>

          {/* Welcome Text */}
          <View style={{ alignItems: "center", marginTop: -10 }}>
            <Text
              className="tracking-wider"
              style={{
                fontFamily: "Lobster",
                fontSize: 25,
              }}
            >
              Welcome Back !
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                marginTop: 4,
              }}
            >
              Login in to Existing Account
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ paddingHorizontal: 32, marginTop: 32 }}>
            {/* Email Field */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                // borderBottomColor: "#d1d5db",
                paddingVertical: 12,
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color="#6b7280"
                style={{ marginRight: 12 }}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="border-none outline-none text-black flex-1 text-base"
              />
              <TouchableOpacity>
                <Ionicons name="eye-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Password Field */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                // borderBottomColor: "#d1d5db",
                paddingVertical: 12,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color="#6b7280"
                style={{ marginRight: 12 }}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: "#111827",
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={{ alignSelf: "flex-end", marginTop: 8 }}>
              <Text
                style={{
                  // color: "#1e40af",
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="w-full bg-[#1A3F75] rounded-xl py-4 mt-6 shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-200">
              <Text className="text-white text-center text-lg font-semibold">
                Login
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} />
          <View className="absolute bottom-0 left-0 w-full h-40">
            <View
              className="absolute bottom-[-70px] left-[-20px] w-40 h-40 bg-[#90B0C7]/50 rounded-[20px] ml-20"
              style={{ transform: [{ rotate: "-15deg" }] }}
            />
            <View
              className="absolute bottom-[-40px] left-[-30px] w-40 h-40 bg-[#90B0C7] rounded-[20px]"
              style={{ transform: [{ rotate: "-17deg" }] }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
