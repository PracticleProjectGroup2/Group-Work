import { createContext, useContext, useState, type ReactNode } from "react";
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  async function login(email: string, password: string) {
    const u = await api.login(email, password);
    localStorage.setItem("jinf.user", JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    api.setToken(null);
    localStorage.removeItem("jinf.user");
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
