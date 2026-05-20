import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const shopService = {
  getShops: async () => {
    const { data } = await API.get("/shops");
    return data;
  },

  createShop: async (shopData: FormData) => {
    // Debug: log what we're sending
    console.log('=== SUBMITTING STORE ===');
    // @ts-ignore
    if (shopData._parts) {
      // @ts-ignore
      shopData._parts.forEach(([key, val]: any) => {
        if (typeof val === 'object' && val?.uri) {
          console.log(`  ${key}: FILE -> uri=${val.uri}, name=${val.name}, type=${val.type}`);
        } else {
          console.log(`  ${key}: ${val}`);
        }
      });
    }

    try {
      const { data } = await API.post('/shops', shopData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60s timeout for multi-image uploads
      });
      return data;
    } catch (error: any) {
      console.error('Network error during shop creation:', error);
      
      // Extract the most useful error message
      if (error?.response?.data) {
        const serverMsg =
          error.response.data.message ||
          error.response.data.error ||
          JSON.stringify(error.response.data);
        throw new Error(serverMsg);
      }
      
      if (error?.message === 'Network Error' || error?.message?.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error(error?.message || 'Failed to connect to server.');
    }
  },

  validateGST: async (gstNumber: string) => {
    const { data } = await API.get(`/validate-gst/${gstNumber}`);
    return data;
  },
};
