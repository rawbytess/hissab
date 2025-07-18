import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage.tsx";
import type {
  ProductNames,
  User,
  UserPlan,
} from "../../../../../lib/types/userMetadata";

const API_BASE_URL = import.meta.env.VITE_HISSAB_SERVER_URL;

interface AuthContextType {
  user: User | null;
  userPlans: UserPlan[];
  isPremium: ProductNames | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<{ newUser: boolean; message: string }>;
  verifyOtp: (
    email: string,
    otp: string,
  ) => Promise<{ user: User; accessToken: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<User | null>("user", null);
  const [userPlans, setUserPlans] = useLocalStorage<UserPlan[]>(
    "user-plans",
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isPremium = userPlans.length > 0 ? userPlans[0].product_name : null;

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (response.ok) {
          const { userPlans, user } = await response.json();
          setUser(user);
          setUserPlans(userPlans);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to refresh session on load:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) checkUserSession();
  }, []);

  const login = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      credentials: "include",
    });
    const data: { newUser: boolean; message: string } = await response.json();
    return data;
  };

  const verifyOtp = async (email: string, otp: string) => {
    const response = await fetch(`${API_BASE_URL}/user/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
      credentials: "include",
    });

    const data: { user: User; userPlans: UserPlan[]; accessToken: string } =
      await response.json();
    if (response.ok && data.user) {
      console.log(data);
      setUser(data.user);
      setUserPlans(data.userPlans);
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/user/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setUser(null);
      setUserPlans([]);
    }
  };

  const authContextValue = {
    user,
    userPlans,
    isPremium,
    isAuthenticated,
    isLoading,
    login,
    verifyOtp,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
