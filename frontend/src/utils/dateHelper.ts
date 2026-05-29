/**
 * Utilitaires pour la gestion des dates et des prix
 * Format standardisé : "yyyy-MM-dd"
 */

/**
 * Convertit une date en string format "yyyy-MM-dd"
 * ⚠️ Attention: Utilisé uniquement si vous n'avez pas accès à date-fns
 * Préférez toujours format(date, "yyyy-MM-dd") de date-fns
 */
export const toDateKey = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * Parse un prix depuis n'importe quel type et retourne un nombre
 * Gère les cas limites : null, undefined, string, number
 */
export const parseApiPrice = (price: any): number => {
  // Si c'est déjà un nombre valide, le retourner
  if (typeof price === "number" && !isNaN(price)) {
    return Math.round(price * 100) / 100; // 2 décimales
  }
  
  // Parser comme string
  const val = parseFloat(String(price || 0));
  
  // Retourner 0 si NaN
  return isNaN(val) ? 0 : Math.round(val * 100) / 100;
};

/**
 * Valide si un prix est acceptable (> 0)
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && price < 999999; // Prix raisonnable
};

/**
 * Formate un prix pour l'affichage (2 décimales)
 */
export const formatPrice = (price: number): string => {
  return parseFloat(String(price)).toFixed(2);
};