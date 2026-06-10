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
    // Clear any leftover attendance state from a previous user/session
    await AsyncStorage.removeItem("isWorking");
    await AsyncStorage.removeItem("checkInDate");
    await AsyncStorage.removeItem("attendanceLogoutDate");
    useAttendanceStore.setState({ isWorking: false, attendanceLoggedOutToday: false });

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
    // Clear attendance state so new salesman starts fresh
    await AsyncStorage.removeItem("isWorking");
    await AsyncStorage.removeItem("checkInDate");
    await AsyncStorage.removeItem("attendanceLogoutDate");
    useAttendanceStore.setState({ isWorking: false, attendanceLoggedOutToday: false });
    get().reset();
  },
  checkAuth: async () => {
    set({ isLoading: true });
    const token = await AsyncStorage.getItem("token");
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (token || refreshToken) {
      if (token) {
        set({ token });
      }
      try {
        const response = await API.get("/auth/me");
        const profile = response.data?.profile || response.data?.user || response.data?.data || response.data;
        set({ user: profile, isAuthenticated: true });
      } catch (error) {
        console.log("checkAuth with /auth/me failed:", error);
        get().reset();
      }
    } else {
      set({ isAuthenticated: false });
    }
    set({ isLoading: false });
  }
}));

export interface Route {
  id: number;
  name: string;
  status: number;
  areas: Area[];
  is_chosen_by_me?: boolean;
  is_active_today?: boolean;
  active_salesman_today?: string | null;
}

export interface Area {
  id: number;
  route_id: number;
  name: string;
}

// Helper: get today's date as YYYY-MM-DD in IST
const getTodayIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

interface RouteStore {
  routes: Route[];
  allRoutes: Route[];
  selectedRouteId: number | null;
  routeLockedDate: string | null; // YYYY-MM-DD when the route was last submitted
  isLockedToday: boolean;
  noActiveRouteMessage: string | null;
  fetchRoutes: () => Promise<void>;
  fetchAllRoutes: () => Promise<void>;
  selectRoute: (routeId: number) => Promise<any>;
  loadRouteState: () => Promise<void>;
}

export const useRouteStore = create<RouteStore>((set, get) => ({
  routes: [],
  allRoutes: [],
  selectedRouteId: null,
  routeLockedDate: null,
  isLockedToday: false,
  noActiveRouteMessage: null,
  loadRouteState: async () => {
    try {
      const savedId = await AsyncStorage.getItem('selectedRouteId');
      const savedDate = await AsyncStorage.getItem('routeLockedDate');
      const today = getTodayIST();
      set({
        selectedRouteId: savedId ? parseInt(savedId) : null,
        routeLockedDate: savedDate,
        isLockedToday: savedDate === today,
      });
    } catch (e) {
      console.log('Error loading route state:', e);
    }
  },
  fetchRoutes: async () => {
    try {
      const response = await API.get('/location/assigned-routes');
      if (response.data && response.data.status === 'no_active_route') {
        set({
          routes: [],
          noActiveRouteMessage: response.data.message || "Please select a route for today's operations first.",
          selectedRouteId: null,
          isLockedToday: false,
        });
        await AsyncStorage.removeItem('selectedRouteId');
        await AsyncStorage.removeItem('routeLockedDate');
      } else {
        const routesData = Array.isArray(response.data) ? response.data : [];
        set({
          routes: routesData,
          noActiveRouteMessage: null,
        });
        // Check if any route in the list is already chosen/active
        const chosenRoute = routesData.find((r: any) => r.is_chosen_by_me === true || r.is_chosen_by_me === 1);
        if (chosenRoute) {
          const today = getTodayIST();
          set({
            selectedRouteId: chosenRoute.id,
            isLockedToday: true,
            routeLockedDate: today,
          });
          await AsyncStorage.setItem('selectedRouteId', String(chosenRoute.id));
          await AsyncStorage.setItem('routeLockedDate', today);
        } else {
          const currentSelected = get().selectedRouteId;
          if (!currentSelected && routesData.length > 0) {
            set({ selectedRouteId: routesData[0].id });
          }
        }
      }
    } catch (error) {
      console.log('Error fetching assigned routes:', error);
      set({ routes: [], noActiveRouteMessage: null });
    }
  },
  fetchAllRoutes: async () => {
    try {
      const response = await API.get('/location/assigned-routes?all=true');
      const allRoutes = response.data || [];
      set({ allRoutes });

      // Sync choice and lock state from the backend
      const chosenRoute = allRoutes.find((r: any) => r.is_chosen_by_me === true || r.is_chosen_by_me === 1);
      if (chosenRoute) {
        const today = getTodayIST();
        set({
          selectedRouteId: chosenRoute.id,
          isLockedToday: true,
          routeLockedDate: today,
        });
        await AsyncStorage.setItem('selectedRouteId', String(chosenRoute.id));
        await AsyncStorage.setItem('routeLockedDate', today);
      }
    } catch (error) {
      console.log('Error fetching all routes:', error);
    }
  },
  selectRoute: async (routeId: number) => {
    // Call the real API
    const response = await API.post('/location/select-route', { route_id: routeId });

    const today = getTodayIST();
    set({ selectedRouteId: routeId, routeLockedDate: today, isLockedToday: true });
    await AsyncStorage.setItem('selectedRouteId', String(routeId));
    await AsyncStorage.setItem('routeLockedDate', today);
    return response.data;
  },
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
    set({ isLoading: true, shopDetail: null });
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
  createOrder: (payload: any) => Promise<any>;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  allOrders: [],
  shopOrders: [],
  isLoading: false,
  fetchAllOrders: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get(`/orders?_t=${Date.now()}`);
      const data = response.data.data || response.data;
      const fetchedOrders = Array.isArray(data) ? data : (data.data || []);

      // Merge with existing to prevent wiping out newly created orders
      const currentOrders = get().allOrders;
      const mergedOrders = [...fetchedOrders];

      currentOrders.forEach(localOrder => {
        if (!mergedOrders.some(o => o.id === localOrder.id)) {
          mergedOrders.push(localOrder);
        }
      });

      set({ allOrders: mergedOrders });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchShopOrders: async (shopId) => {
    // Retain only local orders specifically meant for this shop, effectively clearing old shops' data immediately
    set({ isLoading: true, shopOrders: get().shopOrders.filter(o => o.shop_id == shopId) });
    try {
      const response = await API.get(`/orders/shop-orders/${shopId}?_t=${Date.now()}`);
      const data = response.data.data || response.data;
      const fetchedOrders = Array.isArray(data) ? data : [];

      const currentOrders = get().shopOrders;
      const mergedOrders = [...fetchedOrders];

      currentOrders.forEach(localOrder => {
        // Only merge if the local order belongs to the shop we are currently fetching
        if (localOrder.shop_id == shopId && !mergedOrders.some(o => o.id === localOrder.id)) {
          mergedOrders.push(localOrder);
        }
      });

      set({ shopOrders: mergedOrders });
    } catch (error) {
      console.error("Failed to fetch shop orders:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  createOrder: async (payload) => {
    set({ isLoading: true });
    try {
      let headers = {};
      if (payload instanceof FormData) {
        headers = { "Content-Type": "multipart/form-data" };
      }
      const response = await API.post('/orders', payload, { headers });

      // Attempt to immediately inject the new order into the local list
      const newOrder = response.data?.order || response.data?.data || response.data;
      if (newOrder && newOrder.id) {
        const currentOrders = get().allOrders;
        // Prepend only if it doesn't already exist
        if (!currentOrders.some(o => o.id === newOrder.id)) {
          set({ allOrders: [newOrder, ...currentOrders] });
        }

        // Also inject into shopOrders if it matches the current shop
        const currentShopOrders = get().shopOrders;
        if (!currentShopOrders.some(o => o.id === newOrder.id)) {
          set({ shopOrders: [newOrder, ...currentShopOrders] });
        }
      }

      await get().fetchAllOrders();
      // Wait, shop_id could be in FormData, extract it
      let shopId = null;
      if (payload instanceof FormData) {
        const anyPayload = payload as any;
        const parts = anyPayload.getParts?.();
        if (parts) {
          const shopPart = parts.find((p: any) => p.fieldName === 'shop_id');
          if (shopPart) shopId = shopPart.string;
        }
      } else {
        shopId = payload.shop_id;
      }
      if (shopId) {
        await get().fetchShopOrders(shopId);
      }
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
    set({ isLoading: true, ledger: [], summary: null });
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
        reference_no: t.reference_no || t.reference,
        payment_mode: t.payment_mode,
        raw: t
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
  attendanceLoggedOutToday: boolean;
  setIsWorking: (value: boolean) => Promise<void>;
  syncAttendanceState: (activeStatus: any) => Promise<void>;
  loadAttendanceState: () => Promise<void>;
}

export const useAttendanceStore = create<AttendanceStore>((set) => ({
  isWorking: false,
  attendanceLoggedOutToday: false,
  setIsWorking: async (value: boolean) => {
    set({ isWorking: value });
    await AsyncStorage.setItem('isWorking', value ? 'true' : 'false');
    if (value) {
      await AsyncStorage.setItem('checkInDate', new Date().toDateString());
      // Clear any previous logout date since user is now working
      await AsyncStorage.removeItem('attendanceLogoutDate');
      set({ attendanceLoggedOutToday: false });
    } else {
      await AsyncStorage.removeItem('checkInDate');
      // Record that user logged out today to prevent re-attendance
      await AsyncStorage.setItem('attendanceLogoutDate', new Date().toDateString());
      set({ attendanceLoggedOutToday: true });
    }
  },
  syncAttendanceState: async (activeStatus: any) => {
    // This is purely for auto-healing from the backend without triggering the manual lockout logic
    const isActive = activeStatus?.is_active ?? false;
    const hasCheckedOutToday = !!activeStatus?.check_out_time;

    set({ 
      isWorking: isActive,
      attendanceLoggedOutToday: hasCheckedOutToday && !isActive
    });

    await AsyncStorage.setItem('isWorking', isActive ? 'true' : 'false');
    if (isActive) {
      await AsyncStorage.setItem('checkInDate', new Date().toDateString());
      await AsyncStorage.removeItem('attendanceLogoutDate');
    } else {
      await AsyncStorage.removeItem('checkInDate');
      if (hasCheckedOutToday) {
        await AsyncStorage.setItem('attendanceLogoutDate', new Date().toDateString());
      } else {
        await AsyncStorage.removeItem('attendanceLogoutDate');
      }
    }
  },
  loadAttendanceState: async () => {
    const val = await AsyncStorage.getItem('isWorking');
    const checkInDate = await AsyncStorage.getItem('checkInDate');
    const logoutDate = await AsyncStorage.getItem('attendanceLogoutDate');

    // Calculate current time in IST (UTC + 5:30)
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + (5.5 * 60 * 60000));
    const todayIST = istDate.toDateString();

    // Check if user already logged out today (can't re-attend)
    const loggedOutToday = logoutDate === todayIST;

    if (val === 'true') {
      // const isPast8PM_IST = istDate.getHours() >= 20;
      const isPast8PM_IST = false; // Disabled 8 PM auto-logout for test mode
      const isDifferentDay = checkInDate && checkInDate !== todayIST;

      // Auto-logout if it's past 8 PM IST or it's a new day
      if (isPast8PM_IST || isDifferentDay) {
        set({ isWorking: false, attendanceLoggedOutToday: loggedOutToday });
        await AsyncStorage.setItem('isWorking', 'false');
        await AsyncStorage.removeItem('checkInDate');
        if (!loggedOutToday) {
          await AsyncStorage.setItem('attendanceLogoutDate', todayIST);
          set({ attendanceLoggedOutToday: true });
        }

        // Attempt backend logout to stay in sync
        try {
          // Verify if user is still logged in on the backend before calling logout
          const statusRes = await API.get('/dashboard/active-status');
          if (statusRes.data?.status === "LOGGED_IN") {
            const formData = new FormData();
            formData.append("last_shop_id", "1");
            formData.append("latitude", "0");
            formData.append("longitude", "0");
            await API.post("/attendance/logout", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          }
        } catch (e) {
          console.log("Auto-logout API failed:", e);
        }
        return;
      }
    }

    // If logout date is from a previous day, clear it
    if (logoutDate && logoutDate !== todayIST) {
      await AsyncStorage.removeItem('attendanceLogoutDate');
      set({ isWorking: val === 'true', attendanceLoggedOutToday: false });
    } else {
      set({ isWorking: val === 'true', attendanceLoggedOutToday: loggedOutToday });
    }
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
    paid_amount?: string;
    due_amount?: string;
    status?: string;
    payment_status?: string;
    shop?: {
      id?: number;
      shop_name: string;
      owner_name?: string;
      contact?: string;
      address?: string;
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
  today_created_stores?: number;
}

export interface ActiveStatus {
  is_active: boolean;
  status: string;
  check_in_time: string | null;
  check_out_time: string | null;
  attendance?: any;
}

interface DashboardStore {
  stats: DashboardStats | null;
  unvisitedStores: any[];
  completedUnvisitedStoreIds: number[];
  activeStatus: ActiveStatus | null;
  isLoading: boolean;
  fetchDashboardData: () => Promise<void>;
  markStoreAsVisitedLocally: (storeId: number) => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  unvisitedStores: [],
  completedUnvisitedStoreIds: [],
  activeStatus: null,
  isLoading: false,
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      // Load persisted completed IDs from AsyncStorage
      let completed: number[] = [];
      try {
        const stored = await AsyncStorage.getItem('completedUnvisitedStoreIds');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Check if stored data is from today; if not, clear it
          const storedDate = parsed.date;
          const todayStr = new Date().toDateString();
          if (storedDate === todayStr) {
            completed = parsed.ids || [];
          } else {
            // New day — clear the persisted list
            await AsyncStorage.removeItem('completedUnvisitedStoreIds');
          }
        }
      } catch (e) {
        console.log('Failed to load completed store IDs:', e);
      }

      // Also merge any IDs already in memory (in case markStoreAsVisitedLocally was called before fetch)
      const memoryIds = get().completedUnvisitedStoreIds;
      const mergedCompleted = [...new Set([...completed, ...memoryIds])];

      const [statsRes, unvisitedRes, activeRes] = await Promise.all([
        API.get('/dashboard/stats'),
        API.get('/dashboard/unvisited-stores'),
        API.get('/dashboard/active-status')
      ]);

      const filteredStores = (unvisitedRes.data || []).filter((s: any) => !mergedCompleted.includes(s.id));

      set({
        stats: statsRes.data,
        unvisitedStores: filteredStores,
        completedUnvisitedStoreIds: mergedCompleted,
        activeStatus: activeRes.data
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  markStoreAsVisitedLocally: (storeId: number) => {
    const newIds = [...get().completedUnvisitedStoreIds, storeId];
    // Persist to AsyncStorage with today's date
    AsyncStorage.setItem('completedUnvisitedStoreIds', JSON.stringify({
      date: new Date().toDateString(),
      ids: newIds
    })).catch(e => console.log('Failed to persist completed store IDs:', e));

    set((state: any) => ({
      completedUnvisitedStoreIds: newIds,
      unvisitedStores: state.unvisitedStores.filter((s: any) => s.id !== storeId)
    }));
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
  markAsRead: (id: number) => Promise<void>;
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
