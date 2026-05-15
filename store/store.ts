import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authService } from "../service/auth.service";
import API from "../utils/api";

interface AuthStore {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: any | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user: any | null) => set({ user, isAuthenticated: !!user }),
  setToken: (token: string | null) => set({ token }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  reset: () => set({ user: null, token: null, isLoading: false, isAuthenticated: false }),
  login: async (email, password) => {
    const data = await authService.login(email, password);
    await AsyncStorage.setItem("token", data.access_token);
    if (data.refresh_token) {
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
    }
    set({ token: data.access_token });
    try {
      const profile = await authService.getProfile();
      set({ user: profile, isAuthenticated: true });
    } catch {
      set({ user: { email }, isAuthenticated: true });
    }
  },
  logout: async () => {
    await authService.logout();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("refresh_token");
    get().reset();
  },
  checkAuth: async () => {
    set({ isLoading: true });
    const token = await AsyncStorage.getItem("token");
    if (token) {
      set({ token });
      try {
        const profile = await authService.getProfile();
        set({ user: profile, isAuthenticated: true });
      } catch {
        get().reset();
      }
    }
    set({ isLoading: false });
  }
}));

export interface Route {
  id: number;
  name: string;
  status: number;
  areas: Area[];
}

export interface Area {
  id: number;
  route_id: number;
  name: string;
}

interface RouteStore {
  routes: Route[];
  fetchRoutes: () => Promise<void>;
}

export const useRouteStore = create<RouteStore>((set) => ({
  routes: [],
  fetchRoutes: async () => {
    try {
      const response = await API.get('/location/assigned-routes');
      set({ routes: response.data });
    } catch (error) {
      console.log('Error fetching assigned routes:', error);
    }
  }
}));

import { shopService } from "../service/shop.service";

export interface Shop {
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
  fssai_license: string | null;
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

interface ShopStore {
  shops: Shop[];
  isLoading: boolean;
  fetchShops: () => Promise<void>;
  createShop: (shopData: FormData) => Promise<any>;
  validateGST: (gstNumber: string) => Promise<any>;
}

export const useShopStore = create<ShopStore>((set, get) => ({
  shops: [],
  isLoading: false,
  fetchShops: async () => {
    set({ isLoading: true });
    try {
      const data = await shopService.getShops();
      set({ shops: data });
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  createShop: async (shopData: FormData) => {
    const response = await shopService.createShop(shopData);
    // Refresh shop list in background — don't let a list-fetch failure
    // surface as a store-creation failure to the user
    try { await get().fetchShops(); } catch {}
    return response;
  },
  validateGST: async (gstNumber: string) => {
    try {
      return await shopService.validateGST(gstNumber);
    } catch (error) {
      console.error("GST Validation error:", error);
      throw error;
    }
  }
}));

// ─── Image Base URL ──────────────────────────────────
export const IMAGE_BASE_URL = "https://pharma.3sawebx.com";

// ─── Store Detail Store ──────────────────────────────
interface StoreDetailStore {
  shopDetail: Shop | null;
  isLoading: boolean;
  fetchShopDetail: (shopId: number | string) => Promise<void>;
}

export const useStoreDetailStore = create<StoreDetailStore>((set) => ({
  shopDetail: null,
  isLoading: false,
  fetchShopDetail: async (shopId) => {
    set({ isLoading: true });
    try {
      const response = await API.get(`/shops/${shopId}`);
      set({ shopDetail: response.data });
    } catch (error) {
      console.error("Failed to fetch shop detail:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// ─── Order Store ─────────────────────────────────────
export interface Order {
  id: number;
  shop_id: number;
  order_no: string;
  total_amount: string | number;
  status: string;
  billing_date: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface OrderStore {
  allOrders: Order[];
  shopOrders: Order[];
  isLoading: boolean;
  fetchAllOrders: () => Promise<void>;
  fetchShopOrders: (shopId: number | string) => Promise<void>;
  createOrder: (payload: {
    shop_id: number | string;
    items: Array<{ product_id: number; quantity: number }>;
    notes?: string;
  }) => Promise<any>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  allOrders: [],
  shopOrders: [],
  isLoading: false,
  fetchAllOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/orders');
      const data = response.data.data || response.data;
      set({ allOrders: Array.isArray(data) ? data : (data.data || []) });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchShopOrders: async (shopId) => {
    set({ isLoading: true });
    try {
      const response = await API.get(`/orders/shop-orders/${shopId}`);
      const data = response.data.data || response.data;
      set({ shopOrders: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch shop orders:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  createOrder: async (payload) => {
    set({ isLoading: true });
    try {
      const response = await API.post('/orders', payload);
      await get().fetchAllOrders();
      return response.data;
    } finally {
      set({ isLoading: false });
    }
  }
}));

interface ProductStore {
  products: any[];
  categories: any[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  categories: [],
  isLoading: false,
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/products');
      const data = response.data.data || response.data;
      set({ products: Array.isArray(data) ? data : (data.data || []) });
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/categories');
      set({ categories: response.data || [] });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ─── Ledger / Transaction Store ──────────────────────
export interface LedgerSummary {
  total_orders_value: number;
  total_received: number;
  outstanding_due: number;
}

export interface LedgerEntry {
  id: string | number;
  type: string;
  amount: string | number;
  description: string;
  balance: string | number;
  date: string;
  payment_mode?: string;
  reference_no?: string;
  [key: string]: any;
}

interface LedgerStore {
  ledger: LedgerEntry[];
  summary: LedgerSummary | null;
  isLoading: boolean;
  isSubmitting: boolean;
  fetchLedger: (shopId: number | string) => Promise<void>;
  collectPayment: (shopId: number | string, payload: {
    amount: number;
    payment_mode: string;
    reference_no: string;
    payment_date: string;
  }) => Promise<any>;
}

export const useLedgerStore = create<LedgerStore>((set, get) => ({
  ledger: [],
  summary: null,
  isLoading: false,
  isSubmitting: false,
  fetchLedger: async (shopId) => {
    set({ isLoading: true });
    try {
      const response = await API.get(`/orders/shop/${shopId}/ledger`);

      const responseData = response.data.data ? response.data.data : response.data;

      // The API returns a flat array of transactions
      const transactions = responseData.transactions || [];

      const formattedLedger: LedgerEntry[] = transactions.map((t: any) => ({
        id: `${t.type}_${t.id}`, // Ensure unique ID
        type: t.type === 'invoice' ? 'Order' : 'Payment', // Map to UI expected types
        amount: t.amount,
        description: t.description || (t.type === 'invoice' ? `Order ${t.reference}` : 'Payment'),
        balance: t.status || '-', // API doesn't provide running balance, use status instead
        date: t.date || t.timestamp,
        reference_no: t.reference
      }));

      // Ensure they are sorted by date descending (though API likely does this)
      formattedLedger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      set({
        ledger: formattedLedger,
        summary: responseData.summary || null
      });
    } catch (error) {
      console.error("Failed to fetch ledger:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  collectPayment: async (shopId, payload) => {
    set({ isSubmitting: true });
    try {
      const response = await API.post(`/orders/collect-shop-payment/${shopId}`, payload);
      // Refresh ledger after payment
      await get().fetchLedger(shopId);
      return response.data;
    } finally {
      set({ isSubmitting: false });
    }
  }
}));

// ─── Attendance Store ────────────────────────────────
interface AttendanceStore {
  isWorking: boolean;
  setIsWorking: (value: boolean) => Promise<void>;
  loadAttendanceState: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  isWorking: false,
  setIsWorking: async (value: boolean) => {
    set({ isWorking: value });
    await AsyncStorage.setItem('isWorking', value ? 'true' : 'false');
  },
  loadAttendanceState: async () => {
    const val = await AsyncStorage.getItem('isWorking');
    set({ isWorking: val === 'true' });
  },
}));

// ─── Payment Store ───────────────────────────────────
export interface PaymentHistoryItem {
  id: number;
  order_id: number;
  user_id: number;
  amount: string;
  payment_mode: string;
  reference_no: string | null;
  payment_date: string;
  created_at: string;
  order?: {
    id: number;
    order_no: string;
    total_amount: string;
    shop?: {
      shop_name: string;
    };
  };
}

interface PaymentStore {
  paymentsHistory: PaymentHistoryItem[];
  isLoading: boolean;
  fetchPaymentsHistory: () => Promise<void>;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  paymentsHistory: [],
  isLoading: false,
  fetchPaymentsHistory: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/orders/payments/history');
      const data = response.data?.data || [];
      set({ paymentsHistory: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch payments history:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// ─── Dashboard Store ─────────────────────────────────
export interface DashboardStats {
  today_sales: number;
  today_collection: number;
  today_visits: number;
  monthly_sales: number;
}

export interface ActiveStatus {
  is_active: boolean;
  check_in_time: string | null;
}

interface DashboardStore {
  stats: DashboardStats | null;
  unvisitedStores: any[];
  activeStatus: ActiveStatus | null;
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  unvisitedStores: [],
  activeStatus: null,
  isLoading: false,
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [statsRes, unvisitedRes, activeRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/unvisited-stores'),
        API.get('/dashboard/active-status')
      ]);

      set({
        stats: statsRes.data,
        unvisitedStores: unvisitedRes.data,
        activeStatus: activeRes.data
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// ─── Visit Store ─────────────────────────────────────
export interface VisitItem {
  id: number;
  user_id: number;
  shop_id: number;
  visit_type: string;
  notes: string;
  latitude: string;
  longitude: string;
  created_at: string;
  shop?: {
    id: number;
    shop_name: string;
    owner_name: string;
    contact: string;
    address: string;
  };
}

interface VisitStore {
  visits: VisitItem[];
  isLoading: boolean;
  fetchVisits: () => Promise<void>;
}

export const useVisitStore = create<VisitStore>((set) => ({
  visits: [],
  isLoading: false,
  fetchVisits: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/orders/visits');
      const data = response.data?.data || [];
      set({ visits: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch visits:", error);
    } finally {
      set({ isLoading: false });
    }
  }
}));

// ─── Notification Store ──────────────────────────────
export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  image: string | null;
  target_type: string;
  user_id: number | null;
  created_by: number;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  isLoading: false,
  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/notifications');
      const data = response.data?.data || response.data || [];
      set({ notifications: Array.isArray(data) ? data : [] });
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  markAsRead: async (id: number) => {
    try {
      await API.post(`/notifications/${id}/read`);
      // Update locally
      const current = get().notifications;
      set({
        notifications: current.map(n => n.id === id ? { ...n, is_read: true } : n)
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }
}));
