import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthCtx = { isAuthed: boolean; login: (email: string, pwd: string) => boolean; logout: () => void; email: string | null };
const Ctx = createContext<AuthCtx | null>(null);

const KEY = "bnb-admin-auth";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setEmail(localStorage.getItem(KEY));
  }, []);

  const login = (e: string, p: string) => {
    // Mock auth: accept any non-empty email + pwd >= 4 chars
    if (e && p.length >= 4) {
      localStorage.setItem(KEY, e);
      setEmail(e);
      return true;
    }
    return false;
  };
  const logout = () => { localStorage.removeItem(KEY); setEmail(null); };

  return <Ctx.Provider value={{ isAuthed: !!email, login, logout, email }}>{children}</Ctx.Provider>;
}

export function useAdminAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdminAuth must be inside AdminAuthProvider");
  return c;
}
