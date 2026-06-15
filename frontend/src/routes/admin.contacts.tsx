import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from "react";
import { Mail, Phone, Tag, Trash2, ChevronLeft, ChevronRight, Loader2, Eye, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute('/admin/contacts')({
  component: ContactsPage,
});

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

const SUBJECT_LABELS: Record<string, string> = {
  general:     'Demande générale',
  service:     'Service & Prestations',
  partnership: 'Partenariat',
  support:     'Assistance',
  other:       'Autre',
};

const SUBJECT_COLORS: Record<string, string> = {
  general:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  service:     'bg-amber-500/10 text-amber-400 border-amber-500/20',
  partnership: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  support:     'bg-red-500/10 text-red-400 border-red-500/20',
  other:       'bg-neutral-500/10 text-neutral-400 border-neutral-500/20',
};

// ── Modal détail message ──────────────────────────────────────────
function ContactModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[500] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 mb-1">Message reçu</p>
            <h2 className="text-white font-semibold">{contact.firstName} {contact.lastName}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X size={18} className="text-neutral-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Infos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 mb-1">Email</p>
              <a href={`mailto:${contact.email}`} className="text-sm text-white hover:text-amber-400 transition-colors">
                {contact.email}
              </a>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 mb-1">Téléphone</p>
              <p className="text-sm text-white">{contact.phone || '—'}</p>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 mb-1">Sujet</p>
              <span className={`text-xs px-2 py-0.5 rounded border ${SUBJECT_COLORS[contact.subject]}`}>
                {SUBJECT_LABELS[contact.subject] ?? contact.subject}
              </span>
            </div>
            <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg">
              <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 mb-1">Date</p>
              <p className="text-sm text-white">
                {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <p className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 mb-3">Message</p>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>

          {/* Répondre */}
          
            <a href={`mailto:${contact.email}?subject=Re: ${SUBJECT_LABELS[contact.subject] ?? contact.subject} — Dar B&B`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black text-xs font-semibold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors rounded-lg"
          >
            <Mail size={14} /> Répondre par email
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────
function ContactsPage() {
  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<Contact | null>(null);
  const [filterSubject, setFilter]    = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const itemsPerPage = 8;

  // Chargement
  useEffect(() => {
    fetch(`${API_BASE}/contacts`)
      .then(r => r.json())
      .then(d => setContacts(d.data ?? d))
      .catch(err => console.error('Erreur contacts:', err))
      .finally(() => setLoading(false));
  }, []);

  // Filtrage + pagination
  const { paginated, totalPages, filtered } = useMemo(() => {
    const f = filterSubject === 'all'
      ? contacts
      : contacts.filter(c => c.subject === filterSubject);
    const sorted = [...f].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const total = Math.ceil(sorted.length / itemsPerPage) || 1;
    return {
      filtered:   sorted,
      paginated:  sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
      totalPages: total,
    };
  }, [contacts, filterSubject, currentPage]);

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce message ?')) return;
    setDeletingId(id);
    try {
      await fetch(`${API_BASE}/contacts/${id}`, { method: 'DELETE' });
      setContacts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Erreur suppression:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={48} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">

      {selected && <ContactModal contact={selected} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-neutral-500 mb-1">Administration</p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Mail className="text-amber-500" size={22} />
              Messages Contact
              <span className="text-sm font-normal text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full border border-neutral-800">
                {filtered.length}
              </span>
            </h1>
          </div>

          {/* Filtre sujet */}
          <div className="flex flex-wrap gap-2">
            {['all', ...Object.keys(SUBJECT_LABELS)].map(s => (
              <button
                key={s}
                onClick={() => { setFilter(s); setCurrentPage(1); }}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  filterSubject === s
                    ? 'bg-amber-500 text-black border-amber-500 font-semibold'
                    : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
              >
                {s === 'all' ? 'Tous' : SUBJECT_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-neutral-500">Aucun message trouvé.</div>
      ) : (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-[10px] tracking-[0.2em] uppercase text-neutral-500">
                <th className="text-left px-6 py-4">Expéditeur</th>
                <th className="text-left px-6 py-4 hidden md:table-cell">Sujet</th>
                <th className="text-left px-6 py-4 hidden lg:table-cell">Contact</th>
                <th className="text-left px-6 py-4 hidden md:table-cell">Date</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/50">
              {paginated.map(c => (
                <tr key={c.id} className="hover:bg-neutral-900/50 transition-colors group">

                  {/* Nom */}
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{c.firstName} {c.lastName}</p>
                    <p className="text-neutral-500 text-xs mt-0.5 md:hidden">{c.email}</p>
                  </td>

                  {/* Sujet */}
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={`text-xs px-2 py-1 rounded border ${SUBJECT_COLORS[c.subject]}`}>
                      {SUBJECT_LABELS[c.subject] ?? c.subject}
                    </span>
                  </td>

                  {/* Email / Tel */}
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1.5 text-neutral-300 text-xs">
                        <Mail size={11} className="text-neutral-500" /> {c.email}
                      </span>
                      {c.phone && (
                        <span className="flex items-center gap-1.5 text-neutral-400 text-xs">
                          <Phone size={11} className="text-neutral-500" /> {c.phone}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 hidden md:table-cell text-neutral-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelected(c)}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-amber-500 text-neutral-400 hover:text-black transition-colors"
                        title="Voir le message"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-2 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-40"
                        title="Supprimer"
                      >
                        {deletingId === c.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 px-6 py-4 border-t border-neutral-800">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-amber-600 text-white rounded-lg transition-all disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Précédent
              </button>
              <span className="text-amber-400 font-mono font-bold bg-black px-4 py-2 rounded border border-neutral-800">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-amber-600 text-white rounded-lg transition-all disabled:opacity-30"
              >
                Suivant <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}