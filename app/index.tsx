import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";


const Index = () => {
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    };
    checkAuth();
  }, [router]);

  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#1A3F75" />
    </View>
  );
};

export default Index;
