"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError, type LoginApiResponse } from "@/lib/api-client";
import {
  ADMIN_AUTH_COOKIE,
  ADMIN_USER_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  toAdminUser,
  type AdminUser,
} from "@/lib/admin-auth";
import { getRoles } from "@/lib/doctor-profile";

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`;
}

interface LoginResult {
  success: boolean;
  message?: string;
}

interface AdminAuthContextValue {
  admin: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getCookie(ADMIN_AUTH_COOKIE);
    const storedUser = getCookie(ADMIN_USER_COOKIE);
    if (storedToken && storedUser) {
      try {
        setAdmin(JSON.parse(storedUser) as AdminUser);
        setToken(storedToken);
      } catch {
        deleteCookie(ADMIN_AUTH_COOKIE);
        deleteCookie(ADMIN_USER_COOKIE);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      const data = await apiFetch<LoginApiResponse>("/login", {
        method: "POST",
        body: { identifier, password },
      });

      // Same multi-role-safe parsing used everywhere else (a comma-joined
      // type string like "USER,ADMIN" would fail a plain === check).
      const roles = getRoles(data.user.type);
      if (!roles.includes("ADMIN") && !roles.includes("SUPERADMIN")) {
        return { success: false, message: "This portal is for administrators only." };
      }

      const user = toAdminUser(data.user);
      setCookie(ADMIN_AUTH_COOKIE, data.token, ADMIN_SESSION_TTL_SECONDS);
      setCookie(ADMIN_USER_COOKIE, JSON.stringify(user), ADMIN_SESSION_TTL_SECONDS);
      setAdmin(user);
      setToken(data.token);
      return { success: true };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message };
      }
      return { success: false, message: "Something went wrong. Please try again." };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await apiFetch("/logout", { method: "POST", token });
      } catch {
        // Ignore — the session is being cleared locally regardless.
      }
    }
    deleteCookie(ADMIN_AUTH_COOKIE);
    deleteCookie(ADMIN_USER_COOKIE);
    setAdmin(null);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, isAuthenticated: !!admin, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
