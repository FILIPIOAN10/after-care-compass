import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, type UserSummary } from "./api";

type AuthState = {
  user: UserSummary | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserSummary>;
  register: (fullName: string, email: string, password: string) => Promise<UserSummary>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMe = async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await api<UserSummary>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await fetchMe();
      if (!cancelled) setLoading(false);
    })();
    const onChange = () => {
      void fetchMe();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("after:auth-changed", onChange);
    }
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener("after:auth-changed", onChange);
      }
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      async login(email, password) {
        const res = await api<{ token: string; user: UserSummary }>("/api/auth/login", {
          method: "POST",
          body: { email, password },
        });
        setToken(res.token);
        setUser(res.user);
        return res.user;
      },
      async register(fullName, email, password) {
        const res = await api<{ token: string; user: UserSummary }>("/api/auth/register", {
          method: "POST",
          body: { fullName, email, password },
        });
        setToken(res.token);
        setUser(res.user);
        return res.user;
      },
      logout() {
        setToken(null);
        setUser(null);
      },
      refresh: fetchMe,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth trebuie folosit într-un AuthProvider");
  return ctx;
}
