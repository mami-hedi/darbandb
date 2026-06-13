import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Tag, Plus, Trash2, Copy, CheckCircle2, XCircle,
  Loader2, Users, Search, Download, Mail
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute("/admin/promotions")({
  component: AdminPromotionsPage,
});

// ─── TYPES ────────────────────────────────────────────────────

interface PromoCode {
  id: string;
  code: string;
  pct: number;
  description: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
}

interface Subscriber {
  id: number;
  email: string;
  lang: "fr" | "en";
  createdAt: string;
}

// ─── UTILS ────────────────────────────────────────────────────

function isExpired(expiresAt: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function isExhausted(used: number, max: number | null) {
  if (max === null) return false;
  return used >= max;
}

function formatDate(iso: string | null) {
  if (!iso) return "Sans limite";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────

function AdminPromotionsPage() {
  // ── Promos state ──
  const [promos, setPromos]       = useState<PromoCode[]>([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied]       = useState<string | null>(null);
  const [error, setError]         = useState("");
  const [form, setForm]           = useState({
    code: "", pct: "", description: "", expiresAt: "", maxUses: "",
  });

  // ── Subscribers state ──
  const [subscribers, setSubscribers]         = useState<Subscriber[]>([]);
  const [loadingSubs, setLoadingSubs]         = useState(true);
  const [subSearch, setSubSearch]             = useState("");

  // ─── Chargement ───────────────────────────────────────────

  useEffect(() => {
    fetch(`${API_BASE}/promos`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setPromos(d.data); })
      .finally(() => setLoadingPromos(false));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/subscribers`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { if (d.success) setSubscribers(d.data); })
      .finally(() => setLoadingSubs(false));
  }, []);

  // ─── Stats ────────────────────────────────────────────────

  const activeCount  = promos.filter(p => !isExpired(p.expiresAt) && !isExhausted(p.usedCount, p.maxUses)).length;
  const expiredCount = promos.length - activeCount;

  const filteredSubs = subscribers.filter(s =>
    s.email.toLowerCase().includes(subSearch.toLowerCase())
  );

  // ─── Actions promos ───────────────────────────────────────

  const handleCreate = async () => {
    if (!form.code || !form.pct) return setError("Le nom et le pourcentage sont requis.");
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/promos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code:        form.code.toUpperCase().trim(),
          pct:         Number(form.pct),
          description: form.description,
          expiresAt:   form.expiresAt || null,
          maxUses:     form.maxUses ? Number(form.maxUses) : null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPromos(prev => [data.data, ...prev]);
        setForm({ code: "", pct: "", description: "", expiresAt: "", maxUses: "" });
      } else {
        setError(data.message || "Erreur lors de la création.");
      }
    } catch { setError("Erreur de connexion."); }
    finally { setSubmitting(false); }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Supprimer ce code promo ?")) return;
    await fetch(`${API_BASE}/promos/${id}`, { method: "DELETE", credentials: "include" });
    setPromos(prev => prev.filter(p => p.id !== id));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  // ─── Actions abonnés ──────────────────────────────────────

  const handleDeleteSub = async (id: number) => {
    if (!confirm("Supprimer cet abonné ?")) return;
    await fetch(`${API_BASE}/subscribers/${id}`, { method: "DELETE", credentials: "include" });
    setSubscribers(prev => prev.filter(s => s.id !== id));
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE}/subscribers/export`, "_blank");
  };

  // ─── RENDER ───────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/70 mb-1">
          — Newsletter & Promotions
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Abonnés & Codes promo
        </h1>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Abonnés",      value: subscribers.length, color: "text-sky-400",     bg: "bg-sky-500/10",     icon: <Users className="w-5 h-5 text-sky-400" /> },
          { label: "Total codes",  value: promos.length,      color: "text-amber-400",   bg: "bg-amber-500/10",   icon: <Tag className="w-5 h-5 text-amber-400" /> },
          { label: "Codes actifs", value: activeCount,        color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" /> },
          { label: "Expirés",      value: expiredCount,       color: "text-rose-400",    bg: "bg-rose-500/10",    icon: <XCircle className="w-5 h-5 text-rose-400" /> },
        ].map(s => (
          <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500">{s.label}</p>
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* GRILLE PRINCIPALE : 2 colonnes */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── COLONNE GAUCHE : Abonnés ── */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex flex-col gap-4">

          {/* En-tête abonnés */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-amber-500" /> Liste des abonnés
            </h3>
            <button
              onClick={handleExportCsv}
              className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" /> Exporter CSV
            </button>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
            <input
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-amber-500/50 placeholder:text-neutral-600"
              placeholder="Rechercher un email..."
              value={subSearch}
              onChange={e => setSubSearch(e.target.value)}
            />
          </div>

          {/* Liste */}
          <div className="flex-1 overflow-auto max-h-[480px] space-y-0.5 pr-1">
            {loadingSubs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin w-5 h-5 text-amber-500" />
              </div>
            ) : filteredSubs.length === 0 ? (
              <p className="text-xs text-neutral-600 italic text-center py-10">
                {subSearch ? "Aucun résultat." : "Aucun abonné pour l'instant."}
              </p>
            ) : (
              filteredSubs.map(sub => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-neutral-800/40 transition-colors border-b border-neutral-800/50 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3 h-3 text-sky-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm truncate">{sub.email}</p>
                      <p className="text-[10px] text-neutral-600">
                        {formatDate(sub.createdAt)}
                        {" · "}
                        <span className="uppercase">{sub.lang}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSub(sub.id)}
                    className="w-6 h-6 rounded flex items-center justify-center text-neutral-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0 ml-2"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Compteur */}
          {!loadingSubs && subscribers.length > 0 && (
            <p className="text-[10px] text-neutral-600 text-right">
              {filteredSubs.length} / {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* ── COLONNE DROITE : Codes promo ── */}
        <div className="flex flex-col gap-6">

          {/* Formulaire création */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4 text-amber-500" /> Créer un code promo
            </h3>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5">
                Nom / Code
              </label>
              <input
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50 font-mono uppercase placeholder:normal-case placeholder:text-neutral-600"
                placeholder="ex: NOEL25, ANNIVERSAIRE10..."
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5">
                  Réduction (%)
                </label>
                <input
                  type="number" min="1" max="100"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50"
                  placeholder="ex: 15"
                  value={form.pct}
                  onChange={e => setForm(f => ({ ...f, pct: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5">
                  Utilisations max
                </label>
                <input
                  type="number" min="1"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50"
                  placeholder="Illimité si vide"
                  value={form.maxUses}
                  onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5">
                Date d'expiration
              </label>
              <input
                type="date"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 block mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-amber-500/50 resize-none"
                placeholder="Description interne du code..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <button
              onClick={handleCreate}
              disabled={submitting}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" />
              }
              Créer le code
            </button>
          </div>

          {/* Liste des codes */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="font-semibold flex items-center gap-2 text-sm mb-4">
              <Tag className="w-4 h-4 text-amber-500" /> Codes existants
            </h3>

            {loadingPromos ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin w-5 h-5 text-amber-500" />
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-auto pr-1">
                {promos.map(p => {
                  const expired = isExpired(p.expiresAt) || isExhausted(p.usedCount, p.maxUses);
                  const usePct  = p.maxUses ? Math.round((p.usedCount / p.maxUses) * 100) : 0;
                  return (
                    <div
                      key={p.id}
                      className={`bg-neutral-950 border border-neutral-800 rounded-lg p-3 flex items-center gap-3 ${expired ? "opacity-60" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${expired ? "bg-rose-500/10" : "bg-emerald-500/10"}`}>
                        {expired
                          ? <XCircle className="w-4 h-4 text-rose-500" />
                          : <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        }
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono">{p.code}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${expired ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {expired ? "Expiré" : "Actif"}
                          </span>
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-neutral-500 mt-0.5 truncate">{p.description}</p>
                        )}
                        {p.maxUses && (
                          <div className="mt-1.5">
                            <p className="text-[10px] text-neutral-600">{p.usedCount} / {p.maxUses} utilisations</p>
                            <div className="w-full bg-neutral-800 h-1 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${expired ? "bg-neutral-600" : "bg-amber-500"}`}
                                style={{ width: `${usePct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-amber-500">-{p.pct}%</p>
                        <p className="text-[10px] text-neutral-600">{formatDate(p.expiresAt)}</p>
                      </div>

                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleCopy(p.code)}
                          title="Copier le code"
                          className="w-7 h-7 rounded-lg border border-neutral-800 hover:border-neutral-600 flex items-center justify-center text-neutral-500 hover:text-neutral-200 transition-colors"
                        >
                          {copied === p.code
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            : <Copy className="w-3.5 h-3.5" />
                          }
                        </button>
                        <button
                          onClick={() => handleDeletePromo(p.id)}
                          title="Supprimer"
                          className="w-7 h-7 rounded-lg border border-neutral-800 hover:border-rose-500/50 flex items-center justify-center text-neutral-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {promos.length === 0 && (
                  <p className="text-xs text-neutral-600 italic text-center py-8">
                    Aucun code promo créé.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}