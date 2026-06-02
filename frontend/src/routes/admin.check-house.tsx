import { useState } from "react";
import { Check, X, Save } from "lucide-react";

// Exemple de type pour la donnée
interface CheckHouseData {
  id: string;
  client: string;
  date: string;
  status: 'pending' | 'ok' | 'issue';
  note: string;
}

function CheckHousePage() {
  const [reservations, setReservations] = useState<CheckHouseData[]>([
    { id: '1', client: 'Jean Dupont', date: '02/06/2026', status: 'pending', note: '' },
    // ... fetch depuis votre API ici
  ]);

  const updateStatus = (id: string, status: 'ok' | 'issue') => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-display mb-6">Vérification de la maison</h2>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase">
            <th className="p-4">Client</th>
            <th className="p-4">Date Séjour</th>
            <th className="p-4">État</th>
            <th className="p-4">Note (Maintenance)</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((res) => (
            <tr key={res.id} className="border-b border-neutral-900">
              <td className="p-4">{res.client}</td>
              <td className="p-4">{res.date}</td>
              <td className="p-4 flex gap-2">
                <button 
                  onClick={() => updateStatus(res.id, 'ok')}
                  className={`p-2 ${res.status === 'ok' ? 'bg-emerald-900 text-emerald-400' : 'bg-neutral-800'}`}
                ><Check size={16} /></button>
                <button 
                  onClick={() => updateStatus(res.id, 'issue')}
                  className={`p-2 ${res.status === 'issue' ? 'bg-red-900 text-red-400' : 'bg-neutral-800'}`}
                ><X size={16} /></button>
              </td>
              <td className="p-4">
                <input 
                  className="bg-neutral-900 border border-neutral-800 p-2 w-full text-xs"
                  placeholder="Ex: Piscine à nettoyer..."
                  value={res.note}
                  onChange={(e) => {/* Logique de mise à jour */}}
                />
              </td>
              <td className="p-4">
                <button className="text-white hover:text-amber-400"><Save size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}