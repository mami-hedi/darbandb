import { createFileRoute } from "@tanstack/react-router";
import { Wheat, Fish, Wine, Star } from "lucide-react";
import couscousImg from "../assets/coscouss.webp";
import doradeImg from "../assets/dorade.webp";

export const Route = createFileRoute("/order-client")({
  component: OrderClient,
});

function OrderClient() {
  const menus = [
    { 
      title: "Couscous Agneau", 
      icon: Wheat, 
      desc: "Couscous traditionnel à l'agneau fermier", 
      image: couscousImg 
    },
    { 
      title: "Poisson Grillé", 
      icon: Fish, 
      desc: "Loup ou Dorade selon arrivage, frites maison", 
      image: doradeImg 
    }
  ];

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800 selection:bg-amber-200">
      
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full flex items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541529086526-db283c563270?q=80&w=2070" 
          alt="Cuisine Tunisienne" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-serif mb-4">Dar B&B</h1>
          <p className="uppercase tracking-[0.3em] text-sm opacity-90">Expérience Gastronomique Hammamet</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-16 -mt-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-stone-100">
          
          <div className="text-center mb-16">
            <Star className="text-amber-600 mx-auto mb-4" size={32} />
            <h2 className="text-3xl font-serif text-amber-950">Saveurs de la Maison</h2>
            <p className="mt-4 text-stone-500 italic max-w-lg mx-auto">
              Chaque plat est préparé avec des produits locaux frais pour vous offrir une immersion authentique au cœur de la Tunisie.
            </p>
          </div>

          {/* Grille des menus */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {menus.map((menu) => (
              <div key={menu.title} className="group border border-stone-200 rounded-xl overflow-hidden hover:border-amber-600 hover:shadow-lg transition-all duration-300">
                <img src={menu.image} alt={menu.title} className="w-full h-56 object-cover" />
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-amber-50 rounded-full text-amber-800">
                      <menu.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold uppercase">{menu.title}</h3>
                  </div>
                  <ul className="space-y-3 text-stone-600 mb-8 border-l-2 border-stone-100 pl-4">
                    <li>Soupe traditionnelle</li>
                    <li>Salade verte fraîche</li>
                    <li>Salade méchouia</li>
                    <li>Brick tunisienne croustillante</li>
                  </ul>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-widest mb-1">Plat Principal :</p>
                    <p className="text-stone-800 font-medium">{menu.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section Offre */}
          {/* Section Menu Complet */}
<div className="relative bg-amber-950 text-amber-100 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
  <div className="flex items-center gap-6">
    <div className="p-3 bg-amber-900/50 rounded-full">
      <Star size={48} className="text-amber-500" />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-white">L'Expérience Gastronomique</h3>
      <p className="opacity-90 italic">Menu complet incluant entrées, plat principal et boissons artisanales</p>
    </div>
  </div>
  <div className="text-center md:text-right border-l border-amber-800/50 pl-6">
    <span className="block text-4xl font-bold text-white">50€</span>
    <span className="text-sm uppercase tracking-widest opacity-70">Tarif unique</span>
  </div>
</div>

        </div>
        
        <footer className="text-center mt-12 text-stone-400 text-sm">
          <p>© 2026 Dar B&B Hammamet • Réservation obligatoire</p>
        </footer>
      </main>
    </div>
  );
}