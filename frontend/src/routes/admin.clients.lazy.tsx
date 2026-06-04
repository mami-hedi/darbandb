import { createLazyFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface Client {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  stays: number;
  totalSpent: number;
}

// ─── PAGE PRINCIPALE ──────────────────────────────────────────

const ClientsPage = () => {
  const [clients, setClients]     = useState<Client[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ── Pagination ──
  const PAGE_SIZE   = 7;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);

      // Deux appels en parallèle : liste clients + stats dashboard
      const [clientsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/reservations/clients-list`),
        fetch(`${API_BASE}/reservations/admin/stats`),
      ]);

      if (!clientsRes.ok) throw new Error(`Erreur serveur: ${clientsRes.status}`);

      const clientsResult = await clientsRes.json();
      if (clientsResult.success) setClients(clientsResult.data);
      else throw new Error(clientsResult.error || "Une erreur est survenue");

      // CA depuis le dashboard — même source que la page Pilotage (hors annulées)
      if (statsRes.ok) {
        const statsResult = await statsRes.json();
        if (statsResult.success && statsResult.data?.totals?.revenue != null) {
          setTotalRevenue(statsResult.data.totals.revenue);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alias utilisé par le bouton "Réessayer"
  const fetchClients = fetchAll;

  const filteredClients = useMemo(() =>
    clients.filter(c =>
      c.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [clients, searchTerm]
  );

  const totalPages     = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const paginatedClients = useMemo(
    () => filteredClients.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredClients, currentPage]
  );

  // Utilise le CA du dashboard (hors annulées) si disponible, sinon somme locale
  const totalCA = totalRevenue ?? clients.reduce((acc, c) => acc + Number(c.totalSpent), 0);

  // ── Initiales avatar ──
  const initials = (c: Client) =>
    `${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase();

  // ── Couleur avatar déterministe ──
  const avatarColor = (email: string) => {
    const colors = [
      "bg-blue-500",  "bg-violet-500", "bg-emerald-500",
      "bg-amber-500", "bg-rose-500",   "bg-cyan-500",
      "bg-indigo-500","bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Chargement de la base clients...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">

      {/* ── HEADER ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">— Administration</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Clients</h1>
        </div>

        {/* Recherche */}
        <div className="relative w-full sm:w-72">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border border-border rounded-md pl-9 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
          label="Base Clients"
          value={String(clients.length)}
          sub={`${filteredClients.length !== clients.length ? `${filteredClients.length} filtrés · ` : ""}clients enregistrés`}
          accent="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
            </svg>
          }
          label="Chiffre d'affaires total"
          value={`${totalCA.toLocaleString("fr-FR")} TND`}
          sub={totalRevenue != null ? "réservations confirmées (hors annulées)" : "toutes réservations confondues"}
          accent="text-emerald-600"
          bg="bg-emerald-500/10"
        />
      </div>

      {/* ── ERREUR ── */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 flex flex-col items-center text-center gap-3">
          <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
          </svg>
          <p className="text-sm font-semibold text-destructive">Erreur de synchronisation</p>
          <p className="text-xs text-muted-foreground max-w-sm">{error}</p>
          <button
            onClick={fetchClients}
            className="px-4 py-2 text-xs font-semibold bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── TABLEAU ── */}
      {!error && (
        <>
          {/* Compteur résultats */}
          {searchTerm && (
            <p className="text-xs text-muted-foreground -mt-2">
              {filteredClients.length} résultat{filteredClients.length !== 1 ? "s" : ""} pour{" "}
              <span className="font-semibold text-foreground">"{searchTerm}"</span>
            </p>
          )}

          <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-medium">#</th>
                    <th className="p-4 font-medium">Client</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium text-center">Séjours</th>
                    <th className="p-4 font-medium text-right">Chiffre d'affaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedClients.map((client, idx) => {
                    const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                    return (
                      <tr key={client.email} className="hover:bg-muted/30 transition-colors">
                        {/* Index */}
                        <td className="p-4 font-mono text-xs text-muted-foreground">{globalIdx}</td>

                        {/* Client */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-full text-white flex items-center justify-center text-xs font-bold shrink-0",
                              avatarColor(client.email)
                            )}>
                              {initials(client)}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {client.firstName} {client.lastName}
                              </div>
                              <div className="text-[10px] font-mono text-muted-foreground">
                                FID-2026-{globalIdx}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                              </svg>
                              {client.email}
                            </div>
                            {client.phone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 4.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 11a16 16 0 0 0 5 5l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08z"/>
                                </svg>
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Séjours */}
                        <td className="p-4 text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                            client.stays >= 3
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : client.stays >= 2
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}>
                            {client.stays} séjour{client.stays > 1 ? "s" : ""}
                          </span>
                        </td>

                        {/* CA */}
                        <td className="p-4 text-right font-semibold tabular-nums">
                          {Number(client.totalSpent).toLocaleString("fr-FR")}
                          <span className="text-xs font-normal text-muted-foreground ml-1">TND</span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        {searchTerm ? "Aucun client ne correspond à votre recherche." : "Aucun client enregistré."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="grid grid-cols-1 divide-y divide-border md:hidden">
              {paginatedClients.map((client, idx) => {
                const globalIdx = (currentPage - 1) * PAGE_SIZE + idx + 1;
                return (
                  <div key={client.email} className="p-4 space-y-3 bg-card">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0",
                        avatarColor(client.email)
                      )}>
                        {initials(client)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold">{client.firstName} {client.lastName}</div>
                        <div className="text-[10px] font-mono text-muted-foreground">FID-2026-{globalIdx}</div>
                      </div>
                      <div className="ml-auto">
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border",
                          client.stays >= 3
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : client.stays >= 2
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        )}>
                          {client.stays} séjour{client.stays > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1 pl-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                        </svg>
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 15a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.9 4.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 11a16 16 0 0 0 5 5l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 17l.92-.08z"/>
                          </svg>
                          {client.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/60">
                      <span className="text-xs text-muted-foreground">Chiffre d'affaires</span>
                      <span className="font-semibold tabular-nums text-sm">
                        {Number(client.totalSpent).toLocaleString("fr-FR")}
                        <span className="text-xs font-normal text-muted-foreground ml-1">TND</span>
                      </span>
                    </div>
                  </div>
                );
              })}
              {filteredClients.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchTerm ? "Aucun client ne correspond à votre recherche." : "Aucun client enregistré."}
                </div>
              )}
            </div>
          </div>

          {/* ── PAGINATION ── */}
          {filteredClients.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClients.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, accent, bg }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  accent: string;
  bg: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card shadow-sm p-5 flex items-center gap-4">
      <div className={cn("p-3 rounded-lg shrink-0", bg, accent)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5 truncate">{value}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────

function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const from = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const to   = Math.min(currentPage * pageSize, totalItems);

  const pages = useMemo((): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items: (number | "...")[] = [1];
    if (currentPage > 3) items.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) items.push(p);
    if (currentPage < totalPages - 2) items.push("...");
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground tabular-nums">
        Affichage <span className="font-semibold text-foreground">{from}–{to}</span> sur{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> client{totalItems !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-md bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          <span className="hidden sm:inline">Précédent</span>
        </button>
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e-${i}`} className="px-1.5 text-xs text-muted-foreground select-none">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={cn(
                  "min-w-[2rem] h-8 px-2 text-xs font-medium rounded-md transition-colors",
                  currentPage === p
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {p}
              </button>
            )
          )}
        </div>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-md bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span className="hidden sm:inline">Suivant</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>
    </div>
  );
}

export const Route = createLazyFileRoute('/admin/clients')({
  component: ClientsPage,
});