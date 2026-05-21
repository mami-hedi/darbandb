import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { ShieldCheck, RefreshCw, StickyNote, X, Save } from 'lucide-react';

export const Route = createFileRoute('/admin/availability')({
  component: AdminAvailabilityPage,
});

interface BlockedDate {
  id: string;
  date: string;
  note: string;
}

function AdminAvailabilityPage() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [note, setNote] = useState('');

  // Correction : Utilisation du formalisme de Vite pour les variables d'environnement
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleOpenModal = (date: string) => {
    setSelectedDate(date);
    setNote('');
    setIsModalOpen(true);
  };

  const handleSaveBlock = async () => {
    if (!selectedDate) return;
    try {
      const response = await fetch(`${API_BASE}/availability/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, available: false, note: note || "Blocage manuel" })
      });

      if (response.ok) {
        const newBlock: BlockedDate = {
          // Correction : Utilisation de slice() à la place de substr() qui est déprécié
          id: Math.random().toString(36).slice(2, 11),
          date: selectedDate,
          note: note || "Indisponible",
        };
        setBlockedDates([newBlock, ...blockedDates]);
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      
      {/* MODAL DE CONFIRMATION DE BLOCAGE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="bg-blue-50 p-3 rounded-2xl"><StickyNote className="text-blue-600" /></div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Bloquer le {selectedDate} ?</h3>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Raison du blocage (ex: Travaux, Airbnb...)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-4 outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Annuler</button>
              <button onClick={handleSaveBlock} className="flex-1 bg-blue-600 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2">
                <Save size={18} /> Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SIMPLIFIÉ */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-blue-600" size={28} />
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Gestion des Disponibilités</h1>
        </div>
        <button onClick={() => window.location.reload()} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100">
          <RefreshCw className="text-slate-600" size={18} />
        </button>
      </div>

      {/* CALENDRIER PLEINE LARGEUR */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-6 md:p-10">
        <AvailabilityCalendar 
          isAdmin={true} 
          onUpdate={handleOpenModal}
          externallyBlockedDates={blockedDates.map(b => b.date)} 
        />
      </div>

    </div>
  );
}