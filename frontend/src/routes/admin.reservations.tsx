import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { reservations as initial, type Reservation } from "@/admin/mockData";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reservations")({
  component: ReservationsPage,
});

function ReservationsPage() {
  const [data, setData] = useState<Reservation[]>(initial);
  const [filter, setFilter] = useState<"all" | Reservation["status"]>("all");
  const list = filter === "all" ? data : data.filter((r) => r.status === filter);

  const update = (id: string, status: Reservation["status"]) =>
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">— Gestion</div>
          <h1 className="font-display text-4xl mt-2">Réservations</h1>
        </div>
        <div className="flex gap-2 text-xs">
          {(["all","pending","confirmed","cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 border", filter === f ? "bg-foreground text-background border-foreground" : "border-border")}>
              {f === "all" ? "Toutes" : f === "pending" ? "En attente" : f === "confirmed" ? "Confirmées" : "Annulées"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left p-4">Réf</th>
              <th className="text-left p-4">Client</th>
              <th className="text-left p-4">Dates</th>
              <th className="text-left p-4">Pers.</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Source</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/40">
                <td className="p-4 font-mono text-xs">{r.id}</td>
                <td className="p-4">
                  <div>{r.guest}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </td>
                <td className="p-4 text-xs">{r.arrival} → {r.departure}</td>
                <td className="p-4">{r.guests}</td>
                <td className="p-4">{r.total} €</td>
                <td className="p-4 capitalize text-xs">{r.source}</td>
                <td className="p-4"><StatusBadge s={r.status} /></td>
                <td className="p-4 text-right space-x-2">
                  {r.status !== "confirmed" && <button onClick={() => update(r.id, "confirmed")} className="text-xs underline">Confirmer</button>}
                  {r.status !== "cancelled" && <button onClick={() => update(r.id, "cancelled")} className="text-xs underline text-destructive">Annuler</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ s }: { s: Reservation["status"] }) {
  const map = {
    pending: "bg-accent/40 text-foreground",
    confirmed: "bg-foreground text-background",
    cancelled: "bg-destructive/10 text-destructive line-through",
  } as const;
  return <span className={cn("inline-block px-2.5 py-1 text-[0.65rem] uppercase tracking-wider", map[s])}>{s}</span>;
}
