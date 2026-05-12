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
        const token = await AsyncStorage.getItem("token");
        console.log("Attempting token refresh...");
        const refreshResponse = await axios.post(
          `${process.env.EXPO_PUBLIC_BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newToken = refreshResponse.data?.refresh_token;
        if (newToken) {
          console.log("Token refreshed successfully");
          await AsyncStorage.setItem("token", newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return API(originalRequest);
        }
      } catch (refreshError) {
        console.log("Token refresh failed, clearing session");
        processQueue(refreshError, null);
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("isWorking");
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
