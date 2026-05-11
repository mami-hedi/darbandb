import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export type Reservation = {
  id: string;
  refNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
};

export const Route = createFileRoute("/admin/reservations")({
  component: ReservationsPage,
});

function ReservationsPage() {
  const [data, setData] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Reservation["status"]>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/reservations");
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  // Fonction de mise à jour générique (pour n'importe quel champ)
  const handleUpdate = async (id: string, fields: Partial<Reservation>) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (response.ok) {
        const result = await response.json();
        // On met à jour l'état local avec la réponse du serveur (qui a recalculé le prix)
        setData((prev) => prev.map((r) => (r.id === id ? result.data : r)));
        setEditingId(null);
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const list = filter === "all" ? data : data.filter((r) => r.status === filter);

  if (loading) return <div className="p-8 text-xs uppercase tracking-widest">Chargement...</div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="eyebrow">— Gestion</div>
          <h1 className="font-display text-4xl mt-2">Réservations</h1>
        </div>
        <div className="flex gap-2 text-xs">
          {(["all", "pending", "confirmed", "cancelled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-4 py-2 border transition-all", filter === f ? "bg-foreground text-background border-foreground" : "border-border hover:bg-secondary")}>
              {f === "all" ? "Toutes" : f === "pending" ? "En attente" : f === "confirmed" ? "Confirmées" : "Annulées"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-background border border-border">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-secondary/30">
            <tr className="border-b border-border">
              <th className="text-left p-4">Réf</th>
              <th className="text-left p-4">Client</th>
              <th className="text-left p-4">Dates</th>
              <th className="text-center p-4">Pers.</th>
              <th className="text-left p-4">Total</th>
              <th className="text-left p-4">Statut</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => {
              const isEditing = editingId === r.id;
              return (
                <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-mono text-[10px] text-muted-foreground">{r.refNumber}</td>
                  
                  {/* CLIENT : Nom & Prénom */}
                  <td className="p-4">
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <input 
                          className="border border-border px-2 py-1 text-xs outline-none focus:border-foreground"
                          defaultValue={r.firstName}
                          onBlur={(e) => handleUpdate(r.id, { firstName: e.target.value })}
                        />
                        <input 
                          className="border border-border px-2 py-1 text-xs outline-none focus:border-foreground"
                          defaultValue={r.lastName}
                          onBlur={(e) => handleUpdate(r.id, { lastName: e.target.value })}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-medium">{r.firstName} {r.lastName}</div>
                        <div className="text-[11px] text-muted-foreground">{r.email}</div>
                      </>
                    )}
                  </td>

                  {/* DATES */}
                  <td className="p-4 text-xs">
                    {isEditing ? (
                      <div className="flex flex-col gap-1">
                        <input 
                          type="date"
                          className="border border-border px-1 text-[10px]"
                          defaultValue={new Date(r.checkInDate).toISOString().split('T')[0]}
                          onChange={(e) => handleUpdate(r.id, { checkInDate: e.target.value })}
                        />
                        <input 
                          type="date"
                          className="border border-border px-1 text-[10px]"
                          defaultValue={new Date(r.checkOutDate).toISOString().split('T')[0]}
                          onChange={(e) => handleUpdate(r.id, { checkOutDate: e.target.value })}
                        />
                      </div>
                    ) : (
                      <span>{new Date(r.checkInDate).toLocaleDateString()} → {new Date(r.checkOutDate).toLocaleDateString()}</span>
                    )}
                  </td>

                  {/* PERSONNES */}
                  <td className="p-4 text-center">
                    {isEditing ? (
                      <input 
                        type="number"
                        className="w-12 border border-border text-center text-xs"
                        defaultValue={r.numberOfGuests}
                        onBlur={(e) => handleUpdate(r.id, { numberOfGuests: parseInt(e.target.value) })}
                      />
                    ) : r.numberOfGuests}
                  </td>

                  {/* PRIX TOTAL */}
                  <td className="p-4 font-medium">{r.totalPrice} €</td>

                  {/* STATUT */}
                  <td className="p-4"><StatusBadge s={r.status} /></td>

                  {/* ACTIONS */}
                  <td className="p-4 text-right space-x-3">
                    <button 
                      onClick={() => setEditingId(isEditing ? null : r.id)}
                      className="text-[10px] uppercase font-bold hover:underline"
                    >
                      {isEditing ? "Fermer" : "Modifier"}
                    </button>
                    {!isEditing && (
                      <>
                        {r.status !== "confirmed" && (
                          <button onClick={() => handleUpdate(r.id, { status: "confirmed" })} className="text-[10px] uppercase text-blue-600 underline">Confirmer</button>
                        )}
                        {r.status !== "cancelled" && (
                          <button onClick={() => handleUpdate(r.id, { status: "cancelled" })} className="text-[10px] uppercase text-destructive underline">Annuler</button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
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