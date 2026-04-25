import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type Plan = "free" | "pro" | "business";

export interface AuthUser {
  id: string;
  email: string;
  plan: Plan;
  firstName: string;
  lastName: string;
  businessName: string | null;
  displayName: string;
}

export interface RegisterResult {
  pending: boolean;
  email: string;
  message: string;
  emailDelivered: boolean;
  deliveryError?: string;
}

export interface RegisterArgs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (args: RegisterArgs) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchMe().finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data);
  }, []);

  const register = useCallback(async (args: RegisterArgs): Promise<RegisterResult> => {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(args),
    });
    // Do NOT set user — they must verify email first
    return {
      pending: Boolean(data.pending),
      email: data.email ?? args.email,
      message:
        data.message ??
        "Please check your email and verify your account before logging in.",
      emailDelivered: data.emailDelivered !== false,
      deliveryError: data.deliveryError,
    };
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    await fetchMe();
  }, [fetchMe]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
