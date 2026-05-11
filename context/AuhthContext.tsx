import { useAuthStore } from "../store/store";
import { authService } from "../service/auth.service";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { user, setUser, setToken, reset } = useAuthStore();
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        setToken(token);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch {
          reset();
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [reset, setToken, setUser]);
  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    await AsyncStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    // Login API only returns a token, fetch profile separately
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch {
      setUser({ email }); // fallback
    }
  };
  const logout = async () => {
    await authService.logout();
    await AsyncStorage.removeItem("token");
    reset();
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
