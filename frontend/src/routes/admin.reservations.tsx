import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

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

  const fetchReservations = async () => {
    try {
      const response = await fetch(`${API_BASE}/reservations`);
      const result = await response.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleUpdate = async (id: string, fields: Partial<Reservation>) => {
    try {
      const response = await fetch(`${API_BASE}/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      if (response.ok) {
        const result = await response.json();
        setData((prev) => prev.map((r) => (r.id === id ? result.data : r)));
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    }
  };

  const filteredList = filter === "all" ? data : data.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Chargement des réservations...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* HEADER & FILTRES */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">— Administration</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Réservations</h1>
        </div>
        
        {/* Filtres compacts / défilants sur mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs no-scrollbar">
          <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Toutes" count={data.length} />
          <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")} label="En attente" count={data.filter(r => r.status === "pending").length} />
          <FilterButton active={filter === "confirmed"} onClick={() => setFilter("confirmed")} label="Confirmées" count={data.filter(r => r.status === "confirmed").length} />
          <FilterButton active={filter === "cancelled"} onClick={() => setFilter("cancelled")} label="Annulées" count={data.filter(r => r.status === "cancelled").length} />
        </div>
      </div>

      {/* COMPOSANT RESPONSIVE : TABLEAU (DESKTOP) & CARTES (MOBILE) */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        
        {/* 1. VUE DESKTOP (Tableau classique masqué sur mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 font-medium">Référence</th>
                <th className="p-4 font-medium">Client</th>
                <th className="p-4 font-medium">Dates du séjour</th>
                <th className="p-4 font-medium text-center">Pers.</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredList.map((r) => (
                <ReservationRow key={r.id} reservation={r} onUpdate={handleUpdate} />
              ))}
              {filteredList.length === 0 && <EmptyState />}
            </tbody>
          </table>
        </div>

        {/* 2. VUE MOBILE (Cartes empilées masquées sur desktop) */}
        <div className="grid grid-cols-1 divide-y divide-border md:hidden">
          {filteredList.map((r) => (
            <ReservationCardMobile key={r.id} reservation={r} onUpdate={handleUpdate} />
          ))}
          {filteredList.length === 0 && <EmptyState />}
        </div>

      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS PURS & ISOLÉS ---

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5",
        active 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
      <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>
        {count}
      </span>
    </button>
  );
}

function StatusBadge({ s }: { s: Reservation["status"] }) {
  const map = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20 line-through",
  } as const;

  const labels = { pending: "En attente", confirmed: "Confirmé", cancelled: "Annulé" };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", map[s])}>
      {labels[s]}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="p-8 text-center text-sm text-muted-foreground w-full">
      Aucune réservation ne correspond à ce critère.
    </div>
  );
}

// Ligne de tableau Desktop optimisée
function ReservationRow({ reservation: r, onUpdate }: { reservation: Reservation; onUpdate: (id: string, fields: Partial<Reservation>) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(r);

  const save = () => {
    onUpdate(r.id, form);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <tr className="bg-muted/30 border-l-2 border-primary">
        <td className="p-4 font-mono text-xs">{r.refNumber}</td>
        <td className="p-4 space-y-1.5">
          <input className="w-full border border-border rounded px-2 py-1 text-sm bg-background" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Prénom" />
          <input className="w-full border border-border rounded px-2 py-1 text-sm bg-background" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Nom" />
          <input className="w-full border border-border rounded px-2 py-1 text-xs text-muted-foreground bg-background" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
        </td>
        <td className="p-4 space-y-1.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">⚙️ Arrivée</div>
          <input type="date" className="border border-border rounded px-2 py-1 text-xs bg-background" value={new Date(form.checkInDate).toISOString().split("T")[0]} onChange={e => setForm({...form, checkInDate: e.target.value})} />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">⚙️ Départ</div>
          <input type="date" className="border border-border rounded px-2 py-1 text-xs bg-background" value={new Date(form.checkOutDate).toISOString().split("T")[0]} onChange={e => setForm({...form, checkOutDate: e.target.value})} />
        </td>
        <td className="p-4 text-center">
          <input type="number" className="w-14 border border-border rounded text-center py-1 bg-background" value={form.numberOfGuests} onChange={e => setForm({...form, numberOfGuests: parseInt(e.target.value) || 1})} />
        </td>
        <td className="p-4 font-semibold">{r.totalPrice} €</td>
        <td className="p-4"><StatusBadge s={r.status} /></td>
        <td className="p-4 text-right space-y-1">
          <button onClick={save} className="block w-full text-xs font-semibold text-emerald-600 hover:underline text-right">Enregistrer</button>
          <button onClick={() => { setForm(r); setIsEditing(false); }} className="block w-full text-xs text-muted-foreground hover:underline text-right">Annuler</button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="p-4 font-mono text-xs text-muted-foreground">{r.refNumber}</td>
      <td className="p-4">
        <div className="font-semibold text-foreground">{r.firstName} {r.lastName}</div>
        <div className="text-xs text-muted-foreground">{r.email}</div>
      </td>
      <td className="p-4 text-sm">
        <span className="font-medium">{new Date(r.checkInDate).toLocaleDateString()}</span>
        <span className="text-muted-foreground mx-1.5">→</span>
        <span className="font-medium">{new Date(r.checkOutDate).toLocaleDateString()}</span>
      </td>
      <td className="p-4 text-center font-medium">{r.numberOfGuests}</td>
      <td className="p-4 font-semibold text-foreground">{r.totalPrice} €</td>
      <td className="p-4"><StatusBadge s={r.status} /></td>
      <td className="p-4 text-right space-x-2 whitespace-nowrap">
        <button onClick={() => setIsEditing(true)} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">Modifier</button>
        {r.status !== "confirmed" && (
          <button onClick={() => onUpdate(r.id, { status: "confirmed" })} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Confirmer</button>
        )}
        {r.status !== "cancelled" && (
          <button onClick={() => onUpdate(r.id, { status: "cancelled" })} className="text-xs font-medium text-destructive hover:text-destructive/80">Annuler</button>
        )}
      </td>
    </tr>
  );
}

// Carte responsive Mobile complète
function ReservationCardMobile({ reservation: r, onUpdate }: { reservation: Reservation; onUpdate: (id: string, fields: Partial<Reservation>) => Promise<void> }) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(r);

  const save = () => {
    onUpdate(r.id, form);
    setIsEditing(false);
  };

  return (
    <div className={cn("p-4 space-y-3 bg-card", isEditing && "bg-muted/20 border-l-4 border-primary")}>
      {/* Top de la Card : Réf & Badge */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{r.refNumber}</span>
        <StatusBadge s={r.status} />
      </div>

      {/* Contenu principal */}
      {isEditing ? (
        <div className="space-y-2 bg-background p-3 rounded border border-border">
          <input className="w-full border border-border rounded px-2 py-1.5 text-sm" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Prénom" />
          <input className="w-full border border-border rounded px-2 py-1.5 text-sm" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Nom" />
          <input className="w-full border border-border rounded px-2 py-1.5 text-sm" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" />
          
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] text-muted-foreground block mb-0.5">Arrivée</label>
              <input type="date" className="w-full border border-border rounded px-1.5 py-1 text-xs" value={new Date(form.checkInDate).toISOString().split("T")[0]} onChange={e => setForm({...form, checkInDate: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-0.5">Départ</label>
              <input type="date" className="w-full border border-border rounded px-1.5 py-1 text-xs" value={new Date(form.checkOutDate).toISOString().split("T")[0]} onChange={e => setForm({...form, checkOutDate: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-1">
            <label className="text-[10px] text-muted-foreground block mb-0.5">Nombre d'invités</label>
            <input type="number" className="w-full border border-border rounded px-2 py-1 text-sm" value={form.numberOfGuests} onChange={e => setForm({...form, numberOfGuests: parseInt(e.target.value) || 1})} />
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="font-semibold text-base">{r.firstName} {r.lastName}</div>
          <div className="text-xs text-muted-foreground">{r.email}</div>
          
          <div className="flex items-center gap-2 pt-2 text-xs text-foreground/80">
            <span>📅 {new Date(r.checkInDate).toLocaleDateString()} → {new Date(r.checkOutDate).toLocaleDateString()}</span>
            <span className="text-muted-foreground">•</span>
            <span>👥 {r.numberOfGuests} {r.numberOfGuests > 1 ? "pers." : "pers."}</span>
          </div>
          
          <div className="text-sm font-bold pt-1">
            Total : <span className="text-primary">{r.totalPrice} €</span>
          </div>
        </div>
      )}

      {/* Actions de pied de carte */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
        {isEditing ? (
          <>
            <button onClick={() => { setForm(r); setIsEditing(false); }} className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded">Annuler</button>
            <button onClick={save} className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded shadow-sm">Enregistrer</button>
          </>
        ) : (
          <>
            <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 text-xs font-medium border border-border rounded text-muted-foreground hover:text-foreground mr-auto">Modifier</button>
            {r.status !== "cancelled" && (
              <button onClick={() => onUpdate(r.id, { status: "cancelled" })} className="px-3 py-1.5 text-xs font-medium rounded bg-destructive/10 text-destructive">Annuler</button>
            )}
            {r.status !== "confirmed" && (
              <button onClick={() => onUpdate(r.id, { status: "confirmed" })} className="px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white shadow-sm">Confirmer</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}