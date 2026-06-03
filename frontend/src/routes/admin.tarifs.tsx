import React, { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format } from "date-fns";
import { useDailyPrices } from "../hooks/useDailyPrices";
import { parseApiPrice } from "../utils/dateHelper";
import { Calendar, Save, Trash2, DollarSign, AlertCircle, CheckCircle, Loader } from "lucide-react";
import "react-day-picker/src/style.css";
import { AdminPage } from "@/components/AdminPage"; // <-- AJOUTEZ CETTE LIGNE

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

interface PriceEntry {
  date: string;
  price: number;
}

function AdminTarifs() {
  // État de sélection du calendrier
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [inputPrice, setInputPrice] = useState<string>("");

  // État pour la gestion du prix de base
  const [basePriceInput, setBasePriceInput] = useState<string>("");
  const [editingBasePrice, setEditingBasePrice] = useState(false);

  // États de gestion des opérations
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

// État des notifications
const [notification, setNotification] = useState<{
  type: "success" | "error" | "info";
  message: string;
} | null>(null);

// États pour les tarifs et tri
const [pricesList, setPricesList] = useState<PriceEntry[]>([]);
const [sortBy, setSortBy] = useState<"date" | "price">("date");

// Nouvel état pour basculer la vue sur mobile
const [showMobileList, setShowMobileList] = useState(false);
  
  // Hook pour récupérer les prix
  const { basePrice, customPrices, getPriceForDate, loading, refetch } = useDailyPrices(displayMonth);

  // Initialiser les inputs avec les valeurs récupérées
  const prevDayRef = useRef<Date | undefined>(undefined);

useEffect(() => {
  if (selectedDay && selectedDay !== prevDayRef.current) {
    prevDayRef.current = selectedDay;
    const price = getPriceForDate(selectedDay);
    setInputPrice(price.toString());
  }
}, [selectedDay]); // ← retirer getPriceForDate des dépendances

  // Initialiser le prix de base
  useEffect(() => {
    setBasePriceInput(basePrice.toString());
  }, [basePrice]);

  // Mettre à jour la liste des tarifs customisés
  useEffect(() => {
    const entries = Object.entries(customPrices).map(([date, price]) => ({
      date,
      price,
    }));
    const sorted = entries.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return b.price - a.price;
      }
    });
    setPricesList(sorted);
  }, [customPrices, sortBy]);

  // Afficher notification
  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sauvegarder le tarif pour la date sélectionnée
  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) {
      showNotification("error", "Veuillez sélectionner une date");
      return;
    }

    const price = parseApiPrice(inputPrice);
    if (price <= 0) {
      showNotification("error", "Le prix doit être supérieur à 0");
      return;
    }

    setIsSaving(true);
    try {
      const date = format(selectedDay, "yyyy-MM-dd");
      const response = await fetch(`${API_BASE}/settings/custom-price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, price }),
      });

      if (response.ok) {
        showNotification("success", `Prix de ${price} DT enregistré pour ${format(selectedDay, "dd MMM yyyy", { locale: fr })}`);
        refetch();
      } else {
        const error = await response.json();
        showNotification("error", error.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer un tarif customisé
  const handleDeletePrice = async (date: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tarif du ${format(new Date(date), "dd MMM yyyy", { locale: fr })} ?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${API_BASE}/settings/custom-price/${date}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showNotification("success", "Tarif supprimé avec succès");
        refetch();
      } else {
        showNotification("error", "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur de connexion au serveur");
    } finally {
      setIsDeleting(false);
    }
  };

  // Sauvegarder le prix de base
  const handleSaveBasePrice = async () => {
    const price = parseApiPrice(basePriceInput);
    if (price <= 0) {
      showNotification("error", "Le prix doit être supérieur à 0");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/settings/base-price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });

      if (response.ok) {
        showNotification("success", `Prix de base défini à ${price} DT`);
        setEditingBasePrice(false);
        refetch();
      } else {
        showNotification("error", "Erreur lors de la sauvegarde du prix de base");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur de connexion au serveur");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-neutral-950 text-white font-sans">
      {/* En-tête - Responsive */}
      <div className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex items-center gap-3 mb-1 sm:mb-2">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 flex-shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">Gestion des Tarifs</h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">Gérez le prix de base et les tarifs customisés par date</p>
        </div>
      </div>

      {/* Notification - Responsive (centrée sur mobile, droite sur desktop) */}
      {notification && (
        <div className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-top-2 ${
          notification.type === "success"
            ? "bg-emerald-950/90 border-emerald-800 text-emerald-200"
            : notification.type === "error"
            ? "bg-red-950/90 border-red-800 text-red-200"
            : "bg-blue-950/90 border-blue-800 text-blue-200"
        }`}>
          {notification.type === "success" && <CheckCircle className="h-5 w-5 flex-shrink-0" />}
          {notification.type === "error" && <AlertCircle className="h-5 w-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* PRIX DE BASE - Responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-white mb-1">Prix de Base</h2>
              <p className="text-xs sm:text-sm text-neutral-400">Tarif appliqué par défaut quand aucun prix customisé n'existe</p>
            </div>

            {editingBasePrice ? (
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">Prix (DT)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={basePriceInput}
                    onChange={(e) => setBasePriceInput(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono text-base sm:text-lg"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={handleSaveBasePrice}
                    disabled={isSaving}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {isSaving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    <span className="hidden sm:inline">Enregistrer</span>
                    <span className="sm:hidden">OK</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingBasePrice(false);
                      setBasePriceInput(basePrice.toString());
                    }}
                    className="px-4 py-3 bg-neutral-800 text-neutral-200 font-semibold rounded-lg hover:bg-neutral-700 transition-colors min-h-[48px]"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="text-3xl sm:text-4xl font-bold font-mono text-amber-400">{basePrice.toFixed(2)} DT</div>
                <button
                  onClick={() => setEditingBasePrice(true)}
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors min-h-[48px]"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-amber-400" />
              <p className="text-neutral-400 text-sm sm:text-base">Chargement des données...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* CALENDRIER ET FORMULAIRE */}
            <div className="lg:col-span-1">
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 bg-neutral-900/30 lg:sticky lg:top-24">
                <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">Sélectionner une Date</span>
                </h2>

                {/* Calendrier - Responsive */}
                <div className="mb-4 sm:mb-6 flex justify-center">
                  <style>{`
                    .admin-calendar .rdp {
                      --rdp-cell-size: 36px;
                      --rdp-accent-color: #fbbf24;
                      --rdp-background-color: #fbbf2408;
                      color: #fff;
                      font-size: 12px;
                      margin: 0;
                    }
                    @media (min-width: 640px) {
                      .admin-calendar .rdp {
                        --rdp-cell-size: 40px;
                        font-size: 14px;
                      }
                    }
                    .admin-calendar .rdp-caption {
                      padding: 0.5rem 0;
                    }
                    .admin-calendar .rdp-caption_label {
                      font-weight: 600;
                      color: #fff;
                      font-size: 13px;
                    }
                    @media (min-width: 640px) {
                      .admin-calendar .rdp-caption_label {
                        font-size: 14px;
                      }
                    }
                    .admin-calendar .rdp-head_cell {
                      color: #a3a3a3;
                      font-weight: 500;
                      font-size: 10px;
                    }
                    @media (min-width: 640px) {
                      .admin-calendar .rdp-head_cell {
                        font-size: 11px;
                      }
                    }
                    .admin-calendar .rdp-button_reset {
                      color: #fff;
                    }
                    .admin-calendar .rdp-button:hover {
                      background-color: rgba(255, 255, 255, 0.1);
                    }
                    .admin-calendar .rdp-day_selected {
                      background-color: #fbbf24;
                      color: #000;
                      font-weight: 600;
                    }
                    .admin-calendar .rdp-day_today {
                      background-color: rgba(251, 191, 36, 0.1);
                      color: #fbbf24;
                      font-weight: 600;
                    }
                    .admin-calendar .rdp-nav_button {
                      width: 28px;
                      height: 28px;
                    }
                    @media (min-width: 640px) {
                      .admin-calendar .rdp-nav_button {
                        width: 32px;
                        height: 32px;
                      }
                    }
                  `}</style>
                  <DayPicker
                    mode="single"
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    onMonthChange={setDisplayMonth}
                    month={displayMonth}
                    locale={fr}
                    className="admin-calendar"
                  />
                </div>

                {/* Infos date sélectionnée - Compact sur mobile */}
                {selectedDay && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-amber-950/30 border border-amber-800/50 rounded-lg">
                    <p className="text-xs text-neutral-400 mb-1">Date sélectionnée</p>
                    <p className="text-base sm:text-lg font-bold text-amber-400 truncate">
                      {format(selectedDay, "EEEE dd MMMM yyyy", { locale: fr })}
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-400 mt-1 sm:mt-2">
                      Format API: <code className="text-xs font-mono text-neutral-300">{format(selectedDay, "yyyy-MM-dd")}</code>
                    </p>
                  </div>
                )}

                {/* Formulaire prix - Responsive */}
                <form onSubmit={handleSavePrice} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-2">Prix en Dinars (DT)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-mono text-base sm:text-lg min-h-[48px]"
                      required
                      disabled={!selectedDay || isSaving}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!selectedDay || isSaving}
                    className="w-full px-4 py-3 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin" />
                        <span className="text-sm sm:text-base">Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span className="text-sm sm:text-base">Enregistrer le tarif</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Bouton mobile pour voir la liste */}
                <button
                  onClick={() => setShowMobileList(!showMobileList)}
                  className="lg:hidden w-full mt-4 px-4 py-3 bg-neutral-800 text-white font-semibold rounded-lg hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Calendar className="h-4 w-4" />
                  {showMobileList ? "Masquer les tarifs" : `Voir les tarifs (${pricesList.length})`}
                </button>
              </div>
            </div>

            {/* TABLEAU TARIFS CUSTOMISÉS - Transformé en cartes sur mobile */}
            <div className={`lg:col-span-2 ${showMobileList ? 'block' : 'hidden lg:block'}`}>
              <div className="border border-neutral-800 rounded-lg p-4 sm:p-6 bg-neutral-900/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-base sm:text-lg font-bold">Tarifs Customisés</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setSortBy("date")}
                      className={`flex-1 sm:flex-none text-xs px-3 py-2 rounded transition-colors min-h-[36px] ${
                        sortBy === "date"
                          ? "bg-amber-500 text-black font-semibold"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      Par Date
                    </button>
                    <button
                      onClick={() => setSortBy("price")}
                      className={`flex-1 sm:flex-none text-xs px-3 py-2 rounded transition-colors min-h-[36px] ${
                        sortBy === "price"
                          ? "bg-amber-500 text-black font-semibold"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      Par Prix
                    </button>
                  </div>
                </div>

                {pricesList.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <DollarSign className="h-10 w-10 sm:h-12 sm:w-12 text-neutral-700 mx-auto mb-4" />
                    <p className="text-neutral-400 text-sm sm:text-base">Aucun tarif customisé</p>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-2">Sélectionnez une date et définissez un tarif pour l'ajouter</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[60vh] sm:max-h-96 overflow-y-auto custom-scrollbar">
                    {pricesList.map((entry) => (
                      <div
                        key={entry.date}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg border border-neutral-700/50 hover:border-neutral-600 transition-all gap-3 sm:gap-0"
                      >
                        <div className="w-full sm:w-auto">
                          <p className="text-sm font-semibold text-white">
                            {format(new Date(entry.date), "dd MMMM yyyy", { locale: fr })}
                          </p>
                          <p className="text-xs text-neutral-400 font-mono">{entry.date}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <p className="text-lg font-bold font-mono text-amber-400">{entry.price.toFixed(2)} DT</p>
                          <button
                            onClick={() => handleDeletePrice(entry.date)}
                            disabled={isDeleting}
                            className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Supprimer ce tarif"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Statistiques - Responsive grid */}
                {pricesList.length > 0 && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-700 grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">Tarifs</p>
                      <p className="text-xl sm:text-2xl font-bold text-white">{pricesList.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">Prix min</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-400">{Math.min(...pricesList.map(p => p.price)).toFixed(2)} DT</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-neutral-400 mb-1">Prix max</p>
                      <p className="text-xl sm:text-2xl font-bold text-red-400">{Math.max(...pricesList.map(p => p.price)).toFixed(2)} DT</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles + Responsive utilities */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Empêcher le zoom sur input sur iOS */
        @media screen and (max-width: 640px) {
          input, select, textarea {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
    
  );
}

export const Route = createFileRoute("/admin/tarifs")({
  component: AdminTarifs,
});