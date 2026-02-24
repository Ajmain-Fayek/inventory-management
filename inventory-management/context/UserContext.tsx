"use client";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { authService } from "@/services/auth.service";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface IUser {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  emailVerified: boolean;
  image?: string;
}

export interface IUserContextType {
  user: IUser | null;
  isLoading: boolean;
  saveUser: (user: IUser) => void;
  loadUser: () => void;
  removeUser: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

export const UserContext = createContext<IUserContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Hydrate user state from the better-auth session cookie.
   * The cookie is HttpOnly and sent automatically by the browser — no localStorage needed.
   */
  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await authService.getSession();
      if (session?.user) {
        const result = await authService.googleLoginSuccess(); // Optional: fetch latest user data after social login
        saveUser(result.data); // Update context with latest user data
        return;
      }

      setUser(null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hydrate on mount
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Update in-memory state only — no localStorage. */
  const saveUser = (userData: IUser) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  /** Re-read from the server session (alias for refreshSession). */
  const loadUser = () => {
    refreshSession();
  };

  /** Clear in-memory state — the server/cookie is cleared by logout(). */
  const removeUser = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      removeUser();
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoading, saveUser, loadUser, removeUser, logout, refreshSession }}
    >
      {children}
    </UserContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
