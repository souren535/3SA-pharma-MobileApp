import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await API.post("/auth/login", {
      email,
      password,
    });
    await AsyncStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
    }
    return data;
  },
  register: async (data: any) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  },
  logout: async () => {
    await API.post("/auth/logout");
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");
  },
  getProfile: async () => {
    const response = await API.get("/salesman/profile");
    const data = response.data;
    // Safely unwrap if the backend wraps the profile in a 'profile', 'user' or 'data' key
    return data?.profile || data?.user || data?.data || data;
  },
  forgotPassword: async (email: string) => {
    const { data } = await API.post("/password/send-otp", { email });
    return data;
  },
  resetPassword: async (email: string, otp: string, password: string) => {
    const { data } = await API.post("/password/verify-and-reset", {
      email,
      otp,
      password,
      password_confirmation: password,
    });
    return data;
  },
  updateProfileImage: async (formData: FormData) => {
    const { data } = await API.post("/salesman/profile/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data?.profile || data?.user || data?.data || data;
  },
};


