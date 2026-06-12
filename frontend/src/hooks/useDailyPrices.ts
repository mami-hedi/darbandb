import { useState, useEffect, useCallback } from "react";
import { parseApiPrice } from "../utils/dateHelper";
import { startOfMonth, endOfMonth, addMonths, format } from "date-fns";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

export function useDailyPrices(displayMonth: Date) {
  // Initialisation à 0 pour indiquer que la donnée n'est pas encore chargée
  const [basePrice, setBasePrice] = useState<number>(0);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Définition de la plage de dates pour le fetch
      const start = format(startOfMonth(displayMonth), "yyyy-MM-dd");
      const end = format(endOfMonth(addMonths(displayMonth, 1)), "yyyy-MM-dd");
      
      const res = await fetch(`${API_BASE}/settings/prices/range?start=${start}&end=${end}`);
      
      if (!res.ok) {
        throw new Error(`Erreur serveur: ${res.status}`);
      }
      
      const result = await res.json();

      if (result.success) {
        // Parsing strict de la valeur provenant de l'API
        const parsedBase = parseApiPrice(result.basePrice);
        setBasePrice(parsedBase);
        
        // Traitement des prix personnalisés
        const formatted: Record<string, number> = {};
        if (result.customPrices) {
          Object.entries(result.customPrices).forEach(([date, value]) => {
            const price = parseApiPrice(value);
            if (price > 0) {
              formatted[date] = price;
            }
          });
        }
        setCustomPrices(formatted);
      } else {
        throw new Error(result.message || "Impossible de récupérer les tarifs");
      }
    } catch (err) {
      console.error("Erreur dans useDailyPrices:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [displayMonth]);

  // Chargement automatique lors du changement de mois
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    basePrice,
    customPrices,
    setBasePrice,
    // Retourne le prix customisé si présent, sinon le prix de base
    getPriceForDate: (d: Date) => {
      const dateStr = format(d, "yyyy-MM-dd");
      return customPrices[dateStr] ?? basePrice;
    },
    loading,
    error,
    refetch: fetchPrices
  };
}