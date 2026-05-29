import { useState, useEffect, useCallback } from "react";
import { parseApiPrice } from "../utils/dateHelper";
import { startOfMonth, endOfMonth, addMonths, format } from "date-fns";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

export function useDailyPrices(displayMonth: Date) {
  const [basePrice, setBasePrice] = useState<number>(1900);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const start = format(startOfMonth(displayMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(addMonths(displayMonth, 1)), "yyyy-MM-dd");
      const res = await fetch(`${API_BASE}/settings/prices/range?start=${start}&end=${end}`);
      
      if (!res.ok) throw new Error("Erreur réseau");
      const result = await res.json();

      if (result.success) {
        const parsedBase = parseApiPrice(result.basePrice);
        setBasePrice(parsedBase > 0 ? parsedBase : 150);
        
        const formatted: Record<string, number> = {};
        Object.entries(result.customPrices || {}).forEach(([k, v]) => {
          const price = parseApiPrice(v);
          if (price > 0) formatted[k] = price;
        });
        setCustomPrices(formatted);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [displayMonth]);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  return {
    basePrice,
    customPrices,
    setBasePrice, // Exporté pour mise à jour locale
    getPriceForDate: (d: Date) => customPrices[format(d, "yyyy-MM-dd")] ?? basePrice,
    loading,
    refetch: fetchPrices
  };
}