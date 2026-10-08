import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { ReactNode } from "react";
import { API_URL } from "../config/api";

export type UserRole =
  | "Analyst"
  | "Executive / Viewer";


export interface AuthUser {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
}


interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}


const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );


interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);


  const refreshUser = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data: AuthUser =
        await response.json();

      setUser(data);
    } catch (error) {
      console.error(
        "Authentication check failed:",
        error
      );

      setUser(null);
    }
  };


  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      await refreshUser();

      setLoading(false);
    };

    initializeAuth();
  }, []);


  const logout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );
    } finally {
      setUser(null);

      window.location.href = "/login";
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}