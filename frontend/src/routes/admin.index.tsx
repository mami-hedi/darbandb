import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, BedDouble, Users as UsersIcon, Euro } from "lucide-react";
import { monthlyRevenue, reservations, sourceMix, clients } from "@/admin/mockData";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const COLORS = ["oklch(0.18 0.01 60)", "oklch(0.78 0.06 60)"];

function Dashboard() {
  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const totalNights = monthlyRevenue.reduce((s, m) => s + m.nights, 0);
  const occupancy = Math.round((totalNights / 365) * 100);
  const upcoming = reservations.filter((r) => r.status !== "cancelled").length;

  return (
    <div className="space-y-10">
      <div>
        <div className="text-[0.7rem] tracking-[0.3em] uppercase text-muted-foreground">— Vue d'ensemble</div>
        <h1 className="font-display text-4xl mt-2">Tableau de bord</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        <Stat icon={<Euro className="h-4 w-4" />} label="Revenu annuel" value={`${totalRevenue.toLocaleString("fr-FR")} €`} delta="+18%" />
        <Stat icon={<BedDouble className="h-4 w-4" />} label="Nuits réservées" value={`${totalNights}`} delta={`${occupancy}% occ.`} />
        <Stat icon={<UsersIcon className="h-4 w-4" />} label="Clients" value={`${clients.length}`} delta="+3 ce mois" />
        <Stat icon={<TrendingUp className="h-4 w-4" />} label="Réservations actives" value={`${upcoming}`} delta="à venir" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background border border-border p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="eyebrow">Revenu mensuel</div>
              <div className="font-display text-2xl mt-1">2026</div>
            </div>
            <div className="text-xs text-muted-foreground">€</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 75)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.95 0.01 80)" }} contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="oklch(0.18 0.01 60)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-background border border-border p-6">
          <div className="eyebrow">Sources de réservation</div>
          <div className="font-display text-2xl mt-1">Répartition</div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} stroke="none">
                  {sourceMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-2">
            {sourceMix.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="h-2 w-2 inline-block" style={{ background: COLORS[i] }} /> {s.name}</span>
                <span className="text-muted-foreground">{s.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-background border border-border p-6">
        <div className="eyebrow">Nuits réservées · tendance</div>
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 75)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
              <Line type="monotone" dataKey="nights" stroke="oklch(0.18 0.01 60)" strokeWidth={2} dot={{ r: 3, fill: "oklch(0.78 0.06 60)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, delta }: { icon: React.ReactNode; label: string; value: string; delta: string }) {
  return (
    <div className="bg-background p-6">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="eyebrow">{label}</span>
        {icon}
      </div>
      <div className="font-display text-3xl mt-3">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{delta}</div>
    </div>
  );
}
