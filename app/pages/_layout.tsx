import { Stack } from "expo-router";

export default function PagesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="storeInfo" />
      <Stack.Screen name="orderCreate" />
      <Stack.Screen name="orderDetails" />
      <Stack.Screen name="paymentDetails" />
      <Stack.Screen name="support" />
      <Stack.Screen name="notifucation" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="assignedRoutes" />
    </Stack>
  );
}
