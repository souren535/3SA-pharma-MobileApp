import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await API.post("/auth/login", {
      email,
      password,
    });
    await AsyncStorage.setItem("token", data.access_token);
    return data;
  },
  register: async (data: any) => {
    const res = await API.post("/auth/register", data);
    return res.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem("token");
  },
  getProfile: async () => {
    const { data } = await API.get("/auth/profile");
    return data;
  },
};
