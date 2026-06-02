import { createFileRoute } from "@tanstack/react-router";
import { Utensils, Wheat, Fish, Wine, Star } from "lucide-react"; // Ajout des imports manquants

export const Route = createFileRoute("/order-client")({
  component: OrderClient,
});

function OrderClient() {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-stone-50 text-stone-800">
      {/* En-tête */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display text-amber-900 mb-2">Dar B&B</h1>
        <p className="text-stone-500 uppercase tracking-widest text-sm">Maison d'hôtes - Hammamet</p>
        <div className="flex justify-center items-center gap-4 mt-6">
          <Star className="text-amber-700" size={20} />
          <h2 className="text-2xl font-semibold">Saveurs de la maison</h2>
          <Star className="text-amber-700" size={20} />
        </div>
        <p className="mt-2 italic text-stone-600">Cuisine tunisienne authentique préparée avec amour</p>
      </div>

      {/* Grille des menus */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Menu Couscous */}
        <div className="border border-stone-200 p-6 rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-amber-900">
            <Wheat size={24} />
            <h3 className="text-xl font-bold uppercase">Menu Couscous Agneau</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 mb-6">
            <li>• Soupe traditionnelle</li>
            <li>• Salade verte</li>
            <li>• Salade méchouia</li>
            <li>• Brick tunisienne</li>
          </ul>
          <div className="pt-4 border-t border-stone-100">
            <p className="font-bold text-stone-800">PLAT PRINCIPAL :</p>
            <p>Couscous à l'agneau</p>
          </div>
        </div>

        {/* Menu Poisson */}
        <div className="border border-stone-200 p-6 rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-amber-900">
            <Fish size={24} />
            <h3 className="text-xl font-bold uppercase">Menu Poisson Grillé</h3>
          </div>
          <ul className="space-y-2 text-sm text-stone-600 mb-6">
            <li>• Soupe traditionnelle</li>
            <li>• Salade verte</li>
            <li>• Salade méchouia</li>
          </ul>
          <div className="pt-4 border-t border-stone-100">
            <p className="font-bold text-stone-800">PLAT PRINCIPAL :</p>
            <p>Poisson grillé (Loup ou Dorade) accompagné de frites</p>
          </div>
        </div>
      </div>

      {/* Section Offre */}
      <div className="text-center border-t border-b border-stone-200 py-8 bg-stone-100/50">
        <div className="flex justify-center items-center gap-3 text-amber-900 mb-2">
          <Wine size={28} />
          <h3 className="text-2xl font-bold">2 BOUTEILLES OFFERTES</h3>
        </div>
        <p className="text-stone-600">de cave à vin de Dar B&B</p>
      </div>

      {/* Pied de page */}
      <div className="text-center mt-10">
        <p className="text-3xl font-bold text-amber-900">50€ <span className="text-lg font-normal text-stone-500">PAR PERSONNE</span></p>
        <p className="mt-4 italic text-stone-700">Bienvenue chez Dar B&B — Une expérience authentique tunisienne</p>
      </div>
    </div>
  );
}