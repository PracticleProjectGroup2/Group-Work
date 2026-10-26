import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import * as api from "../api/client";
import type { User } from "../api/types";

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem("jinf.user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) localStorage.setItem("jinf.user", JSON.stringify(user));
  else localStorage.removeItem("jinf.user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const navigate = useNavigate();
  const location = useLocation();

  // With the real API, re-check the stored token on page load so the role and
  // name come from the server rather than from localStorage.
  useEffect(() => {
    if (api.useMocks || !user) return;
    api.me().then((u) => { saveUser(u); setUser(u); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The API returned 401 for our token: drop the session and send the user to log in again.
  useEffect(() => {
    function onExpired() {
      saveUser(null);
      setUser(null);
      navigate("/login", { state: { from: location.pathname, expired: true } });
    }
    window.addEventListener(api.SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(api.SESSION_EXPIRED_EVENT, onExpired);
  }, [navigate, location.pathname]);

  async function login(email: string, password: string) {
    const u = await api.login(email, password);
    saveUser(u);
    setUser(u);
  }

  function logout() {
    api.setToken(null);
    saveUser(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
