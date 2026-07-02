// ============================================
// Component: AvailabilityCalendar — v5.1
// @/components/AvailabilityCalendar.tsx
//
// NOUVEAUTÉS v5.1 :
//  • Fix : le mode ADMIN distingue maintenant lui aussi les jours de
//    transition (checkout du client précédent = ambre) des jours
//    totalement bloqués (rouge) — la même logique que le mode visiteur.
//  • Gestion des "jours de transition" (turnover days) façon Airbnb :
//    un jour peut être sélectionnable en DÉPART uniquement (arrivée
//    bloquée, départ libre) ou en ARRIVÉE uniquement (inverse).
//  • departureBlocked (champ API) piloté séparément de available.
// ============================================

import { useEffect, useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Lock, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLang } from '@/i18n/LanguageContext';
import { useNavigate } from '@tanstack/react-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfToday,
} from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CalendarDay {
  date: string;
  day: number;
  available: boolean;
  departureBlocked?: boolean;
}

interface PriceData {
  nights: number;
  pricePerNight: number;
  totalPrice: number;
}

interface MonthBlock {
  year: number;
  month: number;
  days: CalendarDay[];
  firstDayOfWeek: number;
}

export interface AvailabilityCalendarProps {
  isAdmin?: boolean;
  onRequestBlock?: (date: string) => void;
  onRequestUnblock?: (date: string) => void;
  manuallyBlockedDates?: Set<string>;
  blockNotes?: Record<string, string>;
}

// ─── Constantes ──────────────────────────────────────────────────────────────
const TODAY = startOfToday();
const TODAY_STR = format(TODAY, 'yyyy-MM-dd');

// ─── Composant ───────────────────────────────────────────────────────────────
export function AvailabilityCalendar({
  isAdmin = false,
  onRequestBlock,
  onRequestUnblock,
  manuallyBlockedDates = new Set(),
  blockNotes = {},
}: AvailabilityCalendarProps) {
  const { lang } = useLang();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [months, setMonths] = useState<MonthBlock[]>([]);
  const [loading, setLoading] = useState(false);

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [priceInfo, setPriceInfo] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [blockedModal, setBlockedModal] = useState<{
    open: boolean;
    message: string;
  }>({ open: false, message: '' });

  const [basePrice, setBasePrice] = useState<number>(1500);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const [unavailableDatesFromApi, setUnavailableDatesFromApi] = useState<Set<string>>(new Set());
  const [departureBlockedDatesFromApi, setDepartureBlockedDatesFromApi] = useState<Set<string>>(new Set());

  const unavailableDateSet = useMemo(
    () => new Set([...unavailableDatesFromApi, ...manuallyBlockedDates]),
    [unavailableDatesFromApi, manuallyBlockedDates]
  );

  const isPast = (dateStr: string) => dateStr < TODAY_STR;

  const isBlockedOrUnavailable = useCallback(
    (dateStr: string) => unavailableDateSet.has(dateStr),
    [unavailableDateSet]
  );

  const getPriceForDate = useCallback(
    (dateStr: string): number =>
      customPrices[dateStr] !== undefined ? customPrices[dateStr] : basePrice,
    [customPrices, basePrice]
  );

  const buildMonthBlock = (year: number, month: number, data: CalendarDay[]): MonthBlock => ({
    year,
    month,
    days: data,
    firstDayOfWeek: new Date(year, month - 1, 1).getDay(),
  });

  const getBlockedMessage = useCallback(
    (dateStr: string): string => {
      const d = new Date(dateStr + 'T00:00:00');
      const formatted = d.toLocaleDateString(
        lang === 'fr' ? 'fr-FR' : 'en-US',
        { day: '2-digit', month: 'long', year: 'numeric' }
      );
      return lang === 'fr'
        ? `Le ${formatted} est non disponible. Vous pouvez choisir une autre date.`
        : `${formatted} is not available. You can choose another date.`;
    },
    [lang]
  );

  // ── Fetch deux mois ───────────────────────────────────────────────────────
  const fetchTwoMonths = useCallback(async (base: Date) => {
    setLoading(true);
    setError(null);
    try {
      const m1 = base;
      const m2 = addMonths(base, 1);
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/availability/calendar?year=${m1.getFullYear()}&month=${m1.getMonth() + 1}`),
        fetch(`${API_BASE}/availability/calendar?year=${m2.getFullYear()}&month=${m2.getMonth() + 1}`),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      

      const allDays = [...(d1.data || []), ...(d2.data || [])];

      const apiUnavailable = new Set<string>(
        allDays
          .filter((d: { available: boolean }) => !d.available)
          .map((d: { date: string }) => d.date)
      );
      setUnavailableDatesFromApi(apiUnavailable);

      const apiDepartureBlocked = new Set<string>(
        allDays
          .filter((d: any) => d.departureBlocked)
          .map((d: { date: string }) => d.date)
      );
      setDepartureBlockedDatesFromApi(apiDepartureBlocked);

      setMonths([
        buildMonthBlock(m1.getFullYear(), m1.getMonth() + 1, d1.data || []),
        buildMonthBlock(m2.getFullYear(), m2.getMonth() + 1, d2.data || []),
      ]);
    } catch {
      setError(lang === 'fr' ? 'Erreur de connexion' : 'Connection error');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, lang]);

  const fetchPrices = useCallback(async (base: Date) => {
    setLoadingPrices(true);
    setCustomPrices({});
    try {
      const start = format(startOfMonth(base), 'yyyy-MM-dd');
      const end = format(endOfMonth(addMonths(base, 1)), 'yyyy-MM-dd');
      const res = await fetch('${API_BASE}/settings/prices/range?start=${start}&end=${end}');
      const result = await res.json();
      if (result.success) {
        setBasePrice(result.basePrice);
        setCustomPrices(result.customPrices || {});
      }
    } catch (err) {
      console.error('Erreur tarifs:', err);
    } finally {
      setLoadingPrices(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchTwoMonths(currentDate);
    fetchPrices(currentDate);
  }, [currentDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPrevMonth = () => setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() - 1));
  const goToNextMonth = () => setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() + 1));

  // ── Validation du range : nuits bloquées entre from et to (exclusif),
  //    + le "to" lui-même via departureBlocked (pas via available/arrivée) ──
  const findBlockedInRange = useCallback(
    (from: string, to: string): string | null => {
      const cursor = new Date(from + 'T00:00:00');
      const end = new Date(to + 'T00:00:00');
      cursor.setDate(cursor.getDate() + 1);
      while (cursor < end) {
        const ds = format(cursor, 'yyyy-MM-dd');
        if (isBlockedOrUnavailable(ds)) return ds;
        cursor.setDate(cursor.getDate() + 1);
      }
      if (departureBlockedDatesFromApi.has(to)) return to;
      return null;
    },
    [isBlockedOrUnavailable, departureBlockedDatesFromApi]
  );

  // ── Clic date ─────────────────────────────────────────────────────────────
  const handleDateClick = useCallback(
    (day: CalendarDay) => {
      if (isAdmin) {
        if (manuallyBlockedDates.has(day.date)) {
          onRequestUnblock?.(day.date);
        } else if (day.available && !isPast(day.date)) {
          onRequestBlock?.(day.date);
        }
        return;
      }

      if (isPast(day.date)) return;

      const canArrive = day.available;
      const canDepart = !departureBlockedDatesFromApi.has(day.date);

      if (!checkIn || (checkIn && checkOut)) {
        if (!canArrive) return;
        setCheckIn(day.date);
        setCheckOut(null);
        setPriceInfo(null);
        return;
      }

      if (day.date <= checkIn) {
        if (!canArrive) return;
        setCheckIn(day.date);
        setCheckOut(null);
        setPriceInfo(null);
        return;
      }

      if (!canDepart) return;

      const blockedInRange = findBlockedInRange(checkIn, day.date);
      if (blockedInRange) {
        const msg = getBlockedMessage(blockedInRange);
        setBlockedModal({ open: true, message: msg });
        setCheckOut(null);
        setPriceInfo(null);
        return;
      }

      setCheckOut(day.date);
      const cursor = new Date(checkIn + 'T00:00:00');
      const end = new Date(day.date + 'T00:00:00');
      let total = 0;
      let nights = 0;
      while (cursor < end) {
        total += getPriceForDate(format(cursor, 'yyyy-MM-dd'));
        nights++;
        cursor.setDate(cursor.getDate() + 1);
      }
      setPriceInfo({
        nights,
        pricePerNight: nights > 0 ? Math.round(total / nights) : basePrice,
        totalPrice: total,
      });
    },
    [
      isAdmin, checkIn, checkOut,
      manuallyBlockedDates, onRequestBlock, onRequestUnblock,
      departureBlockedDatesFromApi, findBlockedInRange,
      getBlockedMessage, getPriceForDate, basePrice,
    ]
  );

  // ── Hover ─────────────────────────────────────────────────────────────────
  const handleMouseEnter = useCallback(
    (day: CalendarDay) => {
      if (isAdmin || !checkIn || checkOut) return;
      if (isPast(day.date)) return;
      setHoverDate(day.date);
    },
    [isAdmin, checkIn, checkOut]
  );

  const effectiveEnd = checkOut ?? hoverDate;

  const isInRange = useCallback(
    (d: string) => {
      if (!checkIn || !effectiveEnd) return false;
      const [lo, hi] = checkIn < effectiveEnd ? [checkIn, effectiveEnd] : [effectiveEnd, checkIn];
      return d > lo && d < hi;
    },
    [checkIn, effectiveEnd]
  );

  const isEdge = (d: string) => d === checkIn || d === checkOut;

  // ── Feedback visuel hover : ce jour est-il inatteignable comme checkout ? ──
  const isAfterBlockInHoverRange = useCallback(
    (dateStr: string): boolean => {
      if (!checkIn || checkOut || !hoverDate) return false;
      if (dateStr <= checkIn) return false;
      if (departureBlockedDatesFromApi.has(dateStr)) return true;
      const cursor = new Date(checkIn + 'T00:00:00');
      const target = new Date(dateStr + 'T00:00:00');
      cursor.setDate(cursor.getDate() + 1);
      while (cursor < target) {
        const ds = format(cursor, 'yyyy-MM-dd');
        if (isBlockedOrUnavailable(ds)) return true;
        cursor.setDate(cursor.getDate() + 1);
      }
      return false;
    },
    [checkIn, checkOut, hoverDate, isBlockedOrUnavailable, departureBlockedDatesFromApi]
  );

  const formatMonthLabel = (year: number, month: number) =>
    new Date(year, month - 1, 1).toLocaleDateString(
      lang === 'fr' ? 'fr-FR' : 'en-US',
      { month: 'long', year: 'numeric' }
    );

  const weekDays = lang === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleBook = () => {
    if (!checkIn || !checkOut) return;
    navigate({ to: '/booking', search: { checkIn, checkOut } });
  };

  // ── Rendu d'un mois ───────────────────────────────────────────────────────
  const renderMonth = (block: MonthBlock) => (
    <div key={'${block.year}-${block.month}'} className="flex-1 min-w-[280px]">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-center mb-4 capitalize text-stone-700 dark:text-stone-300">
        {formatMonthLabel(block.year, block.month)}
      </h3>

      <div className="grid grid-cols-7 gap-0.5">
        {weekDays.map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-[9px] font-bold text-stone-400 uppercase tracking-wider">
            {d}
          </div>
        ))}

        {Array(block.firstDayOfWeek).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="h-12" />
        ))}

        {block.days.map(day => {
          const past = isPast(day.date);
          const unavailable = !day.available;
          const manuallyBlocked = manuallyBlockedDates.has(day.date);
          const isUnavailForVisitor = unavailable || manuallyBlocked;
          const note = blockNotes[day.date];
          const price = getPriceForDate(day.date);
          const isCustomPrice = customPrices[day.date] !== undefined;
          const edge = isEdge(day.date);
          const inRange = isInRange(day.date);
          const isCheckInDay = day.date === checkIn;
          const isCheckOutDay = day.date === checkOut;
          const departBlocked = !!day.departureBlocked;

          const afterBlock = !isAdmin && !past && !isUnavailForVisitor
            ? isAfterBlockInHoverRange(day.date)
            : false;

          let cellClass = '';
          let dayNumClass = '';
          let priceClass = '';
          let disabled = false;
          let titleAttr = '';

          if (past) {
            cellClass = 'bg-transparent cursor-default opacity-30';
            dayNumClass = 'text-stone-400 line-through decoration-stone-300';
            priceClass = 'hidden';
            disabled = true;

          } else if (edge) {
            // La sélection en cours prime toujours sur le statut brut
            cellClass = 'bg-stone-950 dark:bg-white ring-2 ring-stone-950 dark:ring-white z-10 cursor-pointer';
            dayNumClass = 'text-white dark:text-stone-950 font-bold';
            priceClass = 'text-stone-400 dark:text-stone-600';

          } else if (manuallyBlocked && isAdmin) {
            cellClass = 'bg-violet-50 dark:bg-violet-950/40 border border-violet-300 dark:border-violet-700 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-900/50 group';
            dayNumClass = 'text-violet-700 dark:text-violet-300 font-bold';
            priceClass = 'hidden';
            titleAttr = note ? `🔒 ${note}` : '🔒 Bloqué manuellement — cliquer pour débloquer';

          } else if (isUnavailForVisitor && !isAdmin) {
            if (!departBlocked) {
              // Arrivée bloquée, mais départ possible → "date de départ uniquement"
              const clickableAsCheckout = !!checkIn && !checkOut && day.date > checkIn;
              cellClass = clickableAsCheckout
                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40'
                : 'bg-stone-100 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 cursor-not-allowed opacity-70';
              dayNumClass = 'text-stone-500 dark:text-stone-400';
              priceClass = 'hidden';
              disabled = !clickableAsCheckout;
              titleAttr = lang === 'fr' ? 'Date de départ uniquement' : 'Departure date only';
            } else {
              // Totalement bloqué
              cellClass = 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 cursor-not-allowed';
              dayNumClass = 'text-rose-400 dark:text-rose-500';
              priceClass = 'hidden';
              disabled = true;
            }

          } else if (unavailable && isAdmin) {
            if (departBlocked) {
              // Totalement bloqué : arrivée ET départ impossibles
              cellClass = 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 cursor-not-allowed opacity-70';
              dayNumClass = 'text-red-500 dark:text-red-400';
              titleAttr = 'Réservé par un client';
            } else {
              // ✅ Jour de transition : checkout du client précédent
              cellClass = 'bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700 cursor-not-allowed opacity-80';
              dayNumClass = 'text-amber-600 dark:text-amber-400';
              titleAttr = 'Date de départ du client précédent (checkout)';
            }
            priceClass = 'hidden';
            disabled = true;

          } else if (afterBlock) {
            cellClass = 'bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/40 opacity-40 cursor-not-allowed transition-all';
            dayNumClass = 'text-stone-500 dark:text-stone-400';
            priceClass = 'hidden';
            titleAttr = lang === 'fr'
              ? 'Une date non disponible est dans cet intervalle'
              : 'An unavailable date is within this range';

          } else if (inRange) {
            cellClass = 'bg-stone-100 dark:bg-stone-800/60 cursor-pointer';
            dayNumClass = 'text-stone-800 dark:text-stone-200';
            priceClass = 'text-stone-500 dark:text-stone-400';

          } else {
            cellClass = isAdmin
              ? 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 cursor-pointer hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group'
              : 'bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 hover:border-stone-800 dark:hover:border-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer transition-all';
            dayNumClass = 'text-stone-800 dark:text-stone-200';
            priceClass = isCustomPrice
              ? 'text-amber-500 font-bold'
              : 'text-stone-400 dark:text-stone-500';
            if (isAdmin) titleAttr = 'Cliquer pour bloquer cette date';
            if (!isAdmin && departBlocked) {
              titleAttr = lang === 'fr' ? "Date d'arrivée uniquement" : 'Arrival date only';
            }
          }

          const label = isCheckInDay
            ? (lang === 'fr' ? 'Arrivée' : 'In')
            : isCheckOutDay
            ? (lang === 'fr' ? 'Départ' : 'Out')
            : null;

          return (
            <button
              key={day.date}
              onClick={() => !disabled && !afterBlock && handleDateClick(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              onMouseLeave={() => setHoverDate(null)}
              disabled={disabled}
              aria-label={day.date}
              title={titleAttr}
              className={cn(
                'h-12 flex flex-col items-center justify-center gap-0.5 rounded-none relative select-none',
                cellClass
              )}
            >
              {/* Croix uniquement sur les dates TOTALEMENT bloquées */}
              {isUnavailForVisitor && !past && !isAdmin && !edge && departBlocked && (
                <span aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-5 h-[1.5px] bg-rose-300 dark:bg-rose-700 rotate-45" />
                  <span className="absolute w-5 h-[1.5px] bg-rose-300 dark:bg-rose-700 -rotate-45" />
                </span>
              )}

              {/* Croix côté admin, uniquement sur les dates totalement bloquées */}
              {unavailable && isAdmin && !past && departBlocked && (
                <span aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="absolute w-5 h-[1.5px] bg-red-300 dark:bg-red-700 rotate-45" />
                  <span className="absolute w-5 h-[1.5px] bg-red-300 dark:bg-red-700 -rotate-45" />
                </span>
              )}

              {manuallyBlocked && isAdmin && (
                <Lock size={10} className="absolute top-1 right-1 text-violet-500 dark:text-violet-400" aria-hidden />
              )}

              {!manuallyBlocked && !unavailable && !past && isAdmin && (
                <Lock size={9} className="absolute top-1 right-1 text-stone-300 dark:text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
              )}

              <span className={cn('text-xs font-semibold leading-none z-10', dayNumClass)}>
                {day.day}
              </span>

              {!past && !isUnavailForVisitor && !isAdmin && !afterBlock && !edge && (
                <span className={cn('text-[8px] font-mono leading-none z-10', priceClass)}>
                  {price} DT
                </span>
              )}

              {!past && !unavailable && !manuallyBlocked && isAdmin && (
                <span className={cn('text-[8px] font-mono leading-none z-10', priceClass)}>
                  {price} DT
                </span>
              )}

              {label && (
                <span className="absolute bottom-0 left-0 right-0 text-[7px] text-center font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 leading-none pb-0.5">
                  {label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // ── Rendu principal ───────────────────────────────────────────────────────
  return (
    <div className={cn('w-full', !isAdmin && 'max-w-4xl mx-auto p-6 md:p-8 border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 shadow-sm')}>

      {blockedModal.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-6 max-w-sm w-full shadow-2xl rounded-2xl relative">
            <button
              onClick={() => setBlockedModal({ open: false, message: '' })}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition"
            >
              <X size={18} />
            </button>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 mb-2">
                  {lang === 'fr' ? 'Date non disponible' : 'Date unavailable'}
                </h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                  {blockedModal.message}
                </p>
              </div>
              <button
                onClick={() => setBlockedModal({ open: false, message: '' })}
                className="w-full py-3 bg-stone-950 dark:bg-white text-white dark:text-stone-950 text-xs font-bold uppercase tracking-widest hover:bg-stone-800 dark:hover:bg-stone-200 transition rounded-xl"
              >
                {lang === 'fr' ? 'Choisir une autre date' : 'Choose another date'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-display">
            {lang === 'fr' ? 'Vérifier la disponibilité' : 'Check Availability'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            {lang === 'fr'
              ? "Sélectionnez votre date d'arrivée puis votre départ."
              : 'Select your check-in date, then your check-out.'}
          </p>
        </div>
      )}

      {!isAdmin && checkIn && !checkOut && (
        <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          {lang === 'fr'
            ? "Sélectionnez maintenant votre date de départ."
            : "Now select your check-out date."}
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {!isAdmin && priceInfo && checkIn && checkOut && (
        <div className="mb-6 p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-stone-500">
              {priceInfo.nights}{' '}
              {lang === 'fr' ? (priceInfo.nights > 1 ? 'nuits' : 'nuit') : (priceInfo.nights > 1 ? 'nights' : 'night')}
            </span>
            <span className="text-xl font-bold dark:text-white">{priceInfo.totalPrice} DT</span>
          </div>
          <p className="text-[10px] text-stone-400 mb-4">
            {lang === 'fr' ? 'Tarif calculé selon les prix en vigueur' : 'Price calculated based on current rates'}
          </p>
          <button
            onClick={handleBook}
            className="w-full bg-stone-950 dark:bg-white text-white dark:text-stone-950 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            {lang === 'fr' ? 'Réserver ces dates' : 'Book these dates'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevMonth}
          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Mois précédent"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          {(loadingPrices || loading) && (
            <span className="text-[10px] text-stone-400 animate-pulse">
              {lang === 'fr' ? 'Chargement...' : 'Loading...'}
            </span>
          )}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          aria-label="Mois suivant"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className={cn('transition-opacity duration-200', loading || loadingPrices ? 'opacity-50 pointer-events-none' : 'opacity-100')}>
        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {months.map(renderMonth)}
        </div>
      </div>

      {!isAdmin && (
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-4 text-[10px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 inline-block" />
            {lang === 'fr' ? 'Disponible' : 'Available'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-700 inline-block" />
            {lang === 'fr' ? 'Indisponible' : 'Unavailable'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 inline-block" />
            {lang === 'fr' ? 'Départ uniquement' : 'Departure only'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 opacity-30 bg-stone-300 inline-block" />
            {lang === 'fr' ? 'Passé' : 'Past'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-stone-950 dark:bg-white inline-block" />
            {lang === 'fr' ? 'Sélectionné' : 'Selected'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-500 font-bold">DT</span>
            {lang === 'fr' ? 'Tarif spécial' : 'Special rate'}
          </span>
        </div>
      )}

      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex flex-wrap gap-4 text-[10px] text-stone-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-white border border-stone-200 inline-block" />
            Disponible — cliquer pour bloquer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-violet-100 border border-violet-300 inline-block" />
            Bloqué manuellement — cliquer pour débloquer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-100 border border-red-200 inline-block" />
            Réservé (client)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-amber-100 border border-amber-300 inline-block" />
            Checkout du client précédent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 opacity-30 bg-stone-300 inline-block" />
            Passé
          </span>
        </div>
      )}
        </div>
  );
};
