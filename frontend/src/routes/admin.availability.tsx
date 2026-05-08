import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/availability")({
  component: AvailabilityPage,
});

function AvailabilityPage() {
  const [month, setMonth] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [blocked, setBlocked] = useState<Set<string>>(new Set([
    "2026-05-12","2026-05-13","2026-05-14","2026-05-15","2026-05-16","2026-05-17","2026-05-18",
    "2026-05-02","2026-05-03","2026-05-04","2026-05-05","2026-05-06","2026-05-07",
  ]));

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const offset = (first.getDay() + 6) % 7; // Mon-first
    const arr: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(month.getFullYear(), month.getMonth(), d));
    return arr;
  }, [month]);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const toggle = (d: Date) => {
    const k = fmt(d);
    setBlocked((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow">— Calendrier</div>
        <h1 className="font-display text-4xl mt-2">Disponibilité</h1>
        <p className="text-sm text-muted-foreground mt-2">Cliquez sur un jour pour le bloquer ou le libérer. Sync Airbnb à venir.</p>
      </div>

      <div className="bg-background border border-border p-6 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-2 hover:bg-secondary"><ChevronLeft className="h-4 w-4" /></button>
          <div className="font-display text-2xl capitalize">
            {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </div>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-2 hover:bg-secondary"><ChevronRight className="h-4 w-4" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] tracking-wider uppercase text-muted-foreground mb-2">
          {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = fmt(d);
            const isBlocked = blocked.has(k);
            return (
              <button
                key={i}
                onClick={() => toggle(d)}
                className={cn(
                  "aspect-square text-sm transition-colors border",
                  isBlocked ? "bg-foreground text-background border-foreground" : "bg-background hover:bg-secondary border-border"
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-2"><span className="h-3 w-3 bg-foreground inline-block" /> Bloqué</span>
          <span className="flex items-center gap-2"><span className="h-3 w-3 border border-border inline-block" /> Disponible</span>
        </div>
      </div>
    </div>
  );
}
