import React, { createContext, useContext, useState, useCallback } from "react";
import { shopService } from "../service/shop.service";

interface Shop {
  id: number;
  salesman_id: number;
  route_id: number;
  area_id: number | null;
  shop_name: string;
  owner_name: string;
  contact: string;
  email: string;
  address: string;
  shop_type: string;
  category: string;
  license_no: string | null;
  latitude: string;
  longitude: string;
  fassai_license: string | null;
  gst_number: string | null;
  pan_number: string | null;
  created_at: string;
  updated_at: string;
  images: {
    id: number;
    shop_id: number;
    image_url: string;
    created_at: string;
    updated_at: string;
  }[];
  route: {
    id: number;
    name: string;
    status: number;
    created_at: string;
    updated_at: string;
  };
  area: {
    id: number;
    route_id: number;
    name: string;
    created_at: string;
    updated_at: string;
  } | null;
}

interface ShopContextType {
  shops: Shop[];
  isLoading: boolean;
  fetchShops: () => Promise<void>;
  createShop: (shopData: FormData) => Promise<any>;
  validateGST: (gstNumber: string) => Promise<any>;
}

const ShopContext = createContext<ShopContextType>({} as ShopContextType);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShops = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await shopService.getShops();
      setShops(data);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createShop = async (shopData: FormData) => {
    setIsLoading(true);
    try {
      const response = await shopService.createShop(shopData);
      await fetchShops(); // Refresh the list
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const validateGST = async (gstNumber: string) => {
    try {
      return await shopService.validateGST(gstNumber);
    } catch (error) {
      console.error("GST Validation error:", error);
      throw error;
    }
  };

  return (
    <ShopContext.Provider value={{ shops, isLoading, fetchShops, createShop, validateGST }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShops = () => useContext(ShopContext);
