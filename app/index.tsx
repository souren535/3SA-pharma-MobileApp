import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

const ONBOARDING_KEY = '@onboarding_completed';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkInitialRoute = async () => {
      try {
        // Check if onboarding has been completed
        const onboardingCompleted = await AsyncStorage.getItem(ONBOARDING_KEY);

        if (!onboardingCompleted) {
          // First time install or cache cleared — show onboarding
          router.replace("/onboarding");
          return;
        }

        // Onboarding done — check auth
        const token = await AsyncStorage.getItem("token");
        if (token) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)");
        }
      } catch (error) {
        console.warn("Error checking initial route:", error);
        router.replace("/(auth)");
      }
    };

    checkInitialRoute();
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: '#1A3F75' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
};

export default Index;
