// ─── AdminDateRangePicker.tsx ─────────────────────────────────────────────────
// Calendrier identique à booking.tsx : dates indispo rouge + croix,
// tarifs jour par jour, navigation 2 mois, validation range en temps réel.
// Usage : remplace les deux <input type="date"> dans ReservationModal.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { DayPicker, DateRange, DayButtonProps } from "react-day-picker";
import { fr } from "date-fns/locale";
import {
  format,
  startOfToday,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachDayOfInterval,
} from "date-fns";
import "react-day-picker/src/style.css";
import { AlertTriangle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type CustomPriceMap = Record<string, number>;

interface Props {
  /** Valeur checkIn au format "YYYY-MM-DD" ou "" */
  checkIn: string;
  /** Valeur checkOut au format "YYYY-MM-DD" ou "" */
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}

export function AdminDateRangePicker({ checkIn, checkOut, onChange }: Props) {
  const today = startOfToday();

  // ── Tarification ──────────────────────────────────────────────────────────
  const [basePrice, setBasePrice] = useState<number>(150);
  const [customPrices, setCustomPrices] = useState<CustomPriceMap>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  // ── Disponibilités ────────────────────────────────────────────────────────
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
  const [loadingAvail, setLoadingAvail] = useState(false);

  // ── Mois affiché ──────────────────────────────────────────────────────────
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());

  // ── Range interne ─────────────────────────────────────────────────────────
  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = checkIn ? new Date(checkIn + "T00:00:00") : undefined;
    const to   = checkOut ? new Date(checkOut + "T00:00:00") : undefined;
    if (from && !isNaN(from.getTime())) return { from, to: to && !isNaN(to.getTime()) ? to : undefined };
    return undefined;
  });

  // ── Bannière d'erreur inline ──────────────────────────────────────────────
  const [warning, setWarning] = useState<string | null>(null);

  // ── Fetch tarifs ──────────────────────────────────────────────────────────
  const loadPricesForMonth = useCallback(async (month: Date) => {
    setLoadingPrices(true);
    try {
      const start = format(startOfMonth(month), "yyyy-MM-dd");
      const end   = format(endOfMonth(addMonths(month, 1)), "yyyy-MM-dd");
      const res   = await fetch(`${API_BASE}/settings/prices/range?start=${start}&end=${end}`);
      const data  = await res.json();
      if (data.success) {
        setBasePrice(data.basePrice);
        setCustomPrices(data.customPrices || {});
      }
    } catch { /* silencieux */ }
    finally { setLoadingPrices(false); }
  }, []);

  // ── Fetch disponibilités ──────────────────────────────────────────────────
  const loadUnavailableDates = useCallback(async (month: Date) => {
    setLoadingAvail(true);
    try {
      const m1 = month;
      const m2 = addMonths(month, 1);
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/availability/calendar?year=${m1.getFullYear()}&month=${m1.getMonth() + 1}`),
        fetch(`${API_BASE}/availability/calendar?year=${m2.getFullYear()}&month=${m2.getMonth() + 1}`),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      const allDays = [...(d1.data || []), ...(d2.data || [])];
      const unavailable = allDays
        .filter((d: { available: boolean }) => !d.available)
        .map((d: { date: string }) => new Date(d.date + "T00:00:00"));
      setUnavailableDates(unavailable);
    } catch { /* silencieux */ }
    finally { setLoadingAvail(false); }
  }, []);

  useEffect(() => {
    loadPricesForMonth(displayMonth);
    loadUnavailableDates(displayMonth);
  }, [displayMonth, loadPricesForMonth, loadUnavailableDates]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPriceForDate = useCallback(
    (date: Date): number => {
      const key = format(date, "yyyy-MM-dd");
      return customPrices[key] !== undefined ? customPrices[key] : basePrice;
    },
    [customPrices, basePrice]
  );

  const unavailableDateSet = useMemo(
    () => new Set(unavailableDates.map((d) => format(d, "yyyy-MM-dd"))),
    [unavailableDates]
  );

  const isDateUnavailable = useCallback(
    (date: Date) => unavailableDateSet.has(format(date, "yyyy-MM-dd")),
    [unavailableDateSet]
  );

  // ── Propagation vers le parent ────────────────────────────────────────────
  const emit = useCallback(
    (r: DateRange | undefined) => {
      const cin  = r?.from ? format(r.from, "yyyy-MM-dd") : "";
      const cout = r?.to   ? format(r.to,   "yyyy-MM-dd") : "";
      onChange(cin, cout);
    },
    [onChange]
  );

  // ── Sélection avec validation ─────────────────────────────────────────────
  const handleRangeSelect = useCallback(
    (newRange: DateRange | undefined) => {
      setWarning(null);
      if (!newRange) { setRange(undefined); emit(undefined); return; }

      if (newRange.from && !newRange.to) {
        if (isDateUnavailable(newRange.from)) {
          setWarning(`Le ${format(newRange.from, "dd MMMM yyyy", { locale: fr })} est non disponible.`);
          setRange(undefined); emit(undefined); return;
        }
        setRange(newRange); emit(newRange); return;
      }

      if (newRange.from && newRange.to) {
        let blockedDay: Date | undefined;
        try {
          const days = eachDayOfInterval({ start: newRange.from, end: newRange.to });
          blockedDay = days.find((d) => isDateUnavailable(d));
        } catch { /* ignore */ }

        if (blockedDay) {
          setWarning(`Le ${format(blockedDay, "dd MMMM yyyy", { locale: fr })} est non disponible dans cet intervalle.`);
          setRange({ from: newRange.from, to: undefined });
          emit({ from: newRange.from, to: undefined });
          return;
        }
      }

      setRange(newRange);
      emit(newRange);
    },
    [isDateUnavailable, emit]
  );

  const disabledDays = [{ before: today }, ...unavailableDates];
  const modifiersUnavailable = useMemo(() => ({ unavailable: unavailableDates }), [unavailableDates]);

  const loading = loadingPrices || loadingAvail;

  return (
    <div className="space-y-3">

      {/* CSS dark/neutral adapté à l'interface admin */}
      <style>{`
        .admin-rdp {
          --rdp-cell-size: 38px;
          --rdp-accent-color: hsl(var(--primary));
          --rdp-background-color: transparent;
          --rdp-selected-color: hsl(var(--primary-foreground));
          color: hsl(var(--foreground));
          width: 100%;
        }
        .admin-rdp .rdp-months {
          display: flex !important;
          flex-direction: column !important;
          gap: 1.5rem !important;
          width: 100%;
        }
        @media (min-width: 640px) {
          .admin-rdp .rdp-months { flex-direction: row !important; }
        }
        .admin-rdp .rdp-month { flex: 1; }
        .admin-rdp .rdp-head_cell {
          text-transform: uppercase;
          font-size: 0.6rem;
          color: hsl(var(--muted-foreground));
          font-weight: 700;
          padding-bottom: 6px;
        }
        .admin-rdp .rdp-caption_label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: hsl(var(--muted-foreground));
        }
        .admin-rdp .rdp-nav_button { color: hsl(var(--muted-foreground)); }
        .admin-rdp .rdp-nav_button:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }
        .admin-rdp .rdp-table {
          border-collapse: separate;
          border-spacing: 2px;
          width: 100%;
        }
        .admin-rdp .rdp-day_range_middle button {
          background: hsl(var(--primary) / 0.1) !important;
          border-radius: 0 !important;
        }
        .admin-rdp .rdp-day_selected button,
        .admin-rdp .rdp-day_range_start button,
        .admin-rdp .rdp-day_range_end button {
          background: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border-radius: 4px !important;
        }
        .admin-rdp .rdp-day_range_middle[data-unavailable] button,
        .admin-rdp .rdp-day_range_middle.rdp-day_disabled button {
          background: hsl(var(--destructive) / 0.15) !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }
      `}</style>

      {/* Bannière warning */}
      {warning && (
        <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/50 rounded-md text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{warning}</span>
        </div>
      )}

      {/* Calendrier */}
      <div className={`transition-opacity duration-200 ${loading ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
        <DayPicker
          className="admin-rdp"
          mode="range"
          selected={range}
          onSelect={handleRangeSelect}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          locale={fr}
          numberOfMonths={2}
          disabled={disabledDays}
          modifiers={modifiersUnavailable}
          min={2}
          components={{
            DayButton: (props: DayButtonProps) => {
              const { day, modifiers, ...buttonProps } = props;
              const targetDate = day.date;

              if (!targetDate || isNaN(targetDate.getTime())) return <button {...buttonProps} />;

              const dateStr    = format(targetDate, "yyyy-MM-dd");
              const todayStr   = format(today, "yyyy-MM-dd");
              const isPast     = dateStr < todayStr;
              const isUnavail  = isDateUnavailable(targetDate);
              const datePrice  = getPriceForDate(targetDate);
              const isCustom   = customPrices[dateStr] !== undefined;
              const isEdge     = modifiers.range_start || modifiers.range_end;
              const isMid      = modifiers.range_middle;
              const isDisabled = isPast || isUnavail;

              // Jour disponible mais après une date bloquée dans le hover du range
              const rangeFromStr = range?.from ? format(range.from, "yyyy-MM-dd") : null;
              let isAfterBlockInRange = false;
              if (rangeFromStr && !range?.to && dateStr > rangeFromStr) {
                try {
                  const preview = eachDayOfInterval({ start: range!.from!, end: targetDate });
                  isAfterBlockInRange = preview.some(
                    (d) =>
                      format(d, "yyyy-MM-dd") !== dateStr &&
                      format(d, "yyyy-MM-dd") !== rangeFromStr &&
                      isDateUnavailable(d)
                  );
                } catch { /* ignore */ }
              }

              return (
                <button
                  {...buttonProps}
                  disabled={isDisabled || buttonProps.disabled}
                  style={{ height: "48px", borderRadius: 4 }}
                  data-unavailable={isUnavail ? "true" : undefined}
                  title={
                    isUnavail
                      ? "Date non disponible"
                      : isAfterBlockInRange
                      ? "Une date bloquée est dans cet intervalle"
                      : undefined
                  }
                  className={[
                    "rdp-day_button w-full flex flex-col items-center justify-center gap-0.5 relative transition-all",
                    isPast
                      ? "opacity-25 cursor-default pointer-events-none border border-transparent"
                      : "",
                    !isPast && isUnavail
                      ? "bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800/40 cursor-not-allowed pointer-events-none"
                      : "",
                    !isPast && !isUnavail && isAfterBlockInRange
                      ? "opacity-40 cursor-not-allowed border border-rose-200 dark:border-rose-900/30"
                      : "",
                    !isPast && !isUnavail && !isEdge && !isMid && !isAfterBlockInRange
                      ? "border border-border hover:border-primary/40 hover:bg-primary/5"
                      : "",
                  ].join(" ")}
                >
                  {/* Croix sur indispo */}
                  {!isPast && isUnavail && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
                      <span className="absolute w-3.5 h-[1.5px] bg-rose-400 dark:bg-rose-600 rotate-45" />
                      <span className="absolute w-3.5 h-[1.5px] bg-rose-400 dark:bg-rose-600 -rotate-45" />
                    </span>
                  )}

                  {/* Numéro du jour */}
                  <span className={[
                    "text-xs font-semibold leading-none z-10",
                    isPast    ? "text-muted-foreground line-through"
                    : isUnavail ? "text-rose-400 dark:text-rose-600"
                    : isEdge    ? "text-primary-foreground"
                    : "text-foreground",
                  ].join(" ")}>
                    {targetDate.getDate()}
                  </span>

                  {/* Prix */}
                  {!isPast && !isUnavail && (
                    <span className={[
                      "text-[9px] font-mono leading-none z-10",
                      isEdge  ? "text-primary-foreground/70 font-bold"
                      : isMid   ? "text-muted-foreground"
                      : isCustom ? "text-amber-500 dark:text-amber-400 font-bold"
                      : "text-muted-foreground",
                    ].join(" ")}>
                      {datePrice} DT
                    </span>
                  )}
                </button>
              );
            },
          }}
        />
      </div>

      {/* Légende */}
      <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-border opacity-40 inline-block" />
          Passé
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-rose-100 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 inline-block" />
          Indisponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-border inline-block" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-500 font-bold text-[9px]">DT</span>
          Tarif spécial
        </span>
      </div>

      {/* Récap dates sélectionnées */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className={`px-3 py-2 rounded-md border text-center ${range?.from ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Arrivée</p>
          <p className="text-xs font-semibold mt-0.5 text-foreground">
            {range?.from ? format(range.from, "dd MMM yyyy", { locale: fr }) : "—"}
          </p>
        </div>
        <div className={`px-3 py-2 rounded-md border text-center ${range?.to ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Départ</p>
          <p className="text-xs font-semibold mt-0.5 text-foreground">
            {range?.to ? format(range.to, "dd MMM yyyy", { locale: fr }) : "—"}
          </p>
        </div>
      </div>

      {/* Indication si only from */}
      {range?.from && !range?.to && (
        <p className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          Sélectionnez maintenant la date de départ.
        </p>
      )}
    </div>
  );
}