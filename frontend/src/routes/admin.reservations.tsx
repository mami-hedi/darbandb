import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AdminDateRangePicker } from "@/components/Admindaterangepicker";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type Reservation = {
  id: string;
  refNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  specialRequests?: string;
  source: string;
  status: "pending" | "confirmed" | "cancelled";
  depositAmount: number;
  depositPaid: boolean;
  depositPaidAt?: string;
  depositNotes?: string;
};

export const Route = createFileRoute("/admin/reservations")({
  component: ReservationsPage,
});

// ─── TYPES TRI ────────────────────────────────────────────────

type SortField = "checkInDate" | "checkOutDate" | "lastName" | "totalPrice" | "createdAt";
type SortDir   = "asc" | "desc";

// ─── HELPER : forcer number depuis string ou DECIMAL SQL ──────
const toNum = (v: any): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
};

const fmtPrice = (v: any): string => toNum(v).toFixed(2);

// ─── PAGE PRINCIPALE ──────────────────────────────────────────

function ReservationsPage() {
  const [data, setData]           = useState<Reservation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | Reservation["status"]>("all");
  const [modalReservation, setModalReservation] = useState<Reservation | null | "new">(null);

  const [search, setSearch]           = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [sortField, setSortField]     = useState<SortField>("checkInDate");
  const [sortDir, setSortDir]         = useState<SortDir>("asc");

  const PAGE_SIZE = 7;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReservations = async () => {
    try {
      const res = await fetch(`${API_BASE}/reservations`);
      const result = await res.json();
      if (result.success) {
        // ✅ Normalise totalPrice et depositAmount depuis la DB (DECIMAL arrive en string)
        const normalized = result.data.map((r: any) => ({
          ...r,
          totalPrice:    toNum(r.totalPrice),
          depositAmount: toNum(r.depositAmount),
        }));
        setData(normalized);
      }
    } catch (e) {
      console.error("Erreur chargement:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    data.forEach(r => {
      const d = new Date(r.checkInDate);
      if (!isNaN(d.getTime())) {
        set.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
      }
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredList = useMemo(() => {
    let list = filter === "all" ? data : data.filter(r => r.status === filter);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r =>
        r.firstName.toLowerCase().includes(q) ||
        r.lastName.toLowerCase().includes(q) ||
        `${r.firstName} ${r.lastName}`.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.refNumber.toLowerCase().includes(q)
      );
    }

    if (monthFilter) {
      list = list.filter(r => {
        const d = new Date(r.checkInDate);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        return ym === monthFilter;
      });
    }

    list = [...list].sort((a, b) => {
      let va: string | number, vb: string | number;
      switch (sortField) {
        case "checkInDate":  va = a.checkInDate;  vb = b.checkInDate;  break;
        case "checkOutDate": va = a.checkOutDate; vb = b.checkOutDate; break;
        case "lastName":     va = a.lastName.toLowerCase(); vb = b.lastName.toLowerCase(); break;
        case "totalPrice":   va = toNum(a.totalPrice); vb = toNum(b.totalPrice); break;
        default:             va = a.checkInDate; vb = b.checkInDate;
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

    return list;
  }, [data, filter, search, monthFilter, sortField, sortDir]);

  useEffect(() => { setCurrentPage(1); }, [filter, search, monthFilter, sortField, sortDir]);

  const totalPages    = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const paginatedList = useMemo(
    () => filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filteredList, currentPage]
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleUpdate = async (id: string, fields: Partial<Reservation>) => {
    try {
      const res = await fetch(`${API_BASE}/reservations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const result = await res.json();
        const updated = {
          ...result.data,
          totalPrice:    toNum(result.data.totalPrice),
          depositAmount: toNum(result.data.depositAmount),
        };
        setData(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch { alert("Erreur lors de la modification"); }
  };

  const handleDeposit = async (id: string, fields: { depositAmount?: number; depositPaid?: boolean; depositNotes?: string }) => {
    try {
      const res = await fetch(`${API_BASE}/reservations/${id}/deposit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        const result = await res.json();
        const updated = {
          ...result.data,
          totalPrice:    toNum(result.data.totalPrice),
          depositAmount: toNum(result.data.depositAmount),
        };
        setData(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch { alert("Erreur mise à jour acompte"); }
  };

  const handleCreate = async (formData: any) => {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (result.success) {
      const created = {
        ...result.data,
        totalPrice:    toNum(result.data.totalPrice),
        depositAmount: toNum(result.data.depositAmount),
      };
      setData(prev => [created, ...prev]);
      setModalReservation(null);
    } else {
      alert(result.error || "Erreur lors de la création");
    }
  };

  const handleSaveEdit = async (id: string, fields: Partial<Reservation>) => {
    await handleUpdate(id, fields);
    setModalReservation(null);
  };

  const hasActiveFilters = search || monthFilter;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs uppercase tracking-widest text-muted-foreground animate-pulse">
        Chargement des réservations...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">— Administration</p>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Réservations</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex gap-1.5 overflow-x-auto pb-2 sm:pb-0 text-xs no-scrollbar">
            <FilterButton active={filter === "all"}       onClick={() => setFilter("all")}       label="Toutes"     count={data.length} />
            <FilterButton active={filter === "pending"}   onClick={() => setFilter("pending")}   label="En attente" count={data.filter(r => r.status === "pending").length} />
            <FilterButton active={filter === "confirmed"} onClick={() => setFilter("confirmed")} label="Confirmées" count={data.filter(r => r.status === "confirmed").length} />
            <FilterButton active={filter === "cancelled"} onClick={() => setFilter("cancelled")} label="Annulées"   count={data.filter(r => r.status === "cancelled").length} />
          </div>
          <button
            onClick={() => setModalReservation("new")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            <span className="text-base leading-none">+</span> Nouvelle réservation
          </button>
        </div>
      </div>

      {/* BARRE RECHERCHE / FILTRE / TRI */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, prénom, email ou référence..."
            className="w-full border border-border rounded-md pl-9 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </span>
          <select
            value={monthFilter}
            onChange={e => setMonthFilter(e.target.value)}
            className={cn(
              "border border-border rounded-md pl-9 pr-8 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer",
              monthFilter ? "text-foreground font-medium" : "text-muted-foreground"
            )}
          >
            <option value="">Tous les mois</option>
            {availableMonths.map(ym => {
              const [y, m] = ym.split("-");
              const label  = new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
              return <option key={ym} value={ym}>{label.charAt(0).toUpperCase() + label.slice(1)}</option>;
            })}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </span>
        </div>

        <div className="flex items-center gap-1.5 border border-border rounded-md bg-background px-1.5 py-1 shrink-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1.5 select-none">Tri</span>
          {(
            [
              { field: "checkInDate" as SortField, label: "Arrivée"  },
              { field: "lastName"    as SortField, label: "Nom"      },
              { field: "totalPrice"  as SortField, label: "Montant"  },
            ] as const
          ).map(({ field, label }) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap",
                sortField === field
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {label}
              {sortField === field && (
                <span className="text-[10px] leading-none">{sortDir === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearch(""); setMonthFilter(""); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground border border-border rounded-md hover:bg-muted hover:text-foreground transition-colors whitespace-nowrap shrink-0"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
            Réinitialiser
          </button>
        )}
      </div>

      {(search || monthFilter) && (
        <p className="text-xs text-muted-foreground -mt-2">
          {filteredList.length} résultat{filteredList.length !== 1 ? "s" : ""}
          {search && <> pour <span className="font-semibold text-foreground">"{search}"</span></>}
          {monthFilter && (() => {
            const [y, m] = monthFilter.split("-");
            const label = new Date(Number(y), Number(m) - 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
            return <> en <span className="font-semibold text-foreground">{label}</span></>;
          })()}
        </p>
      )}

      {/* MODAL */}
      {modalReservation !== null && (
        <ReservationModal
          reservation={modalReservation === "new" ? null : modalReservation}
          onClose={() => setModalReservation(null)}
          onCreate={handleCreate}
          onSave={handleSaveEdit}
        />
      )}

      {/* TABLEAU desktop */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 font-medium">Référence</th>
                <th className="p-4 font-medium">
                  <button onClick={() => toggleSort("lastName")} className="flex items-center gap-1 hover:text-foreground transition-colors group">
                    Client <SortIcon active={sortField === "lastName"} dir={sortDir} />
                  </button>
                </th>
                <th className="p-4 font-medium">
                  <button onClick={() => toggleSort("checkInDate")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Dates du séjour <SortIcon active={sortField === "checkInDate"} dir={sortDir} />
                  </button>
                </th>
                <th className="p-4 font-medium text-center">Pers.</th>
                <th className="p-4 font-medium">
                  <button onClick={() => toggleSort("totalPrice")} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Total <SortIcon active={sortField === "totalPrice"} dir={sortDir} />
                  </button>
                </th>
                <th className="p-4 font-medium">Acompte</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedList.map(r => (
                <ReservationRow
                  key={r.id}
                  reservation={r}
                  onUpdate={handleUpdate}
                  onDeposit={handleDeposit}
                  onEdit={() => setModalReservation(r)}
                  searchQuery={search}
                />
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-muted-foreground">
                    {hasActiveFilters ? "Aucune réservation ne correspond à votre recherche." : "Aucune réservation."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CARTES mobile */}
        <div className="grid grid-cols-1 divide-y divide-border md:hidden">
          {paginatedList.map(r => (
            <ReservationCardMobile
              key={r.id}
              reservation={r}
              onUpdate={handleUpdate}
              onDeposit={handleDeposit}
              onEdit={() => setModalReservation(r)}
            />
          ))}
          {filteredList.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              {hasActiveFilters ? "Aucune réservation ne correspond à votre recherche." : "Aucune réservation."}
            </div>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {filteredList.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredList.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

// ─── ICÔNE TRI ────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  return (
    <span className={cn("text-[10px] leading-none transition-opacity", active ? "opacity-100" : "opacity-30 group-hover:opacity-60")}>
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
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
    const items: (number | "...")[] = [];
    items.push(1);
    if (currentPage > 3) items.push("...");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      items.push(p);
    }
    if (currentPage < totalPages - 2) items.push("...");
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground tabular-nums">
        Affichage <span className="font-semibold text-foreground">{from}–{to}</span> sur{" "}
        <span className="font-semibold text-foreground">{totalItems}</span> réservation{totalItems !== 1 ? "s" : ""}
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
              <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-muted-foreground select-none">…</span>
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

// ─── HIGHLIGHT TEXTE ──────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/20 text-foreground rounded-sm px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── MODAL CRÉATION / MODIFICATION ───────────────────────────

type PricePreview = {
  nights: number;
  total: number;
  suggestedDeposit: number;
  breakdown: { date: string; price: number; isCustom: boolean }[];
};

function ReservationModal({ reservation, onClose, onCreate, onSave }: {
  reservation: Reservation | null;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  onSave: (id: string, data: Partial<Reservation>) => Promise<void>;
}) {
  const isEdit = reservation !== null;

  const [form, setForm] = useState({
    firstName:       isEdit ? reservation.firstName       : "",
    lastName:        isEdit ? reservation.lastName        : "",
    email:           isEdit ? reservation.email           : "",
    phone:           isEdit ? (reservation.phone ?? "")   : "",
    checkInDate:     isEdit ? reservation.checkInDate.split("T")[0]  : "",
    checkOutDate:    isEdit ? reservation.checkOutDate.split("T")[0] : "",
    numberOfGuests:  isEdit ? reservation.numberOfGuests  : 2,
    specialRequests: isEdit ? (reservation.specialRequests ?? "")    : "",
    status:          isEdit ? reservation.status          : "pending" as Reservation["status"],
    // ✅ toNum() garantit un vrai number, jamais string ni NaN
    depositAmount:   isEdit ? fmtPrice(reservation.depositAmount) : "",
    depositPaid:     isEdit ? reservation.depositPaid     : false,
    depositNotes:    isEdit ? (reservation.depositNotes ?? "")        : "",
    totalPrice:      isEdit ? fmtPrice(reservation.totalPrice)       : "",
  });

  const [pricePreview, setPricePreview]   = useState<PricePreview | null>(null);
  const [loadingPrice, setLoadingPrice]   = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const cin  = form.checkInDate;
    const cout = form.checkOutDate;
    if (!cin || !cout || new Date(cout) <= new Date(cin)) {
      setPricePreview(null); setLoadingPrice(false); return;
    }
    setLoadingPrice(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res  = await fetch(`${API_BASE}/reservations/price-preview?checkIn=${cin}&checkOut=${cout}`);
        const data = await res.json();
        if (data.success) {
          const p: PricePreview = {
            ...data.data,
            // ✅ Normalise les prix du preview aussi
            total:            toNum(data.data.total),
            suggestedDeposit: toNum(data.data.suggestedDeposit),
            breakdown: (data.data.breakdown || []).map((b: any) => ({
              ...b,
              price: toNum(b.price),
            })),
          };
          setPricePreview(p);
          setForm(f => ({
            ...f,
            totalPrice:    fmtPrice(p.total),
            depositAmount: f.depositAmount || fmtPrice(p.suggestedDeposit),
          }));
        }
      } catch { /* ignore */ }
      finally { setLoadingPrice(false); }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [form.checkInDate, form.checkOutDate]);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.checkInDate || !form.checkOutDate) {
      alert("Veuillez remplir tous les champs obligatoires (*)."); return;
    }
    setSubmitting(true);
    const payload = {
      ...form,
      numberOfGuests: Number(form.numberOfGuests),
      depositAmount:  form.depositAmount  ? toNum(form.depositAmount)  : undefined,
      totalPrice:     form.totalPrice     ? toNum(form.totalPrice)     : undefined,
    };
    if (isEdit) await onSave(reservation.id, payload);
    else        await onCreate(payload);
    setSubmitting(false);
  };

  const datesOk = form.checkInDate && form.checkOutDate && new Date(form.checkOutDate) > new Date(form.checkInDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl border border-border shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col lg:flex-row overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isEdit ? `Réf. ${reservation.refNumber}` : "Administration"}
              </p>
              <h2 className="text-xl font-bold mt-0.5">
                {isEdit ? "Modifier la réservation" : "Nouvelle réservation"}
              </h2>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none p-1">✕</button>
          </div>

          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Client */}
            <section>
              <h3 className={sectionTitle}>Client</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Prénom *"><input className={inputCls} value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Marie" /></Field>
                <Field label="Nom *"><input className={inputCls} value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Dupont" /></Field>
                <Field label="Email *"><input type="email" className={inputCls} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="marie@exemple.com" /></Field>
                <Field label="Téléphone"><input type="tel" className={inputCls} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+216 99 000 000" /></Field>
              </div>
            </section>

            {/* Séjour */}
            <section>
              <h3 className={sectionTitle}>Séjour</h3>
              <AdminDateRangePicker
                checkIn={form.checkInDate}
                checkOut={form.checkOutDate}
                onChange={(checkIn, checkOut) =>
                  setForm(f => ({ ...f, checkInDate: checkIn, checkOutDate: checkOut }))
                }
              />
              <div className="mt-3">
                <Field label="Nombre d'invités">
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className={inputCls}
                    value={form.numberOfGuests}
                    onChange={e => setForm({ ...form, numberOfGuests: parseInt(e.target.value) || 1 })}
                  />
                </Field>
              </div>
            </section>

            {/* Tarif */}
            <section>
              <h3 className={sectionTitle}>Tarif</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <Field label={
                  loadingPrice
                    ? "Total du séjour (calcul...)"
                    : pricePreview
                    ? `Total calculé — ${pricePreview.nights} nuit${pricePreview.nights > 1 ? "s" : ""}`
                    : "Total du séjour (TND)"
                }>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={cn(inputCls, "pr-12 font-semibold text-base", loadingPrice && "opacity-50")}
                      value={form.totalPrice}
                      onChange={e => setForm({...form, totalPrice: e.target.value})}
                      placeholder="Calculé automatiquement"
                      readOnly={loadingPrice}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">TND</span>
                    {loadingPrice && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                        <span className="block w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </span>
                    )}
                  </div>
                  {/* ✅ Affichage clair du total calculé sous le champ */}
                  {!loadingPrice && pricePreview && (
                    <p className="mt-1.5 text-xs font-semibold text-primary">
                      = {fmtPrice(pricePreview.total)} TND pour {pricePreview.nights} nuit{pricePreview.nights > 1 ? "s" : ""}
                    </p>
                  )}
                  {!loadingPrice && !pricePreview && isEdit && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Total actuel : <span className="font-semibold text-foreground">{fmtPrice(reservation!.totalPrice)} TND</span>
                    </p>
                  )}
                </Field>
                <Field label="Statut">
                  <select className={inputCls} value={form.status} onChange={e => setForm({...form, status: e.target.value as Reservation["status"]})}>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </Field>
              </div>
            </section>

            {/* Acompte */}
            <section>
              <h3 className={sectionTitle}>Acompte</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={pricePreview ? `Montant (suggéré : ${fmtPrice(pricePreview.suggestedDeposit)} TND)` : "Montant de l'acompte"}>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={cn(inputCls, "pr-12")}
                      value={form.depositAmount}
                      onChange={e => setForm({...form, depositAmount: e.target.value})}
                      placeholder={pricePreview ? fmtPrice(pricePreview.suggestedDeposit) : "0.00"}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">TND</span>
                  </div>
                </Field>
                <Field label="Encaissé">
                  <div className="flex items-center gap-3 h-10">
                    <input
                      type="checkbox"
                      id="depositPaid"
                      checked={form.depositPaid}
                      onChange={e => setForm({...form, depositPaid: e.target.checked})}
                      className="w-4 h-4 rounded accent-primary cursor-pointer"
                    />
                    <label htmlFor="depositPaid" className="text-sm cursor-pointer select-none">Acompte reçu</label>
                  </div>
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Notes de paiement">
                    <textarea
                      className={cn(inputCls, "resize-none min-h-16")}
                      value={form.depositNotes}
                      onChange={e => setForm({...form, depositNotes: e.target.value})}
                      placeholder="Référence virement, mode de paiement..."
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Infos complémentaires */}
            <section>
              <h3 className={sectionTitle}>Informations complémentaires</h3>
              <Field label="Demandes spéciales">
                <textarea
                  className={cn(inputCls, "resize-none min-h-20")}
                  value={form.specialRequests}
                  onChange={e => setForm({...form, specialRequests: e.target.value})}
                  placeholder="Allergies, préférences, heure d'arrivée..."
                />
              </Field>
            </section>
          </div>

          {/* Footer modal */}
          <div className="flex items-center justify-between gap-3 p-5 border-t border-border bg-muted/30 shrink-0">
            <div className="lg:hidden">
              {loadingPrice && <span className="text-xs text-muted-foreground animate-pulse">Calcul...</span>}
              {!loadingPrice && form.totalPrice && (
                <div>
                  {pricePreview && <span className="text-xs text-muted-foreground">{pricePreview.nights} nuit{pricePreview.nights > 1 ? "s" : ""} · </span>}
                  <span className="text-xl font-bold text-primary">{fmtPrice(form.totalPrice)} TND</span>
                </div>
              )}
              {!loadingPrice && !form.totalPrice && !datesOk && (
                <span className="text-xs text-muted-foreground italic">Saisissez les dates</span>
              )}
            </div>
            <div className="flex gap-3 ml-auto">
              <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md transition-colors">Annuler</button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {submitting ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer la réservation"}
              </button>
            </div>
          </div>
        </div>

        {/* ── SIDEBAR RÉCAP TARIF (desktop) ── */}
        <div className="hidden lg:flex flex-col w-72 border-l border-border bg-muted/20 shrink-0">
          <div className="p-5 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Récapitulatif tarif</p>
          </div>
          <div className="flex-1 p-5 flex flex-col overflow-hidden">

            {/* Aucune date */}
            {!datesOk && !loadingPrice && (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-muted-foreground">
                <span className="text-4xl opacity-20">📅</span>
                <p className="text-xs leading-relaxed">Saisissez les dates d'arrivée et de départ pour voir le tarif en temps réel.</p>
              </div>
            )}

            {/* Chargement */}
            {loadingPrice && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <div className="w-7 h-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-xs animate-pulse">Calcul du tarif...</p>
              </div>
            )}

            {/* Preview chargé ✅ */}
            {!loadingPrice && pricePreview && (
              <div className="flex flex-col gap-4 flex-1 overflow-hidden">
                {/* Total */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center shrink-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Total du séjour</p>
                  <p className="text-4xl font-bold text-primary tabular-nums">{fmtPrice(pricePreview.total)}</p>
                  <p className="text-sm font-semibold text-primary/70">TND</p>
                  <p className="text-xs text-muted-foreground mt-1">{pricePreview.nights} nuit{pricePreview.nights > 1 ? "s" : ""}</p>
                </div>

                {/* Acompte suggéré */}
                <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center shrink-0">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Acompte 30%</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Montant suggéré</p>
                  </div>
                  <span className="text-lg font-bold">{fmtPrice(pricePreview.suggestedDeposit)} <span className="text-xs font-normal text-muted-foreground">TND</span></span>
                </div>

                {/* Détail par nuit */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 shrink-0">Détail par nuit</p>
                  <div className="flex-1 overflow-y-auto space-y-1">
                    {pricePreview.breakdown.map(b => (
                      <div key={b.date} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(b.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                          {b.isCustom && (
                            <span className="ml-1 text-[9px] bg-amber-500/10 text-amber-600 px-1 rounded">spécial</span>
                          )}
                        </span>
                        <span className={cn("text-xs font-semibold tabular-nums", b.isCustom ? "text-amber-600" : "text-foreground")}>
                          {fmtPrice(b.price)} TND
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode édition sans recalcul ✅ */}
            {!loadingPrice && !pricePreview && isEdit && (
              <div className="flex-1 flex flex-col gap-4 justify-start pt-2">
                <div className="bg-muted/40 border border-border rounded-xl p-4 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Total actuel</p>
                  <p className="text-4xl font-bold text-primary tabular-nums">{fmtPrice(reservation!.totalPrice)}</p>
                  <p className="text-sm font-semibold text-primary/70">TND</p>
                  <p className="text-xs text-muted-foreground mt-1.5">Modifiez les dates pour recalculer</p>
                </div>
                <div className="bg-background border border-border rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Acompte</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {reservation!.depositPaid ? "✓ Encaissé" : "○ Non encaissé"}
                    </p>
                  </div>
                  <span className="text-lg font-bold">
                    {fmtPrice(reservation!.depositAmount)} <span className="text-xs font-normal text-muted-foreground">TND</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SOUS-COMPOSANTS ──────────────────────────────────────────

const inputCls     = "w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors";
const sectionTitle = "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide block">{label}</label>
      {children}
    </div>
  );
}

function FilterButton({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-md font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-1.5",
        active ? "bg-primary text-primary-foreground shadow-sm" : "bg-background border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      {label}
      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>{count}</span>
    </button>
  );
}

function StatusBadge({ s }: { s: Reservation["status"] }) {
  const map = {
    pending:   "bg-amber-500/10 text-amber-600 border-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  } as const;
  const labels = { pending: "En attente", confirmed: "Confirmé", cancelled: "Annulé" };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", map[s])}>
      {labels[s]}
    </span>
  );
}

function DepositBadge({ r }: { r: Reservation }) {
  const amount = toNum(r.depositAmount);
  if (!amount) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="space-y-0.5">
      <div className="text-sm font-medium">{fmtPrice(amount)} TND</div>
      {r.depositPaid ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          ✓ Payé{r.depositPaidAt && <span className="opacity-70 ml-0.5">{new Date(r.depositPaidAt).toLocaleDateString("fr-FR")}</span>}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          ○ Non payé
        </span>
      )}
    </div>
  );
}

// ─── LIGNE TABLEAU DESKTOP ────────────────────────────────────

function ReservationRow({ reservation: r, onUpdate, onDeposit, onEdit, searchQuery }: {
  reservation: Reservation;
  onUpdate: (id: string, fields: Partial<Reservation>) => Promise<void>;
  onDeposit: (id: string, fields: any) => Promise<void>;
  onEdit: () => void;
  searchQuery?: string;
}) {
  const [showDeposit, setShowDeposit] = useState(false);
  const q = searchQuery ?? "";

  return (
    <>
      <tr className="hover:bg-muted/30 transition-colors">
        <td className="p-4 font-mono text-xs text-muted-foreground">
          <Highlight text={r.refNumber} query={q} />
        </td>
        <td className="p-4">
          <div className="font-semibold">
            <Highlight text={`${r.firstName} ${r.lastName}`} query={q} />
          </div>
          <div className="text-xs text-muted-foreground">
            <Highlight text={r.email} query={q} />
          </div>
          {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
        </td>
        <td className="p-4 text-sm">
          <span className="font-medium">{new Date(r.checkInDate).toLocaleDateString("fr-FR")}</span>
          <span className="text-muted-foreground mx-1.5">→</span>
          <span className="font-medium">{new Date(r.checkOutDate).toLocaleDateString("fr-FR")}</span>
        </td>
        <td className="p-4 text-center font-medium">{r.numberOfGuests}</td>
        {/* ✅ toNum() ici — jamais de NaN ou "object" affiché */}
        <td className="p-4 font-semibold tabular-nums">{fmtPrice(r.totalPrice)} TND</td>
        <td className="p-4"><DepositBadge r={r} /></td>
        <td className="p-4"><StatusBadge s={r.status} /></td>
        <td className="p-4 text-right space-x-2 whitespace-nowrap">
          <button onClick={onEdit} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">Modifier</button>
          {r.status !== "confirmed" && (
            <button onClick={() => onUpdate(r.id, { status: "confirmed" })} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">Confirmer</button>
          )}
          {r.status !== "cancelled" && (
            <button onClick={() => onUpdate(r.id, { status: "cancelled" })} className="text-xs font-medium text-destructive hover:text-destructive/80">Annuler</button>
          )}
        </td>
      </tr>
      {showDeposit && (
        <tr className="bg-muted/10">
          <td colSpan={8} className="px-6 pb-4">
            <DepositInlinePanel r={r} onDeposit={onDeposit} onClose={() => setShowDeposit(false)} />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── CARTE MOBILE ─────────────────────────────────────────────

function ReservationCardMobile({ reservation: r, onUpdate, onDeposit, onEdit }: {
  reservation: Reservation;
  onUpdate: (id: string, fields: Partial<Reservation>) => Promise<void>;
  onDeposit: (id: string, fields: any) => Promise<void>;
  onEdit: () => void;
}) {
  const [showDeposit, setShowDeposit] = useState(false);

  return (
    <div className="p-4 space-y-3 bg-card">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{r.refNumber}</span>
        <StatusBadge s={r.status} />
      </div>
      <div className="space-y-1">
        <div className="font-semibold text-base">{r.firstName} {r.lastName}</div>
        <div className="text-xs text-muted-foreground">{r.email}</div>
        {r.phone && <div className="text-xs text-muted-foreground">{r.phone}</div>}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-foreground/80">
          <span>📅 {new Date(r.checkInDate).toLocaleDateString("fr-FR")} → {new Date(r.checkOutDate).toLocaleDateString("fr-FR")}</span>
          <span className="text-muted-foreground">•</span>
          <span>👥 {r.numberOfGuests} pers.</span>
        </div>
        {/* ✅ fmtPrice ici aussi */}
        <div className="text-sm font-bold pt-1">Total : <span className="text-primary">{fmtPrice(r.totalPrice)} TND</span></div>
        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          <DepositBadge r={r} />
          <button onClick={() => setShowDeposit(!showDeposit)} className="text-[10px] font-medium border border-border rounded px-2 py-1 text-muted-foreground hover:text-foreground">
            {showDeposit ? "Fermer" : "Acompte"}
          </button>
        </div>
        {showDeposit && <DepositInlinePanel r={r} onDeposit={onDeposit} onClose={() => setShowDeposit(false)} />}
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
        <button onClick={onEdit} className="px-3 py-1.5 text-xs font-medium border border-border rounded text-muted-foreground hover:text-foreground mr-auto">Modifier</button>
        {r.status !== "cancelled" && (
          <button onClick={() => onUpdate(r.id, { status: "cancelled" })} className="px-3 py-1.5 text-xs font-medium rounded bg-destructive/10 text-destructive">Annuler</button>
        )}
        {r.status !== "confirmed" && (
          <button onClick={() => onUpdate(r.id, { status: "confirmed" })} className="px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white shadow-sm">Confirmer</button>
        )}
      </div>
    </div>
  );
}

// ─── PANEL ACOMPTE INLINE ─────────────────────────────────────

function DepositInlinePanel({ r, onDeposit, onClose }: {
  r: Reservation;
  onDeposit: (id: string, fields: any) => Promise<void>;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(fmtPrice(r.depositAmount));
  const [paid, setPaid]     = useState(r.depositPaid);
  const [notes, setNotes]   = useState(r.depositNotes || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onDeposit(r.id, {
      depositAmount: amount ? toNum(amount) : undefined,
      depositPaid:   paid,
      depositNotes:  notes,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="mt-2 p-4 bg-background border border-border rounded-lg space-y-3 shadow-sm max-w-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gestion de l'acompte</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Montant (TND)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="w-full border border-border rounded px-2 py-1.5 text-sm bg-background"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div className="flex items-end pb-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
            <span className="text-sm">Encaissé</span>
          </label>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-muted-foreground block mb-1">Notes</label>
        <textarea
          className="w-full border border-border rounded px-2 py-1.5 text-xs bg-background resize-none min-h-14"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Référence virement, mode de paiement..."
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="text-xs text-muted-foreground hover:underline px-3 py-1.5">Annuler</button>
        <button
          onClick={save}
          disabled={saving}
          className="text-xs font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}