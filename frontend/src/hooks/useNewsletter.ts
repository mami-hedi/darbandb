import { useState, useEffect, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Subscriber {
  id: number;
  email: string;
  lang: "fr" | "en";
  createdAt: string;
}

export interface Discount {
  id: number;
  code: string;
  pct: number;
  description: string | null;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

// ── Subscribers ───────────────────────────────────────────────

export function useSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger depuis l'API
  useEffect(() => {
    fetch(`${API_BASE}/subscribers`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data.success) setSubscribers(data.data); })
      .finally(() => setLoading(false));
  }, []);

  // Ajouter (depuis le site client — sans credentials)
  const add = useCallback(async (email: string, lang: "fr" | "en"): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, lang }),
    });
    const data = await res.json();
    if (data.success) {
      setSubscribers(prev => [data.data, ...prev]);
      return true;
    }
    return false;
  }, []);

  // Supprimer (admin)
  const remove = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/subscribers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSubscribers(prev => prev.filter(s => s.id !== id));
  }, []);

  // Export CSV
  const exportCsv = useCallback(() => {
    window.open(`${API_BASE}/subscribers/export`, "_blank");
  }, []);

  return { subscribers, loading, add, remove, exportCsv };
}

// ── Discounts ─────────────────────────────────────────────────

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/promos`, { credentials: "include" })
      .then(r => r.json())
      .then(data => { if (data.success) setDiscounts(data.data); })
      .finally(() => setLoading(false));
  }, []);

  const add = useCallback(async (payload: {
    code: string;
    pct: number;
    description?: string;
    expiresAt?: string | null;
    maxUses?: number | null;
  }): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/promos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      setDiscounts(prev => [data.data, ...prev]);
      return true;
    }
    return false;
  }, []);

  const remove = useCallback(async (id: number) => {
    await fetch(`${API_BASE}/promos/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setDiscounts(prev => prev.filter(d => d.id !== id));
  }, []);

  return { discounts, loading, add, remove };
}

// ── Popup visibility ──────────────────────────────────────────

const POPUP_KEY = "dar_bnb_popup_seen";

export function usePopupVisibility(delayMs = 800) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(POPUP_KEY)) return;
    const timer = setTimeout(() => setIsOpen(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const close = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(POPUP_KEY, "1");
  }, []);

  const open = useCallback(() => setIsOpen(true), []);

  return { isOpen, open, close };
}