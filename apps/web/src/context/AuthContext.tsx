import * as React from "react";
import { clearToken, getToken, setToken } from "@/lib/api";
import type { RoleKey } from "@hms/shared";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  roles: RoleKey[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthState | null>(null);

const USER_KEY = "hms.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });

  const login = React.useCallback((accessToken: string, nextUser: AuthUser) => {
    setToken(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const logout = React.useCallback(() => {
    clearToken();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const value: AuthState = {
    user,
    isAuthenticated: Boolean(user && getToken()),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() must be used within <AuthProvider>");
  return ctx;
}
