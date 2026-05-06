import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { MaterialIcons } from "@expo/vector-icons";

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  // Set Android navigation bar to black
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000000");
      NavigationBar.setButtonStyleAsync("light");
    }
  }, []);

  const TabBarIcon = ({
    focused,
    name,
    label,
  }: {
    focused: boolean;
    name: keyof typeof MaterialIcons.glyphMap;
    label: string;
  }) => {
    if (focused) {
      return (
        <View className="flex-row items-center justify-center bg-[#1A3F75] w-32 h-14 rounded-full">
          <MaterialIcons name={name} size={20} color="#fff" />
          {label && (
            <Text className="text-white text-sm font-bold ml-2">{label}</Text>
          )}
        </View>
      );
    }
    return (
      <View className="flex-row items-center justify-center">
        <MaterialIcons name={name} size={25} color="#848282" />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: "#94A3B8",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          left: 20,
          right: 20,
          bottom: 15,
          height: 64,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="home" label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="stores"
        options={{
          title: "Stores",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="store" label="Stores" />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="list-alt" label="Orders" />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="menu" label="Menu" />
          ),
        }}
      />
    </Tabs>
  );
}
