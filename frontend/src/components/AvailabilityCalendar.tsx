// ============================================
// Component: AvailabilityCalendar (Bilingue + Tarifs Dynamiques)
// @/components/AvailabilityCalendar.tsx
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/i18n/LanguageContext';
import { useNavigate } from '@tanstack/react-router';
import { format, startOfMonth, endOfMonth, addMonths } from 'date-fns';

interface CalendarDay {
  date: string;
  day: number;
  available: boolean;
}

interface PriceData {
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

interface AvailabilityCalendarProps {
  isAdmin?: boolean;
  onUpdate?: () => void;
}

export function AvailabilityCalendar({ isAdmin = false, onUpdate }: AvailabilityCalendarProps) {
  const { lang } = useLang();
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // État calendrier
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);

  // État sélection dates
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // État tarifs dynamiques
  const [basePrice, setBasePrice] = useState<number>(150);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // ─── Fetch disponibilités ───────────────────────────────────────────────────
  const fetchCalendar = useCallback(async (month: Date) => {
    setLoading(true);
    try {
      const year = month.getFullYear();
      const monthNum = month.getMonth() + 1;
      const response = await fetch(
        `${API_BASE}/availability/calendar?year=${year}&month=${monthNum}`
      );
      const data = await response.json();
      setCalendar(data.data || []);
    } catch {
      setError(lang === 'fr' ? 'Erreur de connexion' : 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, lang]);

  // ─── Fetch tarifs dynamiques ────────────────────────────────────────────────
  const fetchPrices = useCallback(async (month: Date) => {
    setLoadingPrices(true);
    setCustomPrices({});
    try {
      const start = format(startOfMonth(month), 'yyyy-MM-dd');
      const end = format(endOfMonth(addMonths(month, 1)), 'yyyy-MM-dd');
      const res = await fetch(
        `${API_BASE}/settings/prices/range?start=${start}&end=${end}`
      );
      const result = await res.json();
      if (result.success) {
        setBasePrice(result.basePrice);
        setCustomPrices(result.customPrices || {});
      }
    } catch (err) {
      console.error('Erreur chargement tarifs:', err);
    } finally {
      setLoadingPrices(false);
    }
  }, [API_BASE]);

  // ─── Déclenchement unique sur changement de mois ────────────────────────────
  useEffect(() => {
    fetchCalendar(currentDate);
    fetchPrices(currentDate);
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Utilitaire prix ────────────────────────────────────────────────────────
  const getPriceForDate = useCallback((dateStr: string): number => {
    return customPrices[dateStr] !== undefined ? customPrices[dateStr] : basePrice;
  }, [customPrices, basePrice]);

  // ─── Navigation mois ────────────────────────────────────────────────────────
  const goToPrevMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  const goToNextMonth = () =>
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));

  // ─── Redirection vers /booking ──────────────────────────────────────────────
  const handleRedirectToContact = () => {
    if (!checkIn || !checkOut) return;
    navigate({
      to: '/booking',
      search: { checkIn, checkOut },
    });
  };

  // ─── Admin : toggle disponibilité ──────────────────────────────────────────
  const toggleAvailability = async (day: CalendarDay) => {
    const oldCalendar = [...calendar];
    setCalendar(prev =>
      prev.map(d => d.date === day.date ? { ...d, available: !d.available } : d)
    );
    try {
      const response = await fetch(`${API_BASE}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: day.date, available: !day.available }),
      });
      if (!response.ok) throw new Error();
      if (onUpdate) onUpdate();
    } catch {
      setCalendar(oldCalendar);
      setError('Erreur lors de la mise à jour');
    }
  };

  // ─── Clic sur une date — calcul 100% local avec customPrices ───────────────
  const handleDateClick = (day: CalendarDay) => {
    if (isAdmin) return toggleAvailability(day);
    if (!day.available) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Première sélection ou reset : on choisit le check-in
      setCheckIn(day.date);
      setCheckOut(null);
      setPriceInfo(null);
    } else {
      // Deuxième sélection : check-out
      if (new Date(day.date) <= new Date(checkIn)) {
        // Si la date cliquée est avant le check-in, on reset et repart
        setCheckIn(day.date);
        setCheckOut(null);
        setPriceInfo(null);
        return;
      }

      setCheckOut(day.date);

      // ✅ Calcul du total entièrement en local avec les customPrices chargés
      const start = new Date(checkIn);
      const end = new Date(day.date);
      const nights: { date: string; price: number }[] = [];

      const cursor = new Date(start);
      while (cursor < end) {
        const dateStr = format(cursor, 'yyyy-MM-dd');
        nights.push({ date: dateStr, price: getPriceForDate(dateStr) });
        cursor.setDate(cursor.getDate() + 1);
      }

      const totalPrice = nights.reduce((sum, n) => sum + n.price, 0);
      const nightCount = nights.length;

      setPriceInfo({
        nights: nightCount,
        pricePerNight: nightCount > 0 ? Math.round(totalPrice / nightCount) : basePrice,
        totalPrice,
      });
    }
  };

  // ─── Helpers UI ─────────────────────────────────────────────────────────────
  const isInRange = (dateStr: string) => {
    if (!checkIn || !checkOut) return false;
    return dateStr > checkIn && dateStr < checkOut;
  };

  const monthName = currentDate.toLocaleDateString(
    lang === 'fr' ? 'fr-FR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  const weekDays =
    lang === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // ─── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={cn(
        'w-full bg-white',
        !isAdmin && 'max-w-2xl mx-auto p-6 border border-border shadow-sm'
      )}
    >
      {!isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-display">
            {lang === 'fr' ? 'Vérifier la disponibilité' : 'Check Availability'}
          </h2>
        </div>
      )}

      {error && <div className="mb-4 text-sm text-red-500">{error}</div>}

      {/* ── Récapitulatif prix + bouton réserver ── */}
      {!isAdmin && priceInfo && checkIn && checkOut && (
        <div className="mb-6 p-4 bg-stone-50 border border-stone-200 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-stone-500">
              {priceInfo.nights}{' '}
              {lang === 'fr'
                ? priceInfo.nights > 1 ? 'nuits' : 'nuit'
                : priceInfo.nights > 1 ? 'nights' : 'night'}
            </span>
            <span className="text-xl font-bold">{priceInfo.totalPrice} DT</span>
          </div>
          <p className="text-[10px] text-stone-400 mb-4">
            {lang === 'fr'
              ? 'Tarif calculé selon les prix en vigueur'
              : 'Price calculated based on current rates'}
          </p>
          <button
            onClick={handleRedirectToContact}
            className="w-full bg-stone-950 text-white py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 transition-colors"
          >
            {lang === 'fr' ? 'Réserver' : 'Book Now'}
          </button>
        </div>
      )}

      {/* ── Navigation mois ── */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold uppercase tracking-widest capitalize">
            {monthName}
          </h3>
          {loadingPrices && (
            <span className="text-[10px] text-stone-400 animate-pulse">
              {lang === 'fr' ? 'Tarifs...' : 'Rates...'}
            </span>
          )}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ── Grille calendrier ── */}
      <div className="grid grid-cols-7 gap-1 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20 text-sm text-stone-400">
            {lang === 'fr' ? 'Chargement...' : 'Loading...'}
          </div>
        )}

        {/* Jours de semaine */}
        {weekDays.map(d => (
          <div
            key={d}
            className="h-10 flex items-center justify-center text-[10px] font-bold text-stone-400 uppercase"
          >
            {d}
          </div>
        ))}

        {/* Cases vides début de mois */}
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={`empty-${i}`} className="h-14 bg-stone-50/30" />
          ))}

        {/* Jours du mois */}
        {calendar.map(day => {
          const price = getPriceForDate(day.date);
          const isCustom = customPrices[day.date] !== undefined;
          const isCheckInOrOut = day.date === checkIn || day.date === checkOut;
          const inRange = isInRange(day.date);

          return (
            <button
              key={day.date}
              onClick={() => handleDateClick(day)}
              disabled={!isAdmin && !day.available}
              className={cn(
                'h-14 flex flex-col items-center justify-center gap-0.5 text-xs font-medium rounded-sm transition-all relative',
                day.available && !isCheckInOrOut && !inRange &&
                  'bg-white border border-stone-100 hover:border-stone-900',
                !day.available && !isAdmin &&
                  'bg-stone-100 text-stone-300 cursor-not-allowed',
                isCheckInOrOut && 'bg-stone-950 text-white z-10',
                inRange && 'bg-stone-100',
                isAdmin && !day.available &&
                  'bg-red-50 text-red-400 border border-red-100 cursor-pointer hover:bg-red-100',
                isAdmin && day.available &&
                  'cursor-pointer hover:bg-stone-50'
              )}
            >
              <span className="leading-none">{day.day}</span>

              {/* Prix dynamique */}
              {!isAdmin && day.available && (
                <span
                  className={cn(
                    'text-[8px] font-mono leading-none transition-colors',
                    isCheckInOrOut  ? 'text-white/70'         :
                    inRange         ? 'text-stone-500'        :
                    isCustom        ? 'text-amber-500 font-bold' :
                                      'text-stone-400'
                  )}
                >
                  {price} DT
                </span>
              )}

              {!day.available && (
                <span className="absolute w-4 h-[1px] bg-current rotate-45" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Légende (mode visiteur uniquement) ── */}
      {!isAdmin && (
        <div className="mt-6 pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-[10px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-white border border-stone-200 inline-block" />
            {lang === 'fr' ? 'Disponible' : 'Available'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-stone-100 inline-block" />
            {lang === 'fr' ? 'Indisponible' : 'Unavailable'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-stone-950 inline-block" />
            {lang === 'fr' ? 'Sélectionné' : 'Selected'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500 font-bold">DT</span>
            {lang === 'fr' ? 'Tarif spécial' : 'Special rate'}
          </span>
        </div>
      )}
    </div>
  );
}