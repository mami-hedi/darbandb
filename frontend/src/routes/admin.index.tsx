import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, Tooltip, XAxis, YAxis,
  ComposedChart, Area, CartesianGrid, BarChart, Bar, Cell,
} from "recharts";
import {
  TrendingUp, Euro, Loader2, Target, Percent,
  DollarSign, CalendarDays, Users, Clock, ArrowUpRight,
  ArrowDownRight, CheckCircle2, XCircle, AlertCircle,
  Banknote, BedDouble, Star, AlertTriangle, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

// ─── TYPES ────────────────────────────────────────────────────

interface StatsData {
  totals: {
    revenue: number;
    nights: number;
    clients: number;
    reservations: number;
    pendingDeposits?: number;
    confirmedCount?: number;
    cancelledCount?: number;
    pendingCount?: number;
  };
  revenue: { m: string; revenue: number }[];
  nextReservation?: {
    firstName: string;
    lastName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfGuests: number;
    totalPrice: number;
    refNumber: string;
  };
  recentReservations?: {
    refNumber: string;
    firstName: string;
    lastName: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    depositPaid: boolean;
    depositAmount: number;
    status: "pending" | "confirmed" | "cancelled";
    source?: string;
  }[];
  topClients?: {
    firstName: string;
    lastName: string;
    email: string;
    stays: number;
    totalSpent: number;
  }[];
}

// ─── DASHBOARD ────────────────────────────────────────────────

function Dashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/reservations/admin/stats`)
      .then((r) => r.json())
      .then((result) => { if (result.success) setData(result.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4 bg-neutral-950">
      <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
      <p className="text-neutral-500 text-xs uppercase tracking-widest animate-pulse">
        Chargement du tableau de bord...
      </p>
    </div>
  );

  if (!data) return (
    <div className="h-screen flex items-center justify-center bg-neutral-950">
      <p className="text-neutral-500">Données non disponibles.</p>
    </div>
  );

  const fmt = (val: number) => val.toLocaleString("fr-FR");
  const occupancyRate = Math.round((data.totals.nights / 365) * 100);
  const revPar        = Math.round(data.totals.revenue / 365);
  const avgBasket     = data.totals.clients > 0
    ? Math.round(data.totals.revenue / data.totals.clients) : 0;

  const rev       = data.revenue ?? [];
  const lastRev   = rev[rev.length - 1]?.revenue ?? 0;
  const prevRev   = rev[rev.length - 2]?.revenue ?? 0;
  const monthDelta = prevRev > 0 ? Math.round(((lastRev - prevRev) / prevRev) * 100) : 0;

  const bestMonth = Math.max(...rev.map(r => r.revenue), 1);
  const monthGoal = Math.round(bestMonth * 1.1);
  const goalPct   = Math.min(100, Math.round((lastRev / monthGoal) * 100));

  const pendingDeposits = data.totals.pendingDeposits ?? 0;
  const barData         = rev.slice(-6);

  // ── Alertes intelligentes ──────────────────────────────────
  const alerts: { type: "danger" | "warning" | "success"; icon: React.ReactNode; text: string }[] = [];

  if (pendingDeposits > 0)
    alerts.push({
      type: "danger",
      icon: <Banknote className="w-3.5 h-3.5" />,
      text: `${pendingDeposits} acompte${pendingDeposits > 1 ? "s" : ""} non encaissé${pendingDeposits > 1 ? "s" : ""}`,
    });

  const expiringCount = (data.recentReservations ?? []).filter(r => {
    const d = Math.ceil((new Date(r.checkInDate).getTime() - Date.now()) / 86400000);
    return r.status === "pending" && d >= 0 && d <= 3;
  }).length;
  if (expiringCount > 0)
    alerts.push({
      type: "warning",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      text: `${expiringCount} réservation${expiringCount > 1 ? "s" : ""} en attente avec arrivée imminente`,
    });

  const weekCheckins = (data.recentReservations ?? []).filter(r => {
    const d = Math.ceil((new Date(r.checkInDate).getTime() - Date.now()) / 86400000);
    return d >= 0 && d <= 7;
  }).length;
  if (weekCheckins > 0)
    alerts.push({
      type: "success",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: `${weekCheckins} check-in${weekCheckins > 1 ? "s" : ""} cette semaine`,
    });

  if (alerts.length === 0)
    alerts.push({
      type: "success",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: "Tout est à jour — aucune action requise",
    });

  // ── Helpers ────────────────────────────────────────────────
  const daysUntil = (date: string) =>
    Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);

  const initials = (first: string, last: string) =>
    `${first?.[0] ?? ""}${last?.[0] ?? ""}`.toUpperCase();

  const statusColors: Record<string, string> = {
    confirmed: "text-emerald-400", pending: "text-amber-400", cancelled: "text-rose-400",
  };
  const statusLabels: Record<string, string> = {
    confirmed: "Confirmée", pending: "En attente", cancelled: "Annulée",
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-6 space-y-5">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70 mb-1">
            — Tableau de bord
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Pilotage Financier <span className="text-amber-500">Dar B&B</span>
          </h1>
        </div>
        <p className="text-xs text-neutral-500 tabular-nums">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>

      {/* ── ALERTES INTELLIGENTES ── */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-3.5 h-3.5 text-amber-500" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
            Alertes & actions requises
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {alerts.map((a, i) => (
            <div key={i} className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border",
              a.type === "danger"  && "bg-rose-500/10 text-rose-300 border-rose-500/20",
              a.type === "warning" && "bg-amber-500/10 text-amber-300 border-amber-500/20",
              a.type === "success" && "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
            )}>
              {a.icon}
              {a.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── PROCHAINE RÉSERVATION ── */}
      {data.nextReservation && (() => {
        const n     = data.nextReservation!;
        const days  = daysUntil(n.checkInDate);
        const nights = Math.ceil(
          (new Date(n.checkOutDate).getTime() - new Date(n.checkInDate).getTime()) / 86400000
        );
        return (
          <div className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-neutral-900 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <BedDouble className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70">
                  Prochaine arrivée
                </p>
                <p className="font-bold text-lg leading-tight">{n.firstName} {n.lastName}</p>
                <p className="text-xs text-neutral-400 font-mono">{n.refNumber}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-5 sm:ml-6 text-sm">
              {[
                { label: "Arrivée", val: new Date(n.checkInDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) },
                { label: "Durée",   val: `${nights} nuit${nights > 1 ? "s" : ""}` },
                { label: "Invités", val: `${n.numberOfGuests} pers.` },
                { label: "Montant", val: `${fmt(n.totalPrice)} TND`, accent: true },
              ].map(({ label, val, accent }) => (
                <div key={label}>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{label}</p>
                  <p className={cn("font-semibold", accent && "text-amber-400")}>{val}</p>
                </div>
              ))}
            </div>
            <div className="sm:ml-auto shrink-0">
              <div className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm border",
                days <= 1 ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                  : days <= 7 ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-neutral-800 text-neutral-300 border-neutral-700"
              )}>
                <Clock className="w-4 h-4" />
                {days === 0 ? "Aujourd'hui !" : days === 1 ? "Demain" : `Dans ${days} jours`}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={<Euro className="w-4 h-4" />}      label="Revenu annuel"     value={`${fmt(data.totals.revenue)} TND`} delta={monthDelta} sub={`${rev[rev.length - 1]?.m ?? ""} · ${fmt(lastRev)} TND`} accent="amber" />
        <KpiCard icon={<Percent className="w-4 h-4" />}   label="Taux d'occupation" value={`${occupancyRate} %`}              sub={`${data.totals.nights} nuits réservées`} accent="sky" />
        <KpiCard icon={<Target className="w-4 h-4" />}    label="RevPAR"            value={`${fmt(revPar)} TND`}              sub="par jour calendaire" accent="violet" />
        <KpiCard icon={<DollarSign className="w-4 h-4" />} label="Panier moyen"     value={`${fmt(avgBasket)} TND`}           sub={`${data.totals.clients} clients uniques`} accent="emerald" />
      </div>

      {/* ── LIGNE 2 : STATUTS + ACOMPTES + OBJECTIF ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Répartition statuts */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-4">
            Répartition des réservations
          </p>
          <div className="space-y-3">
            {[
              { label: "Confirmées", count: data.totals.confirmedCount ?? 0, icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, bar: "bg-emerald-500" },
              { label: "En attente", count: data.totals.pendingCount   ?? 0, icon: <AlertCircle  className="w-4 h-4 text-amber-400"   />, bar: "bg-amber-500"   },
              { label: "Annulées",   count: data.totals.cancelledCount ?? 0, icon: <XCircle      className="w-4 h-4 text-rose-400"    />, bar: "bg-rose-500"    },
            ].map(({ label, count, icon, bar }) => {
              const total = (data.totals.confirmedCount ?? 0) + (data.totals.pendingCount ?? 0) + (data.totals.cancelledCount ?? 0) || data.totals.reservations || 1;
              const pct   = Math.round((count / total) * 100);
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 text-xs">{icon}{label}</div>
                    <span className="text-xs font-bold tabular-nums">
                      {count} <span className="text-neutral-600 font-normal">({pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div className={cn(bar, "h-full rounded-full transition-all")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between text-xs text-neutral-500">
            <span>Total</span>
            <span className="font-bold text-neutral-300">
              {(data.totals.confirmedCount ?? 0) + (data.totals.pendingCount ?? 0) + (data.totals.cancelledCount ?? 0) || data.totals.reservations} rés.
            </span>
          </div>
        </div>

        {/* Acomptes en attente */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500 mb-4">
            Acomptes en attente
          </p>
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2">
              <Banknote className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-4xl font-black tabular-nums text-amber-400">{pendingDeposits}</p>
            <p className="text-xs text-neutral-500">
              acompte{pendingDeposits !== 1 ? "s" : ""} non encaissé{pendingDeposits !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-800 text-center">
            <Link
              to="/admin/reservations"
              className="text-[10px] text-amber-500/60 hover:text-amber-400 uppercase tracking-wider transition-colors"
            >
              {pendingDeposits === 0 ? "✓ Tout est à jour" : "Gérer les réservations →"}
            </Link>
          </div>
        </div>

        {/* Objectif mensuel */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
              Objectif mensuel
            </p>
            <Star className="w-4 h-4 text-amber-500/50" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-3">
            <div className="flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#262626" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={goalPct >= 100 ? "#10b981" : goalPct >= 70 ? "#eab308" : "#f59e0b"}
                    strokeWidth="3"
                    strokeDasharray={`${goalPct} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black tabular-nums">{goalPct}%</span>
                </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs text-neutral-400">
                <span className="font-bold text-white">{fmt(lastRev)}</span> / {fmt(monthGoal)} TND
              </p>
              <p className="text-[10px] text-neutral-600">
                {fmt(Math.max(0, monthGoal - lastRev))} TND restants
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIGNE 3 : GRAPHIQUES ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Revenus mensuels */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-amber-500" /> Revenus mensuels
            </h3>
            {monthDelta !== 0 && (
              <span className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                monthDelta >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
              )}>
                {monthDelta >= 0
                  ? <ArrowUpRight className="w-3 h-3" />
                  : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(monthDelta)}% vs mois préc.
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={data.revenue} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis dataKey="m" stroke="#525252" tick={{ fontSize: 11 }} />
              <YAxis stroke="#525252" tick={{ fontSize: 11 }} tickFormatter={v => `${v}`} width={50} />
              <Tooltip
                contentStyle={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${fmt(v)} TND`, "Revenu"]}
                labelStyle={{ color: "#a3a3a3" }}
              />
              <Area
                type="monotone" dataKey="revenue"
                fill="url(#revenueGrad)" stroke="#eab308" strokeWidth={2}
                dot={{ fill: "#eab308", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: "#eab308" }}
                name="Revenu"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart 6 derniers mois */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 md:p-6">
          <h3 className="font-semibold flex items-center gap-2 text-sm mb-6">
            <CalendarDays className="w-4 h-4 text-amber-500" /> 6 derniers mois
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
              <XAxis dataKey="m" stroke="#525252" tick={{ fontSize: 10 }} />
              <YAxis stroke="#525252" tick={{ fontSize: 10 }} width={40} tickFormatter={v => `${v}`} />
              <Tooltip
                contentStyle={{ background: "#0a0a0a", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${fmt(v)} TND`, "Revenu"]}
                labelStyle={{ color: "#a3a3a3" }}
              />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {barData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === barData.length - 1 ? "#eab308" : "#2a2a2a"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── LIGNE 4 : RÉSERVATIONS RÉCENTES + TOP CLIENTS ── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Réservations récentes */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" /> Réservations récentes
            </h3>
            <Link
              to="/admin/reservations"
              className="text-[10px] text-neutral-500 hover:text-amber-400 transition-colors"
            >
              Toutes →
            </Link>
          </div>
          {data.recentReservations && data.recentReservations.length > 0 ? (
            <div className="space-y-0.5">
              {data.recentReservations.slice(0, 6).map((r) => (
                <div key={r.refNumber} className="flex items-center gap-3 py-2.5 border-b border-neutral-800/60 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400 shrink-0">
                    {initials(r.firstName, r.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.firstName} {r.lastName}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">
                      {r.refNumber} · {new Date(r.checkInDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular-nums">
                      {fmt(r.totalPrice)} <span className="text-[10px] font-normal text-neutral-500">TND</span>
                    </p>
                    <span className={cn("text-[10px] font-semibold", statusColors[r.status] ?? "text-neutral-400")}>
                      {statusLabels[r.status] ?? r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 italic text-center py-8">Aucune réservation récente</p>
          )}
        </div>

        {/* Top Clients */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 md:p-6">
          <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" /> Top clients
          </h3>
          {data.topClients && data.topClients.length > 0 ? (
            <div className="space-y-0.5">
              {data.topClients.slice(0, 6).map((c, i) => (
                <div key={c.email} className="flex items-center gap-3 py-2.5 border-b border-neutral-800/60 last:border-0">
                  <div className={cn(
                    "w-6 text-center text-xs font-black tabular-nums shrink-0",
                    i === 0 ? "text-amber-400" : i === 1 ? "text-neutral-400" : i === 2 ? "text-amber-700" : "text-neutral-600"
                  )}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-300 shrink-0">
                    {initials(c.firstName, c.lastName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{c.firstName} {c.lastName}</p>
                    <p className="text-[10px] text-neutral-500">{c.stays} séjour{c.stays > 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold tabular-nums text-amber-400">{fmt(c.totalSpent)}</p>
                    <p className="text-[10px] text-neutral-500">TND</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-600 italic text-center py-8">Aucune donnée client</p>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── KPI CARD ─────────────────────────────────────────────────

type Accent = "amber" | "sky" | "violet" | "emerald";

const accentMap: Record<Accent, { icon: string; value: string }> = {
  amber:   { icon: "text-amber-400",   value: "text-amber-400"   },
  sky:     { icon: "text-sky-400",     value: "text-sky-400"     },
  violet:  { icon: "text-violet-400",  value: "text-violet-400"  },
  emerald: { icon: "text-emerald-400", value: "text-emerald-400" },
};

function KpiCard({ icon, label, value, sub, delta, accent = "amber" }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  delta?: number;
  accent?: Accent;
}) {
  const a = accentMap[accent];
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 md:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-500">{label}</p>
        <span className={a.icon}>{icon}</span>
      </div>
      <p className={cn("text-xl md:text-2xl font-black tabular-nums leading-tight", a.value)}>{value}</p>
      <div className="flex items-center justify-between gap-2">
        {sub && <p className="text-[10px] text-neutral-600 truncate">{sub}</p>}
        {delta !== undefined && delta !== 0 && (
          <span className={cn(
            "shrink-0 flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full",
            delta >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
          )}>
            {delta >= 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}