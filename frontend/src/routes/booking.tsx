// ============================================
// Page Booking — Complète avec validation
//   des dates bloquées (bilingue FR/EN)
// @/routes/booking.tsx
//
// FONCTIONNALITÉS :
//  • Dates passées   → grisées, non cliquables
//  • Dates indispo   → fond rose, croix, non cliquables
//  • handleRangeSelect → intercepte la sélection en temps réel
//    si une date dans le range est bloquée : message bilingue + reset du to
//  • handleSubmit    → filet de sécurité final côté client
//  • getUnavailableMessage → message bilingue fr/en avec la date formatée
//  • Tarification dynamique par jour
// ============================================

import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Mail, MapPin, Phone, Check, ExternalLink,
  Calendar as CalendarIcon, User, Globe, X,
  AlertTriangle, RefreshCw,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { fr, enUS } from "date-fns/locale";
import {
  format, startOfToday, startOfMonth, endOfMonth,
  addMonths, eachDayOfInterval,
} from "date-fns";
import { DayPicker, DateRange, DayButtonProps } from "react-day-picker";
import "react-day-picker/src/style.css";

// ─── Route ────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Réservation — B&B Hammamet" },
      {
        name: "description",
        content:
          "Sélectionnez votre méthode de réservation préférée pour la villa en exclusivité.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    checkIn: (search.checkIn as string) || undefined,
    checkOut: (search.checkOut as string) || undefined,
  }),
  component: Booking,
});

// ─── Types ────────────────────────────────────────────────────────────────────
const API_BASE =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";
type CustomPriceMap = Record<string, number>;

// ─── Composant principal ──────────────────────────────────────────────────────
function Booking() {
  const { t, lang } = useLang();
  const { checkIn, checkOut } = useSearch({ from: "/booking" });

  const today = startOfToday();

  const [sent, setSent] = useState(false);
  const [bookingMethod, setBookingMethod] = useState<"direct" | "airbnb">(
    "direct"
  );
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  // Tarification dynamique
  const [basePrice, setBasePrice] = useState<number>(150);
  const [customPrices, setCustomPrices] = useState<CustomPriceMap>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Dates indisponibles
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (checkIn && checkOut)
      return { from: new Date(checkIn), to: new Date(checkOut) };
    if (checkIn) return { from: new Date(checkIn), to: undefined };
    return undefined;
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    guests: "2",
    message: "",
  });

  const [modalStatus, setModalStatus] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({ isOpen: false, type: "success", title: "", message: "" });

  const AIRBNB_URL = "https://www.airbnb.fr/h/villabnb";

  // ── Fetch tarifs ──────────────────────────────────────────────────────────
  const loadPricesForMonth = useCallback(async (month: Date) => {
    setLoadingPrices(true);
    setCustomPrices({});
    try {
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end = format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd");
      const res = await fetch(
        `${API_BASE}/settings/prices/range?start=${start}&end=${end}`
      );
      const result = await res.json();
      if (result.success) {
        setBasePrice(result.basePrice);
        setCustomPrices(result.customPrices || {});
      }
    } catch (err) {
      console.error("Erreur tarifs:", err);
    } finally {
      setLoadingPrices(false);
    }
  }, []);

  // ── Fetch disponibilités ──────────────────────────────────────────────────
  const loadUnavailableDates = useCallback(async (month: Date) => {
    setLoadingAvail(true);
    try {
      const m1 = month;
      const m2 = addMonths(month, 1);

      const [r1, r2] = await Promise.all([
        fetch(
          `${API_BASE}/availability/calendar?year=${m1.getFullYear()}&month=${
            m1.getMonth() + 1
          }`
        ),
        fetch(
          `${API_BASE}/availability/calendar?year=${m2.getFullYear()}&month=${
            m2.getMonth() + 1
          }`
        ),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);

      const allDays = [...(d1.data || []), ...(d2.data || [])];
      const unavailable = allDays
        .filter((d: { available: boolean; date: string }) => !d.available)
        .map((d: { date: string }) => new Date(d.date + "T00:00:00"));

      setUnavailableDates(unavailable);
    } catch (err) {
      console.error("Erreur disponibilités:", err);
    } finally {
      setLoadingAvail(false);
    }
  }, []);

  useEffect(() => {
    loadPricesForMonth(displayMonth);
    loadUnavailableDates(displayMonth);
  }, [displayMonth, loadPricesForMonth, loadUnavailableDates]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPriceForDate = useCallback(
    (date: Date): number => {
      const dateStr = format(date, "yyyy-MM-dd");
      return customPrices[dateStr] !== undefined
        ? customPrices[dateStr]
        : basePrice;
    },
    [customPrices, basePrice]
  );

  // Set de strings pour lookup O(1)
  const unavailableDateSet = useMemo(
    () => new Set(unavailableDates.map((d) => format(d, "yyyy-MM-dd"))),
    [unavailableDates]
  );

  const isDateUnavailable = useCallback(
    (date: Date): boolean => unavailableDateSet.has(format(date, "yyyy-MM-dd")),
    [unavailableDateSet]
  );

  // ── Message bilingue pour date bloquée ───────────────────────────────────
  const getUnavailableMessage = useCallback(
    (date: Date): { title: string; message: string } => {
      const formatted = format(date, "dd MMMM yyyy", {
        locale: lang === "fr" ? fr : enUS,
      });
      return {
        title:
          lang === "fr"
            ? "Date non disponible"
            : "Date unavailable",
        message:
          lang === "fr"
            ? `Le ${formatted} est non disponible. Vous pouvez choisir une autre date.`
            : `${formatted} is not available. You can choose another date.`,
      };
    },
    [lang]
  );

  // ── Interception de la sélection : valide le range en temps réel ─────────
  //
  // POURQUOI cette logique :
  // DayPicker mode "range" : la prop `disabled` empêche le clic DIRECT sur
  // une date rouge, mais pas qu'elle soit ENGLOBÉE dans un range from→to.
  // Ex : checkin=10 juin, checkout=15 juin, le 12 est bloqué → range accepté
  //      par DayPicker mais invalide → on doit scanner l'intervalle complet.
  const handleRangeSelect = useCallback(
    (newRange: DateRange | undefined) => {
      // Cas 1 : reset complet (clic sur from déjà sélectionné)
      if (!newRange) {
        setRange(undefined);
        return;
      }

      // Cas 2 : seul le "from" vient d'être posé (premier clic)
      if (newRange.from && !newRange.to) {
        if (isDateUnavailable(newRange.from)) {
          // Filet de sécurité (disabled devrait déjà l'empêcher)
          const { title, message } = getUnavailableMessage(newRange.from);
          setModalStatus({ isOpen: true, type: "warning", title, message });
          setRange(undefined);
          return;
        }
        setRange(newRange);
        return;
      }

      // Cas 3 : range complet from→to (deuxième clic = checkout choisi)
      // → Scanner TOUTES les dates de l'intervalle inclusif
      if (newRange.from && newRange.to) {
        let blockedDay: Date | undefined;
        try {
          const days = eachDayOfInterval({
            start: newRange.from,
            end: newRange.to,
          });
          // Première date bloquée trouvée dans l'intervalle
          blockedDay = days.find((day) => isDateUnavailable(day));
        } catch {
          // eachDayOfInterval lève si start > end — on laisse passer
        }

        if (blockedDay) {
          const { title, message } = getUnavailableMessage(blockedDay);
          setModalStatus({ isOpen: true, type: "warning", title, message });
          // Conserver le "from" valide — l'utilisateur choisit un autre "to"
          setRange({ from: newRange.from, to: undefined });
          return;
        }
      }

      // Aucune date bloquée dans le range → valide
      setRange(newRange);
    },
    [isDateUnavailable, getUnavailableMessage]
  );

  // ── Calcul total ──────────────────────────────────────────────────────────
  const calculateTotalDetails = () => {
    if (!range?.from || !range?.to) return { total: 0, nights: 0, breakdowns: [] };
    try {
      const days = eachDayOfInterval({ start: range.from, end: range.to });
      if (days.length <= 1) return { total: 0, nights: 0, breakdowns: [] };
      const nightDays = days.slice(0, -1);
      let total = 0;
      const breakdowns: { date: Date; price: number }[] = [];
      nightDays.forEach((day) => {
        const price = getPriceForDate(day);
        total += price;
        breakdowns.push({ date: day, price });
      });
      return { total, nights: nightDays.length, breakdowns };
    } catch {
      return { total: 0, nights: 0, breakdowns: [] };
    }
  };

  const {
    total: totalPrice,
    nights: totalNights,
    breakdowns: priceBreakdowns,
  } = calculateTotalDetails();

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!range?.from || !range?.to) {
      setModalStatus({
        isOpen: true,
        type: "warning",
        title: t.booking.missingDatesTitle,
        message: t.booking.missingDatesDesc,
      });
      return;
    }

    // ── Filet de sécurité : re-vérifie que l'intervalle ne contient pas
    //    de date bloquée (au cas où les données auraient changé depuis la sélection)
    try {
      const days = eachDayOfInterval({ start: range.from, end: range.to });
      const blockedDay = days.find((day) => isDateUnavailable(day));
      if (blockedDay) {
        const { title, message } = getUnavailableMessage(blockedDay);
        setModalStatus({ isOpen: true, type: "warning", title, message });
        return;
      }
    } catch {
      // intervalle invalide — laisse le serveur rejeter
    }

    try {
      const response = await fetch(`${API_BASE}/reservations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          numberOfGuests: parseInt(formData.guests),
          checkInDate: range.from,
          checkOutDate: range.to,
          specialRequests: formData.message,
          totalPrice,
        }),
      });

      if (response.ok) {
        setSent(true);
        setRange(undefined);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          guests: "2",
          message: "",
        });
        setModalStatus({
          isOpen: true,
          type: "success",
          title: t.booking.successTitle,
          message: t.booking.successDesc,
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 4000);
      } else {
        const error = await response.json();
        setModalStatus({
          isOpen: true,
          type: "error",
          title: t.booking.errorTitle,
          message: error.error || "Une erreur est survenue.",
        });
      }
    } catch {
      setModalStatus({
        isOpen: true,
        type: "error",
        title: t.booking.errorConnTitle,
        message: t.booking.errorConnDesc,
      });
    }
  };

  // ── Dates désactivées pour DayPicker ─────────────────────────────────────
  // On passe les dates indisponibles directement + { before: today }.
  // DayPicker les rend non-cliquables ET les exclut du range highlight,
  // mais onSelect peut quand même recevoir un range qui les englobe
  // → c'est handleRangeSelect qui intercepte ce cas.
  const disabledDays = [{ before: today }, ...unavailableDates];

  // ── Modifiers personnalisés : marque "unavailable" pour le DayButton ──────
  // Permet au DayButton de savoir qu'une date est bloquée (manuellement
  // ou réservée) sans refaire le lookup dans unavailableDates.
  const modifiersUnavailable = useMemo(
    () => ({ unavailable: unavailableDates }),
    [unavailableDates]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SiteLayout>
      <div className="bg-neutral-950 text-white min-h-screen font-sans selection:bg-white selection:text-black">

        {/* ── Modale notification ── */}
        {modalStatus.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-scale-up">
              <button
                onClick={() =>
                  setModalStatus((p) => ({ ...p, isOpen: false }))
                }
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`p-4 rounded-full mb-4 border ${
                    modalStatus.type === "success"
                      ? "bg-emerald-950/50 border-emerald-800 text-emerald-400"
                      : modalStatus.type === "warning"
                      ? "bg-amber-950/50 border-amber-800 text-amber-400"
                      : "bg-red-950/50 border-red-800 text-red-400"
                  }`}
                >
                  {modalStatus.type === "success" && (
                    <Check className="h-8 w-8" />
                  )}
                  {modalStatus.type === "warning" && (
                    <AlertTriangle className="h-8 w-8" />
                  )}
                  {modalStatus.type === "error" && <X className="h-8 w-8" />}
                </div>
                <h3 className="font-display text-2xl mb-2 text-white">
                  {modalStatus.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  {modalStatus.message}
                </p>
                <button
                  onClick={() =>
                    setModalStatus((p) => ({ ...p, isOpen: false }))
                  }
                  className="w-full bg-white text-black py-3 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-200 transition"
                >
                  {t.booking.modalClose}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── En-tête ── */}
        <section className="container-luxe pt-24 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
                — {t.booking.eyebrow}
              </div>
              <h1 className="font-display text-5xl md:text-6xl text-white tracking-tight mb-4">
                {t.booking.title}
              </h1>
            </div>
            {(loadingPrices || loadingAvail) && (
              <RefreshCw className="h-5 w-5 text-neutral-500 animate-spin hidden sm:block" />
            )}
          </div>
          <p className="text-neutral-400 max-w-2xl text-sm md:text-base leading-relaxed">
            {t.booking.sub}
          </p>
        </section>

        {/* ── Sélecteur méthode ── */}
        <section className="container-luxe pb-8">
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
            {/* Direct */}
            <button
              type="button"
              onClick={() => setBookingMethod("direct")}
              className={`p-6 text-left border transition-all duration-300 relative ${
                bookingMethod === "direct"
                  ? "border-white bg-neutral-900/60 ring-1 ring-white"
                  : "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 border ${
                    bookingMethod === "direct"
                      ? "border-white bg-neutral-800 text-white"
                      : "border-neutral-800 text-neutral-400"
                  }`}
                >
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    className={`text-base font-bold tracking-wide uppercase font-display ${
                      bookingMethod === "direct"
                        ? "text-white"
                        : "text-neutral-400"
                    }`}
                  >
                    {t.booking.directTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {t.booking.directDesc}
                  </p>
                </div>
              </div>
              {bookingMethod === "direct" && (
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-black bg-white px-2 py-0.5">
                  {t.booking.selected}
                </span>
              )}
            </button>

            {/* Airbnb */}
            <button
              type="button"
              onClick={() => setBookingMethod("airbnb")}
              className={`p-6 text-left border transition-all duration-300 relative ${
                bookingMethod === "airbnb"
                  ? "border-[#FF5A5F] bg-[#FF5A5F] text-white shadow-lg"
                  : "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 border ${
                    bookingMethod === "airbnb"
                      ? "border-white/30 bg-white text-[#FF5A5F]"
                      : "border-neutral-800 text-neutral-400"
                  }`}
                >
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3
                    className={`text-base font-bold tracking-wide uppercase font-display ${
                      bookingMethod === "airbnb"
                        ? "text-white"
                        : "text-neutral-400"
                    }`}
                  >
                    {t.booking.airbnbTitle}
                  </h3>
                  <p
                    className={`text-xs mt-1 leading-relaxed ${
                      bookingMethod === "airbnb"
                        ? "text-white/80"
                        : "text-neutral-400"
                    }`}
                  >
                    {t.booking.airbnbDesc}
                  </p>
                </div>
              </div>
              {bookingMethod === "airbnb" && (
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-[#FF5A5F] bg-white px-2 py-0.5">
                  {t.booking.selected}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* ── Contenu dynamique ── */}
        <section className="container-luxe pb-32 grid lg:grid-cols-12 gap-12 items-start">

          {bookingMethod === "direct" ? (
            <div className="lg:col-span-8 space-y-12">

              {/* ── ÉTAPE 1 : Calendrier ── */}
              <div className="border border-neutral-800 p-6 md:p-8 bg-neutral-900/20 shadow-sm">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center justify-between text-neutral-200">
                  <span className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-neutral-400" />
                    {t.booking.step1}
                  </span>
                </h3>

                {/* Légende rapide */}
                <div className="flex flex-wrap gap-4 mb-5 text-[10px] text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-neutral-600 bg-transparent inline-block opacity-40" />
                    {lang === "fr" ? "Passé" : "Past"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-rose-900/60 border border-rose-700 inline-block" />
                    {lang === "fr" ? "Indisponible" : "Unavailable"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 border border-neutral-600 inline-block" />
                    {lang === "fr" ? "Disponible" : "Available"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 bg-white inline-block" />
                    {lang === "fr" ? "Sélectionné" : "Selected"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold text-[10px]">
                      DT
                    </span>
                    {lang === "fr" ? "Tarif spécial" : "Special rate"}
                  </span>
                </div>

                {/* Bannière date indispo si range invalide */}
                {range?.from && !range?.to && (
                  <div className="mb-4 px-4 py-3 bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs rounded flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    {lang === "fr"
                      ? "Sélectionnez maintenant votre date de départ."
                      : "Now select your check-out date."}
                  </div>
                )}

                {/* CSS du calendrier dark */}
                <style>{`
                  .booking-rdp {
                    --rdp-cell-size: 40px;
                    --rdp-accent-color: #fff;
                    --rdp-background-color: transparent;
                    --rdp-selected-color: #000;
                    --rdp-range-middle-background-color: #1a1a1a;
                    --rdp-range-middle-color: #fff;
                    color: white;
                    width: 100%;
                  }
                  .booking-rdp .rdp-months {
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 2rem !important;
                    width: 100%;
                  }
                  @media (min-width: 640px) {
                    .booking-rdp .rdp-months {
                      flex-direction: row !important;
                    }
                  }
                  .booking-rdp .rdp-month { flex: 1; }
                  .booking-rdp .rdp-head_cell {
                    text-transform: uppercase;
                    font-size: 0.65rem;
                    color: #525252;
                    font-weight: 700;
                    padding-bottom: 8px;
                  }
                  .booking-rdp .rdp-caption_label {
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: #a3a3a3;
                  }
                  .booking-rdp .rdp-nav_button { color: #737373; }
                  .booking-rdp .rdp-nav_button:hover {
                    background: #262626;
                    color: #fff;
                  }
                  .booking-rdp .rdp-table {
                    border-collapse: separate;
                    border-spacing: 2px;
                    width: 100%;
                  }
                  .booking-rdp .rdp-day_range_middle button {
                    background: #1c1c1c !important;
                    border-radius: 0 !important;
                  }
                  .booking-rdp .rdp-day_selected button,
                  .booking-rdp .rdp-day_range_start button,
                  .booking-rdp .rdp-day_range_end button {
                    background: #fff !important;
                    color: #000 !important;
                    border-radius: 0 !important;
                  }
                  /* ── Date bloquée dans un range highlight ──
                     DayPicker peut colorer en range_middle une date
                     bloquée si le survol la traverse. On réécrase
                     pour conserver l'apparence rose + curseur interdit. */
                  .booking-rdp .rdp-day_range_middle[data-unavailable] button,
                  .booking-rdp .rdp-day_range_middle.rdp-day_disabled button {
                    background: rgba(136, 19, 55, 0.25) !important;
                    cursor: not-allowed !important;
                    pointer-events: none !important;
                  }
                `}</style>

                {/* DayPicker */}
                <div
                  className={`transition-opacity duration-200 ${
                    loadingPrices || loadingAvail
                      ? "opacity-40 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  <DayPicker
                    className="booking-rdp"
                    mode="range"
                    selected={range}
                    onSelect={handleRangeSelect}
                    month={displayMonth}
                    onMonthChange={setDisplayMonth}
                    locale={lang === "fr" ? fr : enUS}
                    numberOfMonths={2}
                    disabled={disabledDays}
                    modifiers={modifiersUnavailable}
                    min={2}
                    components={{
                      DayButton: (props: DayButtonProps) => {
                        const { day, modifiers, ...buttonProps } = props;
                        const targetDate = day.date;

                        if (!targetDate || isNaN(targetDate.getTime())) {
                          return <button {...buttonProps} />;
                        }

                        const dateStr = format(targetDate, "yyyy-MM-dd");
                        const todayStr = format(today, "yyyy-MM-dd");

                        const isPast = dateStr < todayStr;
                        const isUnavail = isDateUnavailable(targetDate);
                        const datePrice = getPriceForDate(targetDate);
                        const isCustom = customPrices[dateStr] !== undefined;
                        const isEdge = modifiers.range_start || modifiers.range_end;
                        const isMid = modifiers.range_middle;
                        const isDisabled = isPast || isUnavail;

                        // ── Détecte si ce jour disponible est dans un range
                        //    qui traverse une date bloquée (feedback visuel hover).
                        //    Dans ce cas, on empêche la sélection et on affiche
                        //    un curseur "interdit" même sur les jours disponibles
                        //    qui seraient après la date bloquée.
                        const rangeFromStr = range?.from
                          ? format(range.from, "yyyy-MM-dd")
                          : null;
                        let isAfterBlockInRange = false;
                        if (rangeFromStr && !range?.to && dateStr > rangeFromStr) {
                          try {
                            const preview = eachDayOfInterval({
                              start: range!.from!,
                              end: targetDate,
                            });
                            isAfterBlockInRange = preview.some(
                              (d) =>
                                format(d, "yyyy-MM-dd") !== dateStr &&
                                format(d, "yyyy-MM-dd") !== rangeFromStr &&
                                isDateUnavailable(d)
                            );
                          } catch {
                            // ignore
                          }
                        }

                        return (
                          <button
                            {...buttonProps}
                            disabled={isDisabled || buttonProps.disabled}
                            style={{ height: "52px", borderRadius: 0 }}
                            data-unavailable={isUnavail ? "true" : undefined}
                            title={
                              isUnavail
                                ? lang === "fr"
                                  ? "Date non disponible"
                                  : "Date unavailable"
                                : isAfterBlockInRange
                                ? lang === "fr"
                                  ? "Une date bloquée est dans cet intervalle"
                                  : "A blocked date is within this range"
                                : undefined
                            }
                            className={[
                              "rdp-day_button w-full flex flex-col items-center justify-center gap-0.5 relative transition-all",
                              isPast
                                ? "opacity-25 cursor-default pointer-events-none border border-transparent"
                                : "",
                              !isPast && isUnavail
                                ? "bg-rose-950/30 border border-rose-800/40 cursor-not-allowed pointer-events-none"
                                : "",
                              // Jour dispo mais après une date bloquée dans le range hover
                              !isPast && !isUnavail && isAfterBlockInRange
                                ? "opacity-40 cursor-not-allowed border border-rose-900/30"
                                : "",
                              !isPast && !isUnavail && !isEdge && !isMid && !isAfterBlockInRange
                                ? "border border-neutral-800 hover:border-neutral-500 hover:bg-neutral-900"
                                : "",
                            ].join(" ")}
                          >
                            {/* Croix sur indispo */}
                            {!isPast && isUnavail && (
                              <span
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                aria-hidden
                              >
                                <span className="absolute w-4 h-[1px] bg-rose-600 rotate-45" />
                                <span className="absolute w-4 h-[1px] bg-rose-600 -rotate-45" />
                              </span>
                            )}

                            {/* Numéro jour */}
                            <span
                              className={[
                                "text-xs font-semibold leading-none z-10",
                                isPast
                                  ? "text-neutral-600 line-through"
                                  : isUnavail
                                  ? "text-rose-700"
                                  : isEdge
                                  ? "text-black"
                                  : "text-white",
                              ].join(" ")}
                            >
                              {targetDate.getDate()}
                            </span>

                            {/* Prix */}
                            {!isPast && !isUnavail && (
                              <span
                                className={[
                                  "text-[8px] font-mono leading-none z-10",
                                  isEdge
                                    ? "text-black/60 font-bold"
                                    : isMid
                                    ? "text-neutral-500"
                                    : isCustom
                                    ? "text-amber-400 font-bold"
                                    : "text-neutral-600",
                                ].join(" ")}
                              >
                                {datePrice} DT
                              </span>
                            )}
                          </button>
                        );
                      },
                    }}
                  />
                </div>

                {/* Dates sélectionnées */}
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6 text-center">
                  <div className="p-3 bg-neutral-900/50 border border-neutral-800">
                    <p className="text-[10px] tracking-widest uppercase text-neutral-400">
                      {t.booking.checkIn}
                    </p>
                    <p className="text-sm font-medium mt-1 text-white">
                      {range?.from
                        ? format(range.from, "dd MMMM yyyy", {
                            locale: lang === "fr" ? fr : enUS,
                          })
                        : "—"}
                    </p>
                  </div>
                  <div className="p-3 bg-neutral-900/50 border border-neutral-800">
                    <p className="text-[10px] tracking-widest uppercase text-neutral-400">
                      {t.booking.checkOut}
                    </p>
                    <p className="text-sm font-medium mt-1 text-white">
                      {range?.to
                        ? format(range.to, "dd MMMM yyyy", {
                            locale: lang === "fr" ? fr : enUS,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── ÉTAPE 2 : Formulaire ── */}
              <div className="border border-neutral-800 p-6 md:p-8 bg-neutral-900/20 shadow-sm">
                <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 text-neutral-200">
                  {t.booking.step2}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <Field label={t.contact.firstName} required>
                      <input
                        required
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({ ...formData, firstName: e.target.value })
                        }
                        className={inputCls}
                        placeholder={t.contact.firstName}
                      />
                    </Field>
                    <Field label={t.contact.lastName} required>
                      <input
                        required
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        className={inputCls}
                        placeholder={t.contact.lastName}
                      />
                    </Field>
                    <Field label={t.contact.email} required>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className={inputCls}
                        placeholder="exemple@domaine.com"
                      />
                    </Field>
                    <Field label={t.contact.phone} required>
                      <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className={inputCls}
                        placeholder="---- -- --- ---"
                      />
                    </Field>
                    <Field label={t.booking.guests}>
                      <select
                        value={formData.guests}
                        onChange={(e) =>
                          setFormData({ ...formData, guests: e.target.value })
                        }
                        className={inputCls}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option
                            key={n}
                            value={n}
                            className="bg-neutral-900 text-white"
                          >
                            {n}{" "}
                            {n > 1
                              ? t.booking.guestsPlaceholderPlural
                              : t.booking.guestsPlaceholder}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <Field label={t.booking.specialRequests}>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className={inputCls}
                      placeholder={t.booking.specialRequestsPlaceholder}
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={sent || !range?.from || !range?.to}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {sent ? (
                      <>
                        <Check className="h-4 w-4 text-black" />
                        {t.booking.submitSending}
                      </>
                    ) : (
                      t.booking.submitDirect
                    )}
                  </button>
                </form>
              </div>
            </div>

          ) : (
            /* ── Airbnb ── */
            <div className="lg:col-span-8">
              <div className="p-8 md:p-12 border-2 border-[#FF5A5F] bg-[#FF5A5F]/5 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-xs tracking-[0.3em] uppercase text-[#FF5A5F] font-bold mb-4">
                  {t.booking.airbnbHeading}
                </div>
                <h2 className="font-display text-3xl md:text-4xl mb-6 text-white tracking-tight">
                  {t.booking.airbnbMainText}
                </h2>
                <p className="text-sm text-neutral-400 mb-10 leading-relaxed max-w-xl">
                  {t.booking.airbnbLongDesc}
                </p>
                <a
                  href={AIRBNB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-4 bg-[#FF5A5F] text-white font-bold px-10 py-5 text-xs tracking-[0.25em] uppercase hover:bg-[#e04f54] transition-all duration-300 shadow-xl shadow-[#FF5A5F]/20 hover:scale-[1.03]"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t.booking.airbnbAction}
                </a>
              </div>
            </div>
          )}

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-4 space-y-6">

            {/* Récap financier */}
            {bookingMethod === "direct" &&
              range?.from &&
              range?.to &&
              totalNights > 0 && (
                <div className="p-6 border border-white bg-neutral-900/90 shadow-xl space-y-4 animate-scale-up">
                  <div className="text-[10px] tracking-[0.25em] uppercase text-amber-400 font-bold border-b border-neutral-800 pb-2">
                    {lang === "fr"
                      ? "Détail de votre tarification"
                      : "Your pricing breakdown"}
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-2 pr-1 text-xs text-neutral-400">
                    {priceBreakdowns.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center"
                      >
                        <span>
                          {lang === "fr" ? "Nuit du " : "Night of "}
                          {format(item.date, "dd MMM yyyy", {
                            locale: lang === "fr" ? fr : enUS,
                          })}
                        </span>
                        <span className="font-mono text-white">
                          {item.price} DT
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-neutral-800 pt-3 flex justify-between items-baseline">
                    <span className="text-xs text-neutral-300">
                      Total ({totalNights}{" "}
                      {totalNights > 1
                        ? lang === "fr"
                          ? "nuits"
                          : "nights"
                        : lang === "fr"
                        ? "nuit"
                        : "night"}
                      ) :
                    </span>
                    <span className="text-2xl font-display font-bold text-white font-mono">
                      {totalPrice} DT
                    </span>
                  </div>
                </div>
              )}

            {/* Infos contact */}
            <div className="p-6 border border-neutral-800 space-y-6 bg-neutral-900/40 backdrop-blur-sm">
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold mb-2">
                  {t.booking.asideTitle}
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.booking.asideDesc}
                </p>
              </div>
              <ul className="space-y-3 text-xs border-t border-neutral-800 pt-4">
                <li className="flex items-center gap-3 text-neutral-300">
                  <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                  Avenue de la Plage, Hammamet
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <Phone className="h-3.5 w-3.5 text-neutral-500" />
                  +216 72 000 000
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <Mail className="h-3.5 w-3.5 text-neutral-500" />
                  experience@bnb-villa.com
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </SiteLayout>
  );
}

// ─── Styles utilitaires ───────────────────────────────────────────────────────
const inputCls =
  "w-full bg-neutral-900/50 border border-neutral-800 text-white focus:border-white transition px-4 py-3.5 text-sm outline-none placeholder:text-neutral-600 appearance-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] tracking-[0.25em] uppercase text-neutral-400 font-bold">
        {label}{" "}
        {required && <span className="text-neutral-500">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}