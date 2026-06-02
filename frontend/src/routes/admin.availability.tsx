// ============================================
// Page Admin : Gestion des Disponibilités
// @/routes/admin/availability.tsx
//
// FONCTIONNALITÉS :
//  • Calendrier 2 mois admin avec états couleur
//  • Clic date dispo → modale "Bloquer" avec note + raison
//  • Clic date bloquée manuellement → modale "Débloquer"
//  • Liste des blocages manuels actifs avec suppression
//  • Persist via API POST/DELETE /availability/toggle
//  • Rechargement du calendrier après chaque action
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck, RefreshCw, Lock, Unlock, X, Save,
  Wrench, Heart, Sparkles, CalendarOff, Trash2, StickyNote,
} from 'lucide-react';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const Route = createFileRoute('/admin/availability')({
  component: AdminAvailabilityPage,
});

// ─── Types ───────────────────────────────────────────────────────────────────
interface BlockEntry {
  id: string;
  date: string;
  note: string;
  reason: BlockReason;
  createdAt: string;
}

type BlockReason = 'maintenance' | 'cleaning' | 'family' | 'other';

const REASON_META: Record<BlockReason, { label: string; icon: React.ReactNode; color: string }> = {
  maintenance: {
    label: 'Entretien / Travaux',
    icon: <Wrench size={14} />,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  cleaning:    {
    label: 'Nettoyage / Ménage',
    icon: <Sparkles size={14} />,
    color: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  family:      {
    label: 'Usage familial / Privé',
    icon: <Heart size={14} />,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  other:       {
    label: 'Autre raison',
    icon: <CalendarOff size={14} />,
    color: 'bg-stone-100 text-stone-700 border-stone-200',
  },
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Composant principal ──────────────────────────────────────────────────────
function AdminAvailabilityPage() {
  // Blocages enregistrés (persistés via API)
  const [blocks, setBlocks] = useState<BlockEntry[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);

  // Clé pour forcer le re-render du calendrier après action
  const [calendarKey, setCalendarKey] = useState(0);

  // Modale BLOQUER
  const [blockModal, setBlockModal] = useState<{
    open: boolean;
    date: string;
  }>({ open: false, date: '' });
  const [blockNote, setBlockNote] = useState('');
  const [blockReason, setBlockReason] = useState<BlockReason>('maintenance');
  const [saving, setSaving] = useState(false);

  // Modale DÉBLOQUER
  const [unblockModal, setUnblockModal] = useState<{
    open: boolean;
    date: string;
    entry: BlockEntry | null;
  }>({ open: false, date: '', entry: null });

  const noteRef = useRef<HTMLTextAreaElement>(null);

  // ── Dériver Set et Map depuis blocks ──────────────────────────────────────────
  const manuallyBlockedDates = new Set(blocks.map(b => b.date));
  const blockNotes: Record<string, string> = {};
  blocks.forEach(b => {
    blockNotes[b.date] = `${REASON_META[b.reason].label}${b.note ? ` — ${b.note}` : ''}`;
  });

  // ── Fetch liste des blocages depuis l'API ─────────────────────────────────────
  const fetchBlocks = useCallback(async () => {
    setLoadingBlocks(true);
    try {
      const res = await fetch(`${API_BASE}/availability/blocks`);
      const data = await res.json();
      if (data.success) {
        setBlocks(data.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement blocages:', err);
    } finally {
      setLoadingBlocks(false);
    }
  }, []);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // ── Ouvrir modale blocage ─────────────────────────────────────────────────────
  const handleRequestBlock = (date: string) => {
    setBlockNote('');
    setBlockReason('maintenance');
    setBlockModal({ open: true, date });
    setTimeout(() => noteRef.current?.focus(), 100);
  };

  // ── Ouvrir modale déblocage ───────────────────────────────────────────────────
  const handleRequestUnblock = (date: string) => {
    const entry = blocks.find(b => b.date === date) || null;
    setUnblockModal({ open: true, date, entry });
  };

  // ── Confirmer le blocage ──────────────────────────────────────────────────────
  const handleConfirmBlock = async () => {
    if (!blockModal.date) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: blockModal.date,
          available: false,
          note: blockNote || REASON_META[blockReason].label,
          reason: blockReason,
          manualBlock: true,
        }),
      });

      if (res.ok) {
        const newBlock: BlockEntry = {
          id: Math.random().toString(36).slice(2, 11),
          date: blockModal.date,
          note: blockNote,
          reason: blockReason,
          createdAt: new Date().toISOString(),
        };
        setBlocks(prev => [newBlock, ...prev].sort((a, b) => a.date.localeCompare(b.date)));
        setBlockModal({ open: false, date: '' });
        setCalendarKey(k => k + 1);
      } else {
        alert("Erreur lors du blocage");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  // ── Confirmer le déblocage ────────────────────────────────────────────────────
  const handleConfirmUnblock = async () => {
    if (!unblockModal.date) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: unblockModal.date,
          available: true,
          manualBlock: true,
        }),
      });

      if (res.ok) {
        setBlocks(prev => prev.filter(b => b.date !== unblockModal.date));
        setUnblockModal({ open: false, date: '', entry: null });
        setCalendarKey(k => k + 1);
      } else {
        alert("Erreur lors du déblocage");
      }
    } catch {
      alert("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  // ── Formater une date pour l'affichage ────────────────────────────────────────
  const formatDate = (dateStr: string) =>
    format(new Date(dateStr + 'T00:00:00'), 'EEEE dd MMMM yyyy', { locale: fr });

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">

      {/* ── MODALE BLOCAGE ── */}
      {blockModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Header violet */}
            <div className="bg-violet-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Lock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-violet-200 uppercase tracking-widest font-semibold">
                    Blocage manuel
                  </p>
                  <h3 className="text-white font-black text-lg capitalize">
                    {formatDate(blockModal.date)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setBlockModal({ open: false, date: '' })}
                className="text-white/60 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corps */}
            <div className="p-6 space-y-5">

              {/* Sélecteur de raison */}
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
                  Raison du blocage
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(REASON_META) as [BlockReason, typeof REASON_META[BlockReason]][]).map(([key, meta]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setBlockReason(key)}
                      className={[
                        'flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all',
                        blockReason === key
                          ? `${meta.color} ring-2 ring-offset-1 ring-violet-400`
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100',
                      ].join(' ')}
                    >
                      {meta.icon}
                      {meta.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note libre */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                  <StickyNote size={11} />
                  Note (optionnelle)
                </label>
                <textarea
                  ref={noteRef}
                  value={blockNote}
                  onChange={e => setBlockNote(e.target.value)}
                  placeholder="Ex : Rénovation salle de bain, mariage cousins, séjour personnel..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setBlockModal({ open: false, date: '' })}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-violet-600 hover:bg-violet-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Lock size={15} />
                      Bloquer la date
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE DÉBLOCAGE ── */}
      {unblockModal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">

            {/* Header vert */}
            <div className="bg-emerald-600 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-xl">
                  <Unlock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">
                    Déblocage
                  </p>
                  <h3 className="text-white font-black text-lg capitalize">
                    {formatDate(unblockModal.date)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setUnblockModal({ open: false, date: '', entry: null })}
                className="text-white/60 hover:text-white transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Rappel de la raison du blocage */}
              {unblockModal.entry && (
                <div className={[
                  'flex items-start gap-3 p-3 rounded-xl border text-sm',
                  REASON_META[unblockModal.entry.reason].color,
                ].join(' ')}>
                  {REASON_META[unblockModal.entry.reason].icon}
                  <div>
                    <p className="font-semibold text-xs">{REASON_META[unblockModal.entry.reason].label}</p>
                    {unblockModal.entry.note && (
                      <p className="text-xs opacity-80 mt-0.5">{unblockModal.entry.note}</p>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-slate-500">
                Rendre cette date à nouveau disponible à la réservation ?
              </p>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setUnblockModal({ open: false, date: '', entry: null })}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 transition text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUnblock}
                  disabled={saving}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Unlock size={15} />
                      Débloquer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 p-2.5 rounded-xl">
            <ShieldCheck className="text-violet-600" size={22} />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 uppercase tracking-tight">
              Gestion des Disponibilités
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cliquez sur une date disponible pour la bloquer, sur une date violette pour la débloquer.
            </p>
          </div>
        </div>
        <button
          onClick={() => { fetchBlocks(); setCalendarKey(k => k + 1); }}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition"
          title="Rafraîchir"
        >
          <RefreshCw className={`text-slate-500 ${loadingBlocks ? 'animate-spin' : ''}`} size={17} />
        </button>
      </div>

      {/* ── CALENDRIER ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <AvailabilityCalendar
          key={calendarKey}
          isAdmin={true}
          onRequestBlock={handleRequestBlock}
          onRequestUnblock={handleRequestUnblock}
          manuallyBlockedDates={manuallyBlockedDates}
          blockNotes={blockNotes}
        />
      </div>

      {/* ── LISTE DES BLOCAGES ACTIFS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-violet-500" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Dates bloquées manuellement
            </h2>
            {blocks.length > 0 && (
              <span className="bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {blocks.length}
              </span>
            )}
          </div>
        </div>

        {blocks.length === 0 ? (
          <div className="py-12 text-center">
            <CalendarOff className="mx-auto text-slate-300 mb-3" size={36} />
            <p className="text-sm text-slate-400">Aucun blocage manuel actif</p>
            <p className="text-xs text-slate-300 mt-1">
              Cliquez sur une date dans le calendrier pour la bloquer
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {blocks.map(block => {
              const meta = REASON_META[block.reason];
              return (
                <div
                  key={block.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition group"
                >
                  <div className="flex items-center gap-4">
                    {/* Badge raison */}
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${meta.color}`}>
                      {meta.icon}
                      {meta.label}
                    </span>

                    {/* Date + note */}
                    <div>
                      <p className="text-sm font-bold text-slate-800 capitalize">
                        {formatDate(block.date)}
                      </p>
                      {block.note && (
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <StickyNote size={10} />
                          {block.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bouton débloquer */}
                  <button
                    onClick={() => handleRequestUnblock(block.date)}
                    title="Débloquer cette date"
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-2 rounded-xl transition opacity-0 group-hover:opacity-100"
                  >
                    <Unlock size={13} />
                    Débloquer
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}