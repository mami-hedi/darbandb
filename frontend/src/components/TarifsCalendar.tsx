import React, { useState, useEffect, useCallback } from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { format, startOfMonth, endOfMonth, addMonths } from "date-fns";
import "react-day-picker/dist/style.css";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

type CustomPriceMap = Record<string, number>;

export function TarifsCalendar() {
  const [basePrice, setBasePrice]       = useState<number>(150);
  const [customPrices, setCustomPrices] = useState<CustomPriceMap>({});
  const [selectedDay, setSelectedDay]   = useState<Date | undefined>(new Date());
  const [inputPrice, setInputPrice]     = useState<string>("");
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [successMsg, setSuccessMsg]   = useState<string | null>(null);

  // Charge les prix pour le mois affiché
  const loadPricesForMonth = useCallback(async (month: Date) => {
    try {
      setLoading(true);
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end   = format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd"); // mois courant + suivant

      const res    = await fetch(`${API_BASE}/settings/prices/range?start=${start}&end=${end}`);
      const result = await res.json();

      if (result.success) {
        setBasePrice(result.basePrice);
        setCustomPrices((prev) => ({ ...prev, ...result.customPrices }));
      } else {
        setError(result.error || "Erreur chargement");
      }
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPricesForMonth(displayMonth);
  }, [displayMonth, loadPricesForMonth]);

  // Sync champ prix quand on change de jour sélectionné
  useEffect(() => {
    if (!selectedDay) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");
    const price   = customPrices[dateStr] !== undefined
      ? customPrices[dateStr]
      : basePrice;
    setInputPrice(price.toString());
  }, [selectedDay, customPrices, basePrice]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Sauvegarde du prix pour le jour sélectionné
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;

    const dateStr  = format(selectedDay, "yyyy-MM-dd");
    const newPrice = parseFloat(inputPrice);

    if (isNaN(newPrice) || newPrice <= 0) {
      setError("Prix invalide — doit être supérieur à 0.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res    = await fetch(`${API_BASE}/settings/custom-price`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ date: dateStr, price: newPrice }),
      });
      const result = await res.json();

      if (result.success) {
        setCustomPrices((prev) => ({ ...prev, [dateStr]: newPrice }));
        showSuccess(`✓ ${format(selectedDay, "dd MMM yyyy", { locale: fr })} → ${newPrice} DT`);
      } else {
        setError(result.error || "Erreur sauvegarde");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setSaving(false);
    }
  };

  // Réinitialise le prix du jour au prix de base
  const handleReset = async () => {
    if (!selectedDay) return;
    const dateStr = format(selectedDay, "yyyy-MM-dd");

    if (!customPrices[dateStr]) {
      setError("Ce jour utilise déjà le prix de base.");
      return;
    }

    if (!confirm(`Réinitialiser le ${format(selectedDay, "dd MMM yyyy", { locale: fr })} au prix de base (${basePrice} DT) ?`)) return;

    setDeleting(true);
    setError(null);
    try {
      const res    = await fetch(`${API_BASE}/settings/custom-price/${dateStr}`, { method: "DELETE" });
      const result = await res.json();

      if (result.success) {
        setCustomPrices((prev) => {
          const next = { ...prev };
          delete next[dateStr];
          return next;
        });
        setInputPrice(basePrice.toString());
        showSuccess(`✓ Prix du ${format(selectedDay, "dd MMM yyyy", { locale: fr })} réinitialisé à ${basePrice} DT`);
      } else {
        setError(result.error || "Erreur suppression");
      }
    } catch {
      setError("Erreur de connexion.");
    } finally {
      setDeleting(false);
    }
  };

  // Rendu personnalisé de chaque case du calendrier
  const renderDay = (date: Date) => {
    const dateStr  = format(date, "yyyy-MM-dd");
    const isCustom = customPrices[dateStr] !== undefined;
    const price    = isCustom ? customPrices[dateStr] : basePrice;

    return (
      <div style={{
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        justifyContent: "center",
        width:          "100%",
        height:         "100%",
        gap:            "2px",
      }}>
        <span style={{ fontSize: "13px", fontWeight: 600, lineHeight: 1 }}>
          {date.getDate()}
        </span>
        <span style={{
          fontSize:        "8px",
          padding:         "1px 4px",
          borderRadius:    "4px",
          backgroundColor: isCustom ? "#f59e0b22" : "transparent",
          color:           isCustom ? "#b45309"   : "#9ca3af",
          fontWeight:      isCustom ? 700          : 400,
          whiteSpace:      "nowrap",
        }}>
          {price} DT
        </span>
      </div>
    );
  };

  // Infos du jour sélectionné
  const selectedDateStr    = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const isCustomDay        = selectedDateStr ? customPrices[selectedDateStr] !== undefined : false;
  const selectedDayPrice   = selectedDateStr
    ? (customPrices[selectedDateStr] ?? basePrice)
    : basePrice;

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px" }}>

      {/* HEADER */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ fontSize: "11px", textTransform: "uppercase", color: "#6b7280", fontWeight: 700, letterSpacing: "0.08em" }}>
          Administration · Dar B&B
        </span>
        <h1 style={{ fontSize: "26px", margin: "6px 0 4px", fontWeight: 800 }}>
          Calendrier des Tarifs
        </h1>
        <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
          Tarif de base : <strong style={{ color: "#111" }}>{basePrice} DT / nuit</strong>.
          Cliquez sur un jour pour définir un tarif spécial.
        </p>
      </div>

      {/* MESSAGES */}
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#b91c1c", fontWeight: 700 }}>✕</button>
        </div>
      )}
      {successMsg && (
        <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", padding: "10px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
          {successMsg}
        </div>
      )}

      {/* CORPS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>

        {/* CALENDRIER */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px" }}>
          {loading && (
            <div style={{ textAlign: "center", padding: "8px", fontSize: "12px", color: "#9ca3af" }}>
              Chargement des tarifs...
            </div>
          )}
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={fr}
            showOutsideDays={false}
            styles={{
              months:  { justifyContent: "center" },
              caption: { marginBottom: "12px" },
            }}
            components={{
              Day: ({ date, ...props }: any) => (
                <button
                  {...props}
                  style={{
                    ...props.style,
                    width:  "52px",
                    height: "52px",
                    padding: 0,
                    borderRadius: "8px",
                  }}
                >
                  {renderDay(date)}
                </button>
              ),
            }}
          />
        </div>

        {/* PANNEAU ÉDITION */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", position: "sticky", top: "24px" }}>

          {/* Jour sélectionné */}
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "11px", textTransform: "uppercase", color: "#9ca3af", fontWeight: 600, margin: "0 0 4px" }}>
              Jour sélectionné
            </p>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#111827", margin: 0 }}>
              {selectedDay
                ? format(selectedDay, "dd MMMM yyyy", { locale: fr })
                : "Aucun jour choisi"}
            </p>
            {isCustomDay && (
              <span style={{ display: "inline-block", marginTop: "6px", fontSize: "10px", background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "99px", fontWeight: 700 }}>
                Prix personnalisé
              </span>
            )}
            {!isCustomDay && selectedDay && (
              <span style={{ display: "inline-block", marginTop: "6px", fontSize: "10px", background: "#f3f4f6", color: "#6b7280", padding: "2px 8px", borderRadius: "99px" }}>
                Prix de base
              </span>
            )}
          </div>

          {/* Prix actuel */}
          <div style={{ background: "#f9fafb", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px", textAlign: "center" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px" }}>Prix actuel</p>
            <p style={{ fontSize: "28px", fontWeight: 800, color: "#1f2937", margin: 0 }}>
              {selectedDayPrice} <span style={{ fontSize: "14px", fontWeight: 500, color: "#6b7280" }}>DT</span>
            </p>
          </div>

          {selectedDay && (
            <>
              {/* FORMULAIRE */}
              <form onSubmit={handleSave}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                  Nouveau prix pour ce jour
                </label>
                <div style={{ position: "relative", marginBottom: "12px" }}>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    style={{
                      width:        "100%",
                      padding:      "10px 44px 10px 14px",
                      fontSize:     "18px",
                      fontWeight:   700,
                      border:       "1px solid #d1d5db",
                      borderRadius: "8px",
                      boxSizing:    "border-box",
                      outline:      "none",
                    }}
                  />
                  <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#9ca3af", fontWeight: 700 }}>
                    DT
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width:           "100%",
                    padding:         "11px",
                    backgroundColor: saving ? "#9ca3af" : "#1f2937",
                    color:           "#fff",
                    border:          "none",
                    borderRadius:    "8px",
                    fontWeight:      700,
                    fontSize:        "13px",
                    cursor:          saving ? "not-allowed" : "pointer",
                    marginBottom:    "8px",
                    transition:      "background 0.2s",
                  }}
                >
                  {saving ? "Enregistrement..." : "Appliquer ce tarif"}
                </button>
              </form>

              {/* RESET — visible seulement si prix custom */}
              {isCustomDay && (
                <button
                  onClick={handleReset}
                  disabled={deleting}
                  style={{
                    width:           "100%",
                    padding:         "9px",
                    backgroundColor: "transparent",
                    color:           deleting ? "#9ca3af" : "#dc2626",
                    border:          "1px solid #fca5a5",
                    borderRadius:    "8px",
                    fontWeight:      600,
                    fontSize:        "12px",
                    cursor:          deleting ? "not-allowed" : "pointer",
                  }}
                >
                  {deleting ? "Réinitialisation..." : `↩ Revenir au prix de base (${basePrice} DT)`}
                </button>
              )}
            </>
          )}

          {/* LÉGENDE */}
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
            <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, margin: "0 0 8px" }}>LÉGENDE</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6b7280" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#fef3c7", border: "1px solid #fcd34d", flexShrink: 0 }} />
                Prix personnalisé
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6b7280" }}>
                <span style={{ width: "12px", height: "12px", borderRadius: "3px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", flexShrink: 0 }} />
                Prix de base ({basePrice} DT)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}