import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

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
        console.log("Substituting token with stored refresh_token directly...");
        if (refreshToken) {
          await AsyncStorage.setItem("token", refreshToken);
          originalRequest.headers.Authorization = `Bearer ${refreshToken}`;
          processQueue(null, refreshToken);
          return await API(originalRequest);
        } else {
          throw new Error("No refresh token stored");
        }
      } catch (refreshError) {
        console.log("Token substitution failed, clearing session");
        processQueue(refreshError, null);
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("refresh_token");
        await AsyncStorage.removeItem("isWorking");
        await AsyncStorage.removeItem("checkInDate");
        await AsyncStorage.removeItem("attendanceLogoutDate");
        // Navigate to login
        try { router.replace("/(auth)"); } catch {}
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default API;
