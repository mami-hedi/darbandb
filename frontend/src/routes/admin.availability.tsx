'use client';

import { AvailabilityCalendar } from '@/components/AvailabilityCalendar';
import { Calendar, ShieldCheck, Info } from 'lucide-react';

export default function AdminAvailabilityPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2 text-slate-800">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            Gestion des Disponibilités
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cliquez sur une date pour la bloquer ou la rendre disponible immédiatement.
          </p>
        </div>

        {/* PETIT RÉCAPITULATIF / STATUTS */}
        <div className="flex items-center gap-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs font-bold text-blue-900">Synchronisé</span>
          </div>
          <div className="h-4 w-[1px] bg-blue-200" />
          <div className="text-[11px] text-blue-700 font-medium italic">
            Les modifications sont appliquées en temps réel.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLONNE GAUCHE : LE CALENDRIER (Prend 2/3 de l'espace) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              Calendrier Interactif
            </span>
          </div>
          <div className="p-6">
            <AvailabilityCalendar isAdmin={true} />
          </div>
        </div>

        {/* COLONNE DROITE : AIDE & LÉGENDE (Prend 1/3) */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Guide Rapide</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Sélectionnez le mois avec les flèches du calendrier.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Un clic sur une date <strong>blanche</strong> bloque la nuitée (indisponible).</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Un clic sur une date <strong>rouge/grise</strong> libère la nuitée.</span>
                </li>
              </ul>
            </div>
            {/* Décoration en fond */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          </div>

          <div className="p-5 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <h4 className="text-xs font-black uppercase text-slate-500 mb-3 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Note Importante
            </h4>
            <p className="text-[13px] leading-relaxed text-slate-600">
              Le blocage manuel via cet outil prévaut sur les réservations automatiques. Si vous bloquez une date, les clients ne pourront plus la sélectionner sur le site vitrine.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}