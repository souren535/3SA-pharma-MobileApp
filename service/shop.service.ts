import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const shopService = {
  getShops: async () => {
    const { data } = await API.get("/shops");
    return data;
  },

  createShop: async (shopData: FormData) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const baseURL = API.defaults.baseURL || process.env.EXPO_PUBLIC_BASE_URL;
      
      const response = await fetch(`${baseURL}/shops`, {
        method: "POST",
        body: shopData,
        headers: {
          "Accept": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw { response: { data } };
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  validateGST: async (gstNumber: string) => {
    const { data } = await API.get(`/validate-gst/${gstNumber}`);
    return data;
  },
};
