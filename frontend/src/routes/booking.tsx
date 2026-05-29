// ============================================
// Page Booking (Réservation) - Black Édition Luxe
// @/routes/booking.tsx
// ============================================

import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Mail, MapPin, Phone, Check, ExternalLink, Calendar as CalendarIcon, User, Globe, X, AlertTriangle, RefreshCw } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

import { fr, enUS } from "date-fns/locale";
import { format, startOfToday, startOfMonth, endOfMonth, addMonths, eachDayOfInterval } from "date-fns";
import { DayPicker, DateRange, DayButtonProps, DayProps } from "react-day-picker"
import "react-day-picker/src/style.css";

export const Route = createFileRoute("/booking")({
  head: () => ({
    meta: [
      { title: "Réservation — B&B Hammamet" },
      {
        name: "description",
        content: "Sélectionnez votre méthode de réservation préférée pour la villa en exclusivité.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    checkIn: (search.checkIn as string) || undefined,
    checkOut: (search.checkOut as string) || undefined,
  }),
  component: Booking,
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
type CustomPriceMap = Record<string, number>;

function Booking() {
  const { t, lang } = useLang();
  const { checkIn, checkOut } = useSearch({ from: "/booking" });
  const [sent, setSent] = useState(false);
  const [bookingMethod, setBookingMethod] = useState<'direct' | 'airbnb'>('direct');
  const today = startOfToday();
  const [isMounted, setIsMounted] = useState(false);
  // États pour la tarification dynamique
  const [basePrice, setBasePrice] = useState<number>(150);
  const [customPrices, setCustomPrices] = useState<CustomPriceMap>({});
  const [loadingPrices, setLoadingPrices] = useState<boolean>(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  const [modalStatus, setModalStatus] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (checkIn && checkOut) {
      return { from: new Date(checkIn), to: new Date(checkOut) };
    }
    if (checkIn) {
      return { from: new Date(checkIn), to: undefined };
    }
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

  useEffect(() => {
  setIsMounted(true);
}, []);

  const AIRBNB_URL = "https://www.airbnb.com/h/votre-villa-hammamet";

  // Récupération des tarifs depuis le backend avec correction de la désynchronisation
  const loadPricesForMonth = useCallback(async (month: Date) => {
    try {
      setLoadingPrices(true);
      
      // CORRECTION : On vide l'état immédiatement au changement de mois 
      // pour éviter d'associer temporairement les anciens tarifs aux nouvelles dates.
      setCustomPrices({}); 

      const start = format(startOfMonth(month), "yyyy-MM-dd");
      // On va chercher jusqu'à la fin du mois suivant (numberOfMonths={2})
      const end = format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd");

      const res = await fetch(`${API_BASE}/settings/prices/range?start=${start}&end=${end}`);
      const result = await res.json();

      if (result.success) {
        setBasePrice(result.basePrice);
        setCustomPrices(result.customPrices || {});
      }
    } catch (err) {
      console.error("Erreur récupération tarifs:", err);
    } finally {
      setLoadingPrices(false);
    }
  }, []);

  useEffect(() => {
    loadPricesForMonth(displayMonth);
  }, [displayMonth, loadPricesForMonth]);

  // Fonction utilitaire pour obtenir le tarif d'un jour donné
  const getPriceForDate = (date: Date): number => {
    const dateStr = format(date, "yyyy-MM-dd");
    return customPrices[dateStr] !== undefined ? customPrices[dateStr] : basePrice;
  };

  // Calcul du coût total et du détail des nuitées
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
    } catch (e) {
      return { total: 0, nights: 0, breakdowns: [] };
    }
  };

  const { total: totalPrice, nights: totalNights, breakdowns: priceBreakdowns } = calculateTotalDetails();

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
          totalPrice: totalPrice, // Note : Pensez à recalculer et vérifier ce prix côté serveur par sécurité.
        }),
      });

      if (response.ok) {
        setSent(true);
        setRange(undefined);
        setFormData({ firstName: "", lastName: "", email: "", phone: "", guests: "2", message: "" });
        
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
    } catch (error) {
      setModalStatus({
        isOpen: true,
        type: "error",
        title: t.booking.errorConnTitle,
        message: t.booking.errorConnDesc,
      });
      console.error(error);
    }
  };

  return (
    <SiteLayout>
      <div className="bg-neutral-950 text-white min-h-screen font-sans selection:bg-white selection:text-black">

        {/* POPUP / MODALE DE NOTIFICATION */}
        {modalStatus.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 max-w-md w-full shadow-2xl relative animate-scale-up">
              <button 
                onClick={() => setModalStatus(prev => ({ ...prev, isOpen: false }))}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className={`p-4 rounded-full mb-4 border ${
                  modalStatus.type === "success" ? "bg-emerald-950/50 border-emerald-800 text-emerald-400" :
                  modalStatus.type === "warning" ? "bg-amber-950/50 border-amber-800 text-amber-400" :
                  "bg-red-950/50 border-red-800 text-red-400"
                }`}>
                  {modalStatus.type === "success" && <Check className="h-8 w-8" />}
                  {modalStatus.type === "warning" && <AlertTriangle className="h-8 w-8" />}
                  {modalStatus.type === "error" && <X className="h-8 w-8" />}
                </div>

                <h3 className="font-display text-2xl mb-2 text-white">
                  {modalStatus.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed mb-6">
                  {modalStatus.message}
                </p>

                <button
                  onClick={() => setModalStatus(prev => ({ ...prev, isOpen: false }))}
                  className="w-full bg-white text-black py-3 text-xs tracking-widest uppercase font-semibold hover:bg-neutral-200 transition"
                >
                  {t.booking.modalClose}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* En-tête */}
        <section className="container-luxe pt-24 pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">— {t.booking.eyebrow}</div>
              <h1 className="font-display text-5xl md:text-6xl text-white tracking-tight mb-4">{t.booking.title}</h1>
            </div>
            {loadingPrices && <RefreshCw className="h-5 w-5 text-neutral-500 animate-spin hidden sm:block" />}
          </div>
          <p className="text-neutral-400 max-w-2xl text-sm md:text-base leading-relaxed">
            {t.booking.sub}
          </p>
        </section>

        {/* SÉLECTEUR DE MÉTHODE GRAPHIQUE */}
        <section className="container-luxe pb-8">
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl">
            <button
              type="button"
              onClick={() => setBookingMethod('direct')}
              className={`p-6 text-left border transition-all duration-300 relative ${
                bookingMethod === 'direct'
                  ? "border-white bg-neutral-900/60 ring-1 ring-white"
                  : "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 border ${bookingMethod === 'direct' ? "border-white bg-neutral-800 text-white" : "border-neutral-800 text-neutral-400"}`}>
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold tracking-wide uppercase font-display ${bookingMethod === 'direct' ? "text-white" : "text-neutral-400"}`}>
                    {t.booking.directTitle}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {t.booking.directDesc}
                  </p>
                </div>
              </div>
              {bookingMethod === 'direct' && (
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-black bg-white px-2 py-0.5">
                  {t.booking.selected}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setBookingMethod('airbnb')}
              className={`p-6 text-left border transition-all duration-300 relative ${
                bookingMethod === 'airbnb'
                  ? "border-[#FF5A5F] bg-[#FF5A5F] text-white shadow-lg"
                  : "border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 border ${bookingMethod === 'airbnb' ? "border-white/30 bg-white text-[#FF5A5F]" : "border-neutral-800 text-neutral-400"}`}>
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold tracking-wide uppercase font-display ${bookingMethod === 'airbnb' ? "text-white" : "text-neutral-400"}`}>
                    {t.booking.airbnbTitle}
                  </h3>
                  <p className={`text-xs mt-1 leading-relaxed ${bookingMethod === 'airbnb' ? "text-white/80" : "text-neutral-400"}`}>
                    {t.booking.airbnbDesc}
                  </p>
                </div>
              </div>
              {bookingMethod === 'airbnb' && (
                <span className="absolute top-3 right-3 text-[10px] uppercase font-bold tracking-wider text-[#FF5A5F] bg-white px-2 py-0.5">
                  {t.booking.selected}
                </span>
              )}
            </button>
          </div>
        </section>

        {/* ZONE AFFICHAGE CONTENU DYNAMIQUE */}
        <section className="container-luxe pb-32 grid lg:grid-cols-12 gap-12 items-start">
          
          {bookingMethod === 'direct' ? (
            <>
              <div className="lg:col-span-8 space-y-12">
                
                {/* ÉTAPE 1 : LE CALENDRIER DIRECT AVEC PRIX */}
                <div className="border border-neutral-800 p-6 md:p-8 bg-neutral-900/20 shadow-sm">
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase mb-6 flex items-center justify-between text-neutral-200">
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-neutral-400" />
                      {t.booking.step1}
                    </span>
                  </h3>
                  
                  <div className="flex justify-center overflow-x-auto pb-4 custom-calendar-wrapper dark-theme-calendar customer-booking-picker">
                    <style>{`
  /* Conteneur principal */
  .rdp-custom {
    --rdp-cell-size: 40px;
    --rdp-accent-color: #fff;
    --rdp-background-color: #171717;
    margin: 0 auto;
    color: white;
  }

  /* Disposition : Colonne sur mobile, Ligne sur Desktop */
  .rdp-months {
    display: flex !important;
    flex-direction: column !important; /* Mobile d'abord */
    gap: 2rem !important;
  }

  @media (min-width: 768px) {
    .rdp-months {
      flex-direction: row !important; /* Desktop : côte à côte */
    }
  }

  /* Style propre pour les jours de la semaine */
  .rdp-head_cell {
    text-transform: uppercase;
    font-size: 0.7rem;
    color: #737373;
    font-weight: 700;
    padding-bottom: 10px;
  }

  /* Style des cellules */
  .rdp-day {
    border-radius: 0;
    transition: all 0.2s;
  }

  /* Suppression des bordures étranges */
  .rdp-table {
    border-collapse: separate;
    border-spacing: 0;
  }
`}</style>
                    
                    {/* CORRECTION : Transition de fluidité et désactivation des clics durant le chargement asynchrone */}
                    <div className="w-full overflow-x-auto flex justify-center pb-4 custom-calendar-wrapper dark-theme-calendar customer-booking-picker">
  <div className={`transition-all duration-200 ${loadingPrices ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                      <DayPicker
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        month={displayMonth}
                        onMonthChange={setDisplayMonth}
                        locale={lang === "fr" ? fr : enUS}
                        numberOfMonths={2}
                        disabled={{ before: today }}
                        min={1}
                        className="mx-auto text-white"
                        modifiersStyles={{
                          selected: {
                            backgroundColor: "#ffffff",
                            color: "#000000",
                            borderRadius: "0px"
                          },
                          range_middle: {
                            backgroundColor: "#171717",
                            color: "#ffffff"
                          }
                        }}
                        components={{
  DayButton: (props: DayButtonProps) => {
    const { day, modifiers, ...buttonProps } = props;
    const targetDate = day.date;

    if (!targetDate || isNaN(targetDate.getTime())) {
      return <button {...buttonProps} />;
    }

    const datePrice = getPriceForDate(targetDate);
    const dateStr = format(targetDate, "yyyy-MM-dd");
    const isCustom = customPrices[dateStr] !== undefined;

    const isSelected = modifiers.selected || modifiers.range_middle;
    const isEdge = modifiers.range_start || modifiers.range_end;
    const isPast = targetDate < today;

    return (
      <button
        {...buttonProps}  // ✅ spread correct : contient déjà onClick, disabled, etc.
        className="rdp-day_button transition-all relative p-0 flex flex-col items-center justify-center w-full border border-neutral-950/20 hover:bg-neutral-900"
        style={{ height: "54px" }}
        disabled={isPast || buttonProps.disabled}
      >
        <span className={`text-xs font-semibold ${isEdge ? "text-black" : isPast ? "text-neutral-700 line-through" : "text-white"}`}>
          {targetDate.getDate()}
        </span>
        {!isPast && (
          <span className={`text-[8px] mt-0.5 font-mono tracking-tighter ${
            isEdge ? "text-black font-bold" :
            isSelected ? "text-neutral-400" :
            isCustom ? "text-amber-400 font-bold" : "text-neutral-500"
          }`}>
            {datePrice} DT
          </span>
        )}
      </button>
    );
  }
}}
                      />
                    </div>
                    </div>
                  </div>

                  {/* Dates d'entrées et de sorties */}
                  <div className="mt-6 grid grid-cols-2 gap-4 border-t border-neutral-800 pt-6 text-center">
                    <div className="p-3 bg-neutral-900/50 border border-neutral-800">
                      <p className="text-[10px] tracking-widest uppercase text-neutral-400">{t.booking.checkIn}</p>
                      <p className="text-sm font-medium mt-1 text-white">
                        {range?.from ? format(range.from, "dd MMMM yyyy", { locale: lang === "fr" ? fr : enUS }) : "—"}
                      </p>
                    </div>
                    <div className="p-3 bg-neutral-900/50 border border-neutral-800">
                      <p className="text-[10px] tracking-widest uppercase text-neutral-400">{t.booking.checkOut}</p>
                      <p className="text-sm font-medium mt-1 text-white">
                        {range?.to ? format(range.to, "dd MMMM yyyy", { locale: lang === "fr" ? fr : enUS }) : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ÉTAPE 2 : FORMULAIRE */}
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
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className={inputCls}
                          placeholder={t.contact.firstName}
                        />
                      </Field>
                      <Field label={t.contact.lastName} required>
                        <input
                          required
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className={inputCls}
                          placeholder={t.contact.lastName}
                        />
                      </Field>
                      <Field label={t.contact.email} required>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={inputCls}
                          placeholder="exemple@domaine.com"
                        />
                      </Field>
                      <Field label={t.contact.phone}>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={inputCls}
                          placeholder="+216 -- --- ---"
                        />
                      </Field>
                      <Field label={t.booking.guests}>
                        <select
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                          className={inputCls}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                            <option key={n} value={n} className="bg-neutral-900 text-white">
                              {n} {n > 1 ? t.booking.guestsPlaceholderPlural : t.booking.guestsPlaceholder}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field label={t.booking.specialRequests}>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                          <Check className="h-4 w-4 text-black" /> {t.booking.submitSending}
                        </>
                      ) : (
                        t.booking.submitDirect
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
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

          {/* COLONNE COMMUNE : INFOS & RÉCAPITULATIF FINANCIER DYNAMIQUE */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* PANNEAU DE FACTURATION DYNAMIQUE */}
            {bookingMethod === 'direct' && range?.from && range?.to && totalNights > 0 && (
              <div className="p-6 border border-white bg-neutral-900/90 shadow-xl space-y-4 animate-scale-up">
                <div className="text-[10px] tracking-[0.25em] uppercase text-amber-400 font-bold border-b border-neutral-800 pb-2">
                  Détail de votre tarification
                </div>
                
                {/* Liste des nuitées détaillées */}
                <div className="max-h-44 overflow-y-auto space-y-2 pr-1 custom-scrollbar text-xs text-neutral-400">
                  {priceBreakdowns.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <span>Nuit du {format(item.date, "dd MMM yyyy", { locale: lang === "fr" ? fr : enUS })}</span>
                      <span className="font-mono text-white">{item.price} DT</span>
                    </div>
                  ))}
                </div>

                {/* Résumé total */}
                <div className="border-t border-neutral-800 pt-3 flex justify-between items-baseline">
                  <span className="text-xs text-neutral-300">Total ({totalNights} {totalNights > 1 ? 'nuits' : 'nuit'}) :</span>
                  <span className="text-2xl font-display font-bold text-white font-mono">{totalPrice} DT</span>
                </div>
              </div>
            )}

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
                <li className="flex items-center gap-3 text-neutral-300"><MapPin className="h-3.5 w-3.5 text-neutral-500" /> Avenue de la Plage, Hammamet</li>
                <li className="flex items-center gap-3 text-neutral-300"><Phone className="h-3.5 w-3.5 text-neutral-500" /> +216 72 000 000</li>
                <li className="flex items-center gap-3 text-neutral-300"><Mail className="h-3.5 w-3.5 text-neutral-500" /> experience@bnb-villa.com</li>
              </ul>
            </div>
          </aside>

        </section>
      </div>
    </SiteLayout>
  );
}

const inputCls =
  "w-full bg-neutral-900/50 border border-neutral-800 text-white focus:border-white transition px-4 py-3.5 text-sm outline-none placeholder:text-neutral-600 appearance-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.65rem] tracking-[0.25em] uppercase text-neutral-400 font-bold">
        {label} {required && <span className="text-neutral-500"> *</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}