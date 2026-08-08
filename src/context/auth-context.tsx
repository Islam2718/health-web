"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiError, type ApiUser, type LoginApiResponse } from "@/lib/api-client";
import {
  AUTH_COOKIE,
  USER_COOKIE,
  SESSION_TTL_SECONDS,
  toAppUser,
  type AppUser,
  type ProfileUpdatePayload,
} from "@/lib/auth";
import { withRole } from "@/lib/doctor-profile";

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
  // Populated on a successful login — lets a caller (e.g. the pending
  // appointment-booking flow) act immediately with the fresh session
  // instead of waiting on a re-render to see the updated context.
  token?: string;
  user?: AppUser;
}

interface AuthContextValue {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionStartedAt: Date | null;
  login: (identifier: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateProfile: (payload: ProfileUpdatePayload) => Promise<LoginResult>;
  applySession: (data: LoginApiResponse) => void;
  addRole: (role: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStartedAt, setSessionStartedAt] = useState<Date | null>(null);

  useEffect(() => {
    const storedToken = getCookie(AUTH_COOKIE);
    const storedUser = getCookie(USER_COOKIE);
    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AppUser);
        setToken(storedToken);
        setSessionStartedAt(new Date());
      } catch {
        deleteCookie(AUTH_COOKIE);
        deleteCookie(USER_COOKIE);
      }
    }
    setIsLoading(false);
  }, []);

  const applySession = (data: LoginApiResponse) => {
    const account = toAppUser(data.user);
    setCookie(AUTH_COOKIE, data.token, SESSION_TTL_SECONDS);
    setCookie(USER_COOKIE, JSON.stringify(account), SESSION_TTL_SECONDS);
    setUser(account);
    setToken(data.token);
    setSessionStartedAt(new Date());
  };

  const login = async (identifier: string, password: string): Promise<LoginResult> => {
    try {
      const data = await apiFetch<LoginApiResponse>("/login", {
        method: "POST",
        body: { identifier, password },
      });

      applySession(data);
      return { success: true, token: data.token, user: toAppUser(data.user) };
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
    deleteCookie(AUTH_COOKIE);
    deleteCookie(USER_COOKIE);
    setUser(null);
    setToken(null);
    setSessionStartedAt(null);
  };

  const updateProfile = async (payload: ProfileUpdatePayload): Promise<LoginResult> => {
    if (!token) {
      return { success: false, message: "You're not signed in." };
    }

    try {
      const data = await apiFetch<{ message: string; user: ApiUser }>("/profile", {
        method: "PATCH",
        token,
        body: payload,
      });

      const account = toAppUser(data.user);
      setCookie(USER_COOKIE, JSON.stringify(account), SESSION_TTL_SECONDS);
      setUser(account);
      return { success: true, message: data.message };
    } catch (err) {
      if (err instanceof ApiError) {
        return { success: false, message: err.message };
      }
      return { success: false, message: "Something went wrong. Please try again." };
    }
  };

  // The API doesn't return a fresh User object from the doctors/educations/
  // professional-experiences endpoints, so once the backend adds a role
  // (e.g. "USER" -> "USER, DOCTOR") we mirror that locally — it's confirmed
  // for real on the next login.
  const addRole = (role: string) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, type: withRole(prev.type, role) };
      setCookie(USER_COOKIE, JSON.stringify(updated), SESSION_TTL_SECONDS);
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        sessionStartedAt,
        login,
        logout,
        updateProfile,
        applySession,
        addRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
