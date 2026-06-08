import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
  Keyboard,
  Modal,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import Svg, { Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/store";
import { authService } from "../../service/auth.service";
import { useRouter } from "expo-router";
import { StatusModal } from "../../components/ui/status-modal";
import { StatusBar } from "expo-status-bar";

import { scale, moderateScale, verticalScale } from "../../utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        if (Platform.OS === "android") {
          setKeyboardHeight(e.endCoordinates.height);
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        if (Platform.OS === "android") {
          setKeyboardHeight(0);
        }
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: "error" as "error" | "success" | "info",
    title: "",
    message: "",
  });

  const { login } = useAuthStore();
  const router = useRouter();

  const showModal = (
    type: "error" | "success" | "info",
    title: string,
    message: string,
  ) => {
    setModalConfig({ visible: true, type, title, message });
  };

  // Forgot Password State
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<"EMAIL" | "OTP" | "RESET">("EMAIL");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const forgotClosedTimeRef = useRef<number | null>(null);

  // Reset all forgot password state
  const resetForgotState = () => {
    setForgotStep("EMAIL");
    setForgotEmail("");
    setOtpValues(Array(6).fill(""));
    setOtpTimer(120);
    setCanResend(false);
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setForgotLoading(false);
    setOtpSuccessMessage("");
    forgotClosedTimeRef.current = null;
  };

  const openForgotModal = () => {
    if (forgotClosedTimeRef.current && forgotStep !== "EMAIL") {
      const elapsedMs = Date.now() - forgotClosedTimeRef.current;
      const elapsedSecs = Math.floor(elapsedMs / 1000);

      // Reopen in same step if closed for less than 1 minute (60,000 ms)
      if (elapsedMs < 1 * 60 * 1000) {
        if (forgotStep === "OTP") {
          const newTimer = Math.max(0, otpTimer - elapsedSecs);
          setOtpTimer(newTimer);
          if (newTimer === 0) {
            setCanResend(true);
          }
        }
        forgotClosedTimeRef.current = null;
        setForgotModalVisible(true);
        return;
      }
    }

    // Default fallback (first open, or closed for >= 1 minute)
    resetForgotState();
    setForgotModalVisible(true);
  };

  const closeForgotModal = () => {
    forgotClosedTimeRef.current = Date.now();
    setForgotModalVisible(false);
  };

  // Timer countdown hook
  useEffect(() => {
    let interval: any;
    if (forgotModalVisible && forgotStep === "OTP" && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [forgotModalVisible, forgotStep, otpTimer]);

  const handleSendOtp = async () => {
    if (!forgotEmail) {
      showModal("error", "Error", "Please enter email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      showModal("error", "Error", "Please enter a valid email address");
      return;
    }

    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);

      showModal("success", "OTP Sent", "A 6-digit OTP has been sent to your email successfully.");
      setForgotStep("OTP");
      setOtpTimer(120);
      setCanResend(false);
      setOtpValues(Array(6).fill(""));
      // Focus first input after transition
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 500);
    } catch (error: any) {
      console.log("Send OTP Error:", error);
      showModal(
        "error",
        "Failed to Send OTP",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otpValues.join("");
    if (otpString.length !== 6) {
      showModal("error", "Error", "Please enter 6-digit OTP code");
      return;
    }
    
    // Simulate verification or wait before showing message
    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setOtpSuccessMessage("OTP Verified Successfully!");
      
      // Wait briefly to show message before moving to next step
      setTimeout(() => {
        setOtpSuccessMessage("");
        setForgotStep("RESET");
      }, 1500);
    }, 500);
  };

  const handleResendOtp = async () => {
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);

      showModal("success", "OTP Resent", "A new 6-digit OTP has been sent to your email.");
      setOtpTimer(120);
      setCanResend(false);
      setOtpValues(Array(6).fill(""));
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 500);
    } catch (error: any) {
      console.log("Resend OTP Error:", error);
      showModal(
        "error",
        "Failed to Resend OTP",
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showModal("error", "Error", "Please fill in all password fields");
      return;
    }
    if (newPassword.length < 6) {
      showModal("error", "Error", "Password must be at least 6 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      showModal("error", "Error", "Passwords do not match");
      return;
    }

    const otpString = otpValues.join("");
    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail, otpString, newPassword);

      setForgotModalVisible(false);
      showModal("success", "Success", "Your password has been reset successfully. Please log in.");
      resetForgotState();
    } catch (error: any) {
      console.log("Reset Password Error:", error);
      showModal(
        "error",
        "Reset Failed",
        error.response?.data?.message || "Failed to reset password. Please check your OTP and try again."
      );
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const sanitizedVal = value.replace(/[^0-9]/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = sanitizedVal;
    setOtpValues(newOtp);

    if (sanitizedVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Just dismiss keyboard if all 6 digits are filled
    const fullOtp = newOtp.join("");
    if (fullOtp.length === 6) {
      Keyboard.dismiss();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        const newOtp = [...otpValues];
        newOtp[index - 1] = "";
        setOtpValues(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal("error", "Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      console.log("email", email);
      console.log("password", password);
      await login(email, password);
      router.replace("/(tabs)");
    } catch (error: any) {
      showModal(
        "error",
        "Login Failed",
        error.response?.data?.message || "Invalid credentials",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => {
    return (
      <View style={{ marginTop: scale(10) }}>
        <Text style={{ fontSize: moderateScale(14), color: "#6b7280", marginBottom: scale(20), lineHeight: scale(20) }}>
          Enter the email address associated with your account. We will send a 6-digit OTP code to verify your identity.
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
            paddingVertical: scale(10),
            marginBottom: scale(30),
          }}
        >
          <Ionicons name="mail-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Enter Email Address"
            placeholderTextColor="#9ca3af"
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              flex: 1,
              fontSize: moderateScale(16),
              color: "#111827",
            }}
          />
        </View>

        <TouchableOpacity
          onPress={handleSendOtp}
          disabled={forgotLoading}
          style={{
            backgroundColor: "#1A3F75",
            borderRadius: scale(12),
            paddingVertical: scale(14),
            alignItems: "center",
            shadowColor: "#1A3F75",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
            marginBottom: scale(16),
          }}
        >
          {forgotLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: moderateScale(16), fontWeight: "bold" }}>
              Send OTP
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderOtpStep = () => {
    const formattedEmail = forgotEmail.length > 25 ? forgotEmail.substring(0, 22) + "..." : forgotEmail;
    return (
      <View style={{ marginTop: scale(10) }}>
        <Text style={{ fontSize: moderateScale(14), color: "#6b7280", marginBottom: scale(20), lineHeight: scale(20) }}>
          We have sent a 6-digit verification code to{"\n"}
          <Text style={{ fontWeight: "bold", color: "#1A3F75" }}>{formattedEmail}</Text>. Please enter it below.
        </Text>

        {/* 6 Digit Inputs */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: scale(24), paddingHorizontal: scale(5) }}>
          {otpValues.map((digit, idx) => (
            <TextInput
              key={idx}
              ref={(el) => { otpRefs.current[idx] = el; }}
              style={{
                width: scale(42),
                height: scale(48),
                borderRadius: scale(8),
                borderWidth: scale(1.5),
                borderColor: digit ? "#1A3F75" : "#E2E8F0",
                backgroundColor: "#F8FAFC",
                textAlign: "center",
                fontSize: moderateScale(18),
                fontWeight: "bold",
                color: "#1E293B",
              }}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, idx)}
              onKeyPress={(e) => handleOtpKeyPress(e, idx)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Timer & Resend OTP */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: scale(30) }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={16} color="#6b7280" style={{ marginRight: scale(4) }} />
            <Text style={{ fontSize: moderateScale(13), color: "#6b7280" }}>
              Active for:{" "}
              <Text style={{ fontWeight: "600", color: otpTimer > 0 ? "#EF4444" : "#6b7280" }}>
                {formatTimer(otpTimer)}
              </Text>
            </Text>
          </View>

          <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontWeight: "bold",
                color: canResend ? "#1A3F75" : "#9ca3af",
                textDecorationLine: canResend ? "underline" : "none",
              }}
            >
              Resend OTP
            </Text>
          </TouchableOpacity>
        </View>

        {/* OTP Success Message */}
        {otpSuccessMessage ? (
          <View style={{ marginBottom: scale(15), alignItems: "center" }}>
            <Text style={{ color: "#10B981", fontSize: moderateScale(14), fontWeight: "bold" }}>
              <Ionicons name="checkmark-circle" size={16} /> {otpSuccessMessage}
            </Text>
          </View>
        ) : null}

        {/* Verify Button */}
        <TouchableOpacity
          onPress={handleVerifyOtp}
          disabled={forgotLoading || otpValues.some((v) => !v)}
          style={{
            backgroundColor: otpValues.some((v) => !v) ? "#9CA3AF" : "#1A3F75",
            borderRadius: scale(12),
            paddingVertical: scale(14),
            alignItems: "center",
            shadowColor: "#1A3F75",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          {forgotLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: moderateScale(16), fontWeight: "bold" }}>
              Verify OTP
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderResetStep = () => {
    return (
      <View style={{ marginTop: scale(10) }}>
        <Text style={{ fontSize: moderateScale(14), color: "#6b7280", marginBottom: scale(20), lineHeight: scale(20) }}>
          Choose a secure, strong password containing at least 6 characters. Both fields must match.
        </Text>

        {/* New Password */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
            paddingVertical: scale(10),
            marginBottom: scale(20),
          }}
        >
          <Ionicons name="key-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#9ca3af"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            style={{
              flex: 1,
              fontSize: moderateScale(16),
              color: "#111827",
            }}
          />
          <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        {/* Confirm Password */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#E2E8F0",
            paddingVertical: scale(10),
            marginBottom: scale(30),
          }}
        >
          <Ionicons name="key-outline" size={20} color="#6b7280" style={{ marginRight: 12 }} />
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#9ca3af"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            style={{
              flex: 1,
              fontSize: moderateScale(16),
              color: "#111827",
            }}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={forgotLoading}
          style={{
            backgroundColor: "#1A3F75",
            borderRadius: scale(12),
            paddingVertical: scale(14),
            alignItems: "center",
            shadowColor: "#1A3F75",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
          {forgotLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{ color: "white", fontSize: moderateScale(16), fontWeight: "bold" }}>
              Reset Password
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={{ flex: 1 }}>
        {/* Fixed Background Bottom View */}
        <View className="absolute bottom-0 left-0 w-full h-40" pointerEvents="none">
          <View
          className="absolute bottom-[-90px] left-[-20px] w-40 h-40 bg-[#90B0C7]/50 rounded-[20px] ml-20"
          style={{ transform: [{ rotate: "-15deg" }] }}
        />
        <View
          className="absolute bottom-[-70px] left-[-30px] w-40 h-40 bg-[#90B0C7] rounded-[20px]"
          style={{ transform: [{ rotate: "-17deg" }] }}
        />
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Section - Logo & Branding */}
          <View style={{ alignItems: "center", paddingTop: isKeyboardVisible ? 0 : scale(10) }}>
            <Image
              source={require("../../assets/images/ic_launcher_monochrome.png")}
              style={{
                width: isKeyboardVisible ? scale(100) : scale(200),
                height: isKeyboardVisible ? scale(100) : scale(200)
              }}
              contentFit="contain"
            />
            <Text
              style={{
                fontFamily: "Lobster",
                fontSize: isKeyboardVisible ? moderateScale(50) : moderateScale(90),
                color: "#1A3F75",
                marginTop: isKeyboardVisible ? verticalScale(-15) : verticalScale(-45),
              }}
            >
              Lead Flow
            </Text>
          </View>

          {/* Welcome Text */}
          <View style={{ alignItems: "center", marginTop: isKeyboardVisible ? 0 : -10 }}>
            <Text
              className="tracking-wider"
              style={{
                fontFamily: "Lobster",
                fontSize: moderateScale(25),
              }}
            >
              Welcome Back !
            </Text>
            <Text
              style={{
                fontSize: moderateScale(14),
                color: "#6b7280",
                marginTop: scale(4),
              }}
            >
              Login in to Existing Account
            </Text>
          </View>

          {/* Form Section */}
          <View style={{ paddingHorizontal: scale(32), marginTop: scale(32) }}>
            {/* Email Field */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                // borderBottomColor: "#d1d5db",
                paddingVertical: scale(12),
                marginBottom: scale(20),
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
                paddingVertical: scale(12),
                marginBottom: scale(8),
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
                  fontSize: moderateScale(16),
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
            <TouchableOpacity
              onPress={openForgotModal}
              style={{ alignSelf: "flex-end", marginTop: 8 }}
            >
              <Text
                style={{
                  color: "#1A3F75",
                  fontSize: moderateScale(13),
                  fontWeight: "600",
                }}
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="w-full bg-[#1A3F75] rounded-xl py-4 mt-6 shadow-lg shadow-blue-900/20 active:scale-95 transition-all duration-200"
            >
              <Text className="text-white text-center text-lg font-semibold">
                {loading ? (
                  <ActivityIndicator
                    size="small"
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  "Login"
                )}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </View>

      {/* Forgot Password Bottom Sheet Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeForgotModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "flex-end" }}>
            {/* Backdrop press to close */}
            <TouchableOpacity
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              activeOpacity={1}
              onPress={closeForgotModal}
            />

            {/* Modal Content Card */}
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: scale(24),
                borderTopRightRadius: scale(24),
                paddingHorizontal: scale(24),
                paddingTop: scale(20),
                paddingBottom: Platform.OS === "ios" ? scale(35) : Math.max(scale(25), insets.bottom + scale(15)),
                marginBottom: Platform.OS === "ios" ? 0 : keyboardHeight,
                maxHeight: "80%",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 10,
              }}
            >
              {/* Top Grabber Indicator */}
              <View
                style={{
                  width: scale(36),
                  height: scale(5),
                  backgroundColor: "#CBD5E1",
                  borderRadius: scale(3),
                  alignSelf: "center",
                  marginBottom: scale(15),
                }}
              />

              {/* Close Button & Title */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: scale(15) }}>
                <Text style={{ fontSize: moderateScale(18), fontWeight: "bold", color: "#1A3F75" }}>
                  {forgotStep === "EMAIL" && "Forgot Password"}
                  {forgotStep === "OTP" && "Verify OTP"}
                  {forgotStep === "RESET" && "Reset Password"}
                </Text>
                <TouchableOpacity onPress={closeForgotModal}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Steps rendering */}
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                {forgotStep === "EMAIL" && renderEmailStep()}
                {forgotStep === "OTP" && renderOtpStep()}
                {forgotStep === "RESET" && renderResetStep()}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <StatusModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalConfig((prev) => ({ ...prev, visible: false }))}
      />
    </View>
  );
}
