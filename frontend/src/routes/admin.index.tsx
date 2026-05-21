import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, BedDouble, Users as UsersIcon, Euro, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

const COLORS = ["oklch(0.18 0.01 60)", "oklch(0.78 0.06 60)", "oklch(0.45 0.01 60)"];

// Interface pour typer nos données API
interface DashboardData {
  revenue: Array<{ m: string; revenue: number; nights: number }>;
  sources: Array<{ name: string; value: number }>;
  totals: {
    revenue: number;
    nights: number;
    clients: number;
    upcoming: number;
  };
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // L'URL combine ton port backend, ton préfixe API et ta route spécifique
        const response = await fetch("http://localhost:5000/api/reservations/admin/stats");
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          setError("Impossible de charger les statistiques");
        }
      } catch (err) {
        setError("Erreur de connexion au serveur (Vérifiez que le backend tourne sur le port 5000)");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-xs uppercase tracking-widest">Chargement des données...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-10 text-red-500 border border-red-100 bg-red-50/50 text-sm">
        <p className="font-bold">Erreur de chargement</p>
        <p>{error}</p>
      </div>
    );
  }

  const occupancy = Math.round((data.totals.nights / 365) * 100);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div>
        <div className="text-[0.7rem] tracking-[0.3em] uppercase text-muted-foreground">— Vue d'ensemble</div>
        <h1 className="font-display text-4xl mt-2">Tableau de bord</h1>
      </div>

      {/* Cartes de statistiques dynamiques */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border shadow-sm">
        <Stat 
          icon={<Euro className="h-4 w-4" />} 
          label="Revenu annuel" 
          value={`${data.totals.revenue.toLocaleString("fr-FR")} €`} 
          delta="Encaissé" 
        />
        <Stat 
          icon={<BedDouble className="h-4 w-4" />} 
          label="Nuits réservées" 
          value={`${data.totals.nights}`} 
          delta={`${occupancy}% d'occ.`} 
        />
        <Stat 
          icon={<UsersIcon className="h-4 w-4" />} 
          label="Clients" 
          value={`${data.totals.clients}`} 
          delta="Base de données" 
        />
        <Stat 
          icon={<TrendingUp className="h-4 w-4" />} 
          label="À venir" 
          value={`${data.totals.upcoming}`} 
          delta="Réservations" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Graphique des Revenus (BarChart) */}
        <div className="lg:col-span-2 bg-background border border-border p-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="eyebrow">Revenu mensuel</div>
              <div className="font-display text-2xl mt-1">2026</div>
            </div>
            <div className="text-xs text-muted-foreground">EUR</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 75)" vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "oklch(0.95 0.01 80)" }} contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="oklch(0.18 0.01 60)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mix des sources (PieChart) */}
        <div className="bg-background border border-border p-6">
          <div className="eyebrow">Sources de réservation</div>
          <div className="font-display text-2xl mt-1">Répartition</div>
          <div className="h-56 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.sources} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} stroke="none">
                  {data.sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-2 mt-2 text-xs uppercase tracking-wider">
            {data.sources.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-1.5 w-1.5" style={{ background: COLORS[i % COLORS.length] }} /> 
                  {s.name}
                </span>
                <span className="font-bold">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Graphique de tendance des Nuits (LineChart) */}
      <div className="bg-background border border-border p-6">
        <div className="eyebrow">Nuits réservées · tendance annuelle</div>
        <div className="h-56 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 75)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "oklch(0.45 0.015 65)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid oklch(0.88 0.01 75)", borderRadius: 0, fontSize: 12 }} />
              <Line type="monotone" dataKey="nights" stroke="oklch(0.18 0.01 60)" strokeWidth={2} dot={{ r: 3, fill: "oklch(0.78 0.06 60)", strokeWidth: 0 }} />
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
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{delta}</div>
    </div>
  );
}