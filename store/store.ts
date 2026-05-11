import { create } from "zustand";

interface AuthStore {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  setUser: (user: any | null) => set({ user }),
  setToken: (token: string | null) => set({ token }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  reset: () => set({ user: null, token: null, isLoading: false }),
}));
