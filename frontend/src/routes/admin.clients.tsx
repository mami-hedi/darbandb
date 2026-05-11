import { createFileRoute } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  TrendingUp, 
  AlertCircle, 
  Loader2,
  UserCheck
} from 'lucide-react';

// Interface mise à jour (sans nationality)
interface Client {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  stays: number;
  totalSpent: number;
}

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5000/api/reservations/clients-list');
      
      if (!response.ok) throw new Error(`Erreur serveur: ${response.status}`);
      
      const result = await response.json();
      if (result.success) {
        setClients(result.data);
      } else {
        throw new Error(result.error || "Une erreur est survenue");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => 
    client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 animate-pulse">Chargement de la base clients...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Recherche */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Gestion des Clients
          </h1>
          <p className="text-gray-500">Historique et fidélité de vos voyageurs.</p>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Nom, email..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-80 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div className="text-red-800 font-bold text-lg">Erreur de synchronisation</div>
          <p className="text-red-600 max-w-md">{error}</p>
          <button onClick={fetchClients} className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
            Réessayer la connexion
          </button>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Client</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                    
                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Chiffre d'Affaires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client, index) => (
                      <tr key={index} className="hover:bg-blue-50/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                              {client.firstName?.[0]}{client.lastName?.[0]}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                                {client.lastName} {client.firstName}
                              </div>
                              <div className="text-[10px] font-mono text-gray-400 italic">FID-2026-{index + 1}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail className="w-3.5 h-3.5 text-blue-400" />
                              {client.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-3.5 h-3.5 text-green-400" />
                              {client.phone}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-right font-black text-gray-800">
                          {Number(client.totalSpent).toLocaleString('fr-FR')} <span className="text-xs font-normal text-gray-400">TND</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">
                        Aucun client correspondant à votre recherche.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Base Clients</p>
                <p className="text-3xl font-black text-gray-900">{clients.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
              <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">CA Total</p>
                <p className="text-3xl font-black text-gray-900">
                  {clients.reduce((acc, curr) => acc + Number(curr.totalSpent), 0).toLocaleString('fr-FR')} <span className="text-sm">TND</span>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Intégration TanStack Router
export const Route = createFileRoute('/admin/clients')({
  component: ClientsPage,
});

export default ClientsPage;