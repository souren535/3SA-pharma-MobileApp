import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Alert } from "react-native";

const API = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not intercept authentication, registration, or password reset requests
      const isAuthRequest =
        originalRequest.url?.includes("/auth/login") ||
        originalRequest.url?.includes("/auth/register") ||
        originalRequest.url?.includes("/password/");

      if (isAuthRequest) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        if (refreshToken) {
          console.log("Refreshing access token using refresh_token...");
          const response = await axios.post(
            `${process.env.EXPO_PUBLIC_BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" }, timeout: 15000 }
          );

          const newAccessToken = response.data?.access_token || response.data?.data?.access_token;
          const newRefreshToken = response.data?.refresh_token || response.data?.data?.refresh_token;

          if (newAccessToken) {
            console.log("Token refresh succeeded!");
            await AsyncStorage.setItem("token", newAccessToken);
            if (newRefreshToken) {
              await AsyncStorage.setItem("refresh_token", newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return await API(originalRequest);
          } else {
            throw new Error("Invalid token refresh response structure");
          }
        } else {
          throw new Error("No refresh token stored");
        }
      } catch (refreshError) {
        console.log("Token refresh failed, clearing session:", refreshError);
        processQueue(refreshError, null);

        const clearSessionAndRedirect = async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("refresh_token");
          await AsyncStorage.removeItem("isWorking");
          await AsyncStorage.removeItem("checkInDate");
          await AsyncStorage.removeItem("attendanceLogoutDate");
          try { router.replace("/(auth)"); } catch {}
        };

        await clearSessionAndRedirect();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
