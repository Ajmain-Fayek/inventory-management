"use client";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";

export interface IUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  emailVerified: boolean;
  image?: string;
}

type SessionType = "email-password" | "social";

export interface IUserContextType {
  user: IUser | null;
  isLoading: boolean;
  saveUser: (user: IUser) => void;
  loadUser: () => void;
  removeUser: () => void;
  logout: () => Promise<void>;
  refreshSession: (args?: SessionType) => Promise<void>;
}

export const UserContext = createContext<IUserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const saveUser = useCallback((userData: IUser) => {
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  }, []);

  const loadUser = () => {
    refreshSession();
  };

  const removeUser = useCallback(() => {
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      removeUser();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  }, [removeUser]);

  const refreshSession = useCallback(async (_sessionType?: SessionType) => {
    setIsLoading(true);
    try {
      const result = await authService.getCurrentUser();

      if (result?.data) {
        saveUser(result.data);
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData) {
          setUser(userData);
          return;
        }
      }

      throw new Error("No session found");
    } catch (error) {
      console.error("Session refresh failed:", error);
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [saveUser]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, saveUser, loadUser, removeUser, logout, refreshSession }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
