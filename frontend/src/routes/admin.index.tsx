import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ResponsiveContainer, Tooltip, XAxis, YAxis, ComposedChart, Area, Legend, CartesianGrid } from "recharts";
import { TrendingUp, Euro, Loader2, Target, Percent, DollarSign, CalendarDays } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/reservations/admin/stats`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setData(result.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;
  if (!data) return <div className="p-10 text-neutral-500">Données non disponibles.</div>;

  const occupancyRate = Math.round((data.totals.nights / 365) * 100);
  const revPar = Math.round(data.totals.revenue / 365);
  const formatTND = (val: number) => `${val.toLocaleString('fr-FR')} TND`;

  return (
    <div className="space-y-8 p-6 bg-neutral-950 min-h-screen text-neutral-100">
      <h1 className="text-3xl font-bold">Pilotage Financier : Dar B&B</h1>

      {/* Prochaine Réservation */}
      

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={<Euro size={18}/>} label="Revenu Annuel" value={formatTND(data.totals.revenue)} />
        <Stat icon={<Percent size={18}/>} label="Taux d'occupation" value={`${occupancyRate} %`} />
        <Stat icon={<Target size={18}/>} label="RevPAR" value={`${revPar.toLocaleString('fr-FR')} TND / jour`} />
        <Stat icon={<DollarSign size={18}/>} label="Panier Moyen" value={formatTND(Math.round(data.totals.revenue / data.totals.clients))} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Analyse Rentabilité */}
        <div className="lg:col-span-2 bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h3 className="mb-6 font-semibold flex items-center gap-2"><TrendingUp size={18}/> Analyse des Revenus Mensuels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data.revenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="m" stroke="#666" />
              <YAxis yAxisId="left" stroke="#666" tickFormatter={(val) => `${val} TND`} />
              <Tooltip contentStyle={{ background: "#000", border: "1px solid #444" }} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#eab308" stroke="#eab308" name="Revenu (TND)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Occupation Saisonnier */}
        <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800">
          <h3 className="mb-6 font-semibold text-amber-400 flex items-center gap-2"><CalendarDays size={18}/> Occupation Saisonnier</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-neutral-300">Haute Saison</span><span className="font-bold text-white">92 %</span></div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden"><div className="bg-amber-500 h-full w-[92%]"></div></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-neutral-300">Saison Moyenne</span><span className="font-bold text-white">65 %</span></div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden"><div className="bg-amber-600 h-full w-[65%]"></div></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-neutral-300">Basse Saison</span><span className="font-bold text-white">28 %</span></div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden"><div className="bg-amber-900 h-full w-[28%]"></div></div>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1">Dépendance saisonnière</p>
              <p className="text-lg font-bold text-amber-500">Modérée</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800">
      <div className="text-neutral-500 text-xs uppercase flex justify-between mb-2">{label} {icon}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}