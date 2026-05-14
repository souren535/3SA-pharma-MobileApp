import API from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const shopService = {
  getShops: async () => {
    const { data } = await API.get("/shops");
    return data;
  },

  createShop: async (shopData: FormData) => {
    const token = await AsyncStorage.getItem("token");
    const baseURL =
      (API.defaults.baseURL as string | undefined) ??
      (process.env.EXPO_PUBLIC_BASE_URL as string | undefined);

    if (!baseURL) {
      throw new Error('API base URL is not configured.');
    }

    // Debug: log what we're sending
    console.log('=== SUBMITTING STORE ===');
    console.log('URL:', `${baseURL}/shops`);
    // @ts-ignore - FormData._parts is React Native internal
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

    let response: Response;
    try {
      response = await fetch(`${baseURL}/shops`, {
        method: 'POST',
        body: shopData,
        headers: {
          // Do NOT set Content-Type — fetch auto-sets multipart/form-data with boundary
          Accept: 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
    } catch (networkError: any) {
      console.error('Network error during shop creation:', networkError);
      throw new Error(
        networkError?.message === 'Network request failed'
          ? 'Network error. Please check your internet connection and try again.'
          : (networkError?.message || 'Failed to connect to server.')
      );
    }

    let data: any;
    try {
      const text = await response.text();
      console.log('Server response status:', response.status);
      console.log('Server response body:', text.substring(0, 500));
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server error (${response.status}). Please try again later.`);
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return data;
  },

  validateGST: async (gstNumber: string) => {
    const { data } = await API.get(`/validate-gst/${gstNumber}`);
    return data;
  },
};
