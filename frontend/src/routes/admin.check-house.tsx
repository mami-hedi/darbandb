import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from "react";
import { Check, X, Save, ClipboardCheck, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute('/admin/check-house')({
  component: CheckHousePage,
});

const HOUSE_AREAS = ["Suite 4", "Suite 3", "Suite 2", "Suite 1", "Cuisine", "Salon", "Piscine", "Jardin"];

interface AreaStatus {
  status: 'pending' | 'ok' | 'issue';
  note: string;
}

interface Reservation {
  id: string;
  firstName: string;
  lastName: string;
  checkInDate: string;
  checkOutDate: string;
  inspection: Record<string, AreaStatus>;
}

// Parse le champ inspection : il arrive comme string JSON ou null depuis la DB
function parseInspection(raw: string | Record<string, AreaStatus> | null): Record<string, AreaStatus> {
  let parsed: Record<string, AreaStatus> | null = null;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  } else if (raw && typeof raw === 'object') {
    parsed = raw;
  }

  // Complète les zones manquantes avec 'pending'
  return HOUSE_AREAS.reduce((acc, area) => ({
    ...acc,
    [area]: parsed?.[area] ?? { status: 'pending', note: '' }
  }), {} as Record<string, AreaStatus>);
}

function CheckHousePage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch(`${API_BASE}/reservations`)
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          const dataWithInspection = result.data.map((res: any) => ({
            ...res,
            inspection: parseInspection(res.inspection), // ← FIX : parse la string JSON
          }));
          setReservations(dataWithInspection);
        }
      })
      .catch(err => console.error("Erreur chargement:", err))
      .finally(() => setLoading(false));
  }, []);

  const { paginatedData, totalPages } = useMemo(() => {
    const sorted = [...reservations].sort((a, b) =>
      new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime()
    );
    const total = Math.ceil(sorted.length / itemsPerPage) || 1;
    const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    return { paginatedData: paginated, totalPages: total };
  }, [reservations, currentPage]);

  const updateArea = (resId: string, area: string, updates: Partial<AreaStatus>) => {
    setReservations(prev => prev.map(res => {
      if (res.id !== resId) return res;
      return {
        ...res,
        inspection: {
          ...res.inspection,
          [area]: { ...res.inspection[area], ...updates }
        }
      };
    }));
  };

  const saveInspection = async (res: Reservation) => {
    setSavingId(res.id);
    setSaveSuccess(null);

    try {
      const response = await fetch(`${API_BASE}/reservations/${res.id}/inspection`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspection: res.inspection }),
      });

      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);

      const refreshResponse = await fetch(`${API_BASE}/reservations`);
      const refreshData = await refreshResponse.json();

      if (refreshData.success) {
        setReservations(prev =>
          refreshData.data.map((serverRes: any) => {
            const existing = prev.find(r => r.id === serverRes.id);
            return {
              ...serverRes,
              // ← FIX : parse la string JSON du serveur, avec fallback sur l'état local
              inspection: parseInspection(serverRes.inspection ?? existing?.inspection ?? null),
            };
          })
        );
        setSaveSuccess(res.id);
        setTimeout(() => setSaveSuccess(null), 3000);
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la mise à jour de l'affichage.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-neutral-950 p-6 rounded-xl border border-neutral-800">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <ClipboardCheck className="text-amber-500" />
          Inspection Check-out
        </h2>

        <div className="flex items-center gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800 shadow-inner">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-amber-600 text-white rounded-md transition-all disabled:opacity-30 disabled:hover:bg-neutral-800"
          >
            <ChevronLeft size={18} /> Précédent
          </button>

          <div className="px-4 py-2 font-mono text-amber-400 font-bold bg-black rounded border border-neutral-800">
            {currentPage} / {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-amber-600 text-white rounded-md transition-all disabled:opacity-30 disabled:hover:bg-neutral-800"
          >
            Suivant <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {paginatedData.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">Aucune réservation à traiter.</div>
      ) : (
        paginatedData.map((res) => (
          <div key={res.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-lg hover:border-neutral-700 transition-colors">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{res.firstName} {res.lastName}</h3>
                <p className="text-neutral-400 text-sm italic">
                  Départ : {new Date(res.checkOutDate).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess === res.id && (
                  <span className="text-emerald-400 text-sm font-medium animate-pulse">
                    ✓ Sauvegardé !
                  </span>
                )}

                <button
                  onClick={() => saveInspection(res)}
                  disabled={savingId === res.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium
                    ${savingId === res.id
                      ? 'bg-neutral-700 text-neutral-400 cursor-wait'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg hover:shadow-amber-500/20 active:scale-95'
                    }`}
                >
                  {savingId === res.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {HOUSE_AREAS.map((area) => (
                <div key={area} className="border border-neutral-800 p-3 rounded-lg bg-neutral-950">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-neutral-300">{area}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => updateArea(res.id, area, { status: 'ok' })}
                        className={`p-1.5 rounded transition-colors ${res.inspection[area].status === 'ok' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:text-white'}`}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => updateArea(res.id, area, { status: 'issue' })}
                        className={`p-1.5 rounded transition-colors ${res.inspection[area].status === 'issue' ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-500 hover:text-white'}`}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  {res.inspection[area].status === 'issue' && (
                    <input
                      className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs text-white mt-2 focus:ring-1 focus:ring-amber-500 outline-none"
                      placeholder="Détails du problème..."
                      value={res.inspection[area].note}
                      onChange={(e) => updateArea(res.id, area, { note: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}