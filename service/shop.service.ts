import API from "../utils/api";

export const shopService = {
  getShops: async () => {
    const { data } = await API.get("/shops");
    return data;
  },

  createShop: async (shopData: FormData) => {
    const { data } = await API.post("/shops", shopData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data, headers) => {
        return data; // Do not transform FormData
      },
    });
    return data;
  },

  validateGST: async (gstNumber: string) => {
    const { data } = await API.get(`/validate-gst/${gstNumber}`);
    return data;
  },
};
