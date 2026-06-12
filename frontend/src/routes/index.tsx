import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";

import { ArrowRight, Wine, X, Car, Compass, ChefHat, Waves, HeartPulse, CalendarHeart } from "lucide-react";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

// Assets
import heroImg1 from "../assets/hero-1.JPG";
import heroImg2 from "../assets/hero-2.JPG";

import heroImg3 from "@/assets/gallery/outside2.webp";
import g1 from "@/assets/jasminsuite/room-jasminsuite.webp";
import g2 from "@/assets/azuresuite/room.webp";
import g4 from "@/assets/olivesuite/room-view-olivesuite.webp";
import g6 from "@/assets/royalesuite/room2.webp";
import c2 from "@/assets/chef.jpg";
import c1 from "@/assets/chauffeur.jpg";
import c3 from "@/assets/c3.jpg";
import c4 from "@/assets/c4.jpg";
import c5 from "@/assets/c5.jpg";
import c6 from "@/assets/c6.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

type SuiteId = "suite-azur" | "suite-olive" | "suite-jasmin" | "suite-royale";

interface SuiteItem {
  id: SuiteId;
  t: string;
  d: string;
}

interface ExperienceItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  icon: any;
  description: string;
  modalTitle: string;
  content: React.ReactNode;
}

function Home() {
  const { t, lang } = useLang();
  const [isWineOpen, setIsWineOpen] = useState(false);
  const [activeExperience, setActiveExperience] = useState<ExperienceItem | null>(null);

  const suiteImages: Record<SuiteId, string> = {
    "suite-azur": g2,
    "suite-jasmin": g1,
    "suite-olive": g4,
    "suite-royale": g6,
  };

  const experiences: ExperienceItem[] = [
  {
    id: "chef",
    title: lang === "en" ? "Private Chef" : "Chef Privé",
    subtitle: lang === "en" ? "Gastronomic Experience" : "Expérience Gastronomique",
    image: c2,
    icon: ChefHat,
    description: lang === "en" ? "Refined culinary experiences inspired by Tunisian and international flavors." : "Expériences culinaires raffinées inspirées des saveurs tunisiennes et internationales.",
    modalTitle: lang === "en" ? "Our Private Chef" : "Chef Privé à la Villa",
    content: <p>{lang === "en" ? "Enjoy personalized menus prepared by our chef." : "Profitez de menus personnalisés préparés par notre chef directement à la villa."}</p>
  },
  {
    id: "transfers",
    title: lang === "en" ? "Private Transfers" : "Transferts Privés",
    subtitle: lang === "en" ? "Airport & Travels" : "Aéroports & Navettes",
    image: c1,
    icon: Car,
    description: lang === "en" ? "Premium drivers for simple, comfortable, and stress-free arrivals." : "Service de pickup et drop-off pour des arrivées simples, confortables et sans stress.",
    modalTitle: lang === "en" ? "Airport Transfers" : "Transferts Privés",
    content: <p>{lang === "en" ? "Luxury fleet for your travels." : "Flotte de luxe pour vos déplacements."}</p>
  },
  {
    id: "discovery",
    title: lang === "en" ? "Local Discovery" : "Découverte Locale",
    subtitle: lang === "en" ? "Hammamet & Beyond" : "Hammamet autrement",
    image: c6,
    icon: Compass,
    description: lang === "en" ? "Medina tours, beaches, and exclusive recommendations." : "Visites de la médina, plages, expériences locales et recommandations exclusives.",
    modalTitle: lang === "en" ? "Explore Tunisia" : "Découverte de la Tunisie",
    content: <p>{lang === "en" ? "Guided cultural tours and local hidden gems." : "Visites culturelles guidées et secrets locaux."}</p>
  },
  {
    id: "wellness",
    title: lang === "en" ? "Wellness" : "Bien-être",
    subtitle: lang === "en" ? "Relaxation & Spa" : "Détente & Relaxation",
    image: c5,
    icon: HeartPulse,
    description: lang === "en" ? "Massages, private yoga, and spaces designed to disconnect." : "Moments de détente, massages, yoga privé et espaces conçus pour déconnecter.",
    modalTitle: lang === "en" ? "Wellness & Relaxation" : "Bien-être & Relaxation",
    content: <p>{lang === "en" ? "Rejuvenate your body and mind." : "Ressourcez votre corps et votre esprit."}</p>
  },
  {
    id: "activities",
    title: lang === "en" ? "Activities & Sports" : "Sports & Loisirs",
    subtitle: lang === "en" ? "Outdoor Adventures" : "Activités & Outdoor",
    image: c4,
    icon: Waves,
    description: lang === "en" ? "Padel, beach activities, and custom outdoor experiences." : "Padel, activités plage, expériences outdoor et activités personnalisées.",
    modalTitle: lang === "en" ? "Tailored Activities" : "Nos Activités Sportives",
    content: <p>{lang === "en" ? "Custom experiences according to your desires." : "Activités personnalisées selon vos envies."}</p>
  },
  {
    id: "events",
    title: lang === "en" ? "Private Events" : "Événements Privés",
    subtitle: lang === "en" ? "Special Celebrations" : "Célébrations Intimistes",
    image: c3,
    icon: CalendarHeart,
    description: lang === "en" ? "Perfect for birthdays, romantic getaways, and group stays." : "Parfait pour anniversaires, escapades romantiques et séjours en groupe.",
    modalTitle: lang === "en" ? "Private Celebrations" : "Vos Événements Privés",
    content: <p>{lang === "en" ? "Celebrate special moments with us." : "Célébrez vos moments spéciaux avec nous."}</p>
  }
];

  const duplicatedExperiences = [...experiences, ...experiences, ...experiences];

  useEffect(() => {
    if (isWineOpen || activeExperience) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isWineOpen, activeExperience]);

  return (
    <SiteLayout transparentHeader>
      
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-black">
  
  {/* Image unique en fond : j'utilise 'object-cover' pour remplir l'écran comme un vrai Héro */}
  <div className="absolute inset-0">
    <img 
      src={heroImg3} 
      alt="Vue de la villa de nuit" 
      className="h-full w-full object-cover object-center" 
    />
  </div>
  
  {/* Overlay sombre : Lecture assurée sur mobile et dégradé chic sur desktop */}
  <div className="absolute inset-0 bg-black/60 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />

  {/* Conteneur Texte */}
  <div className="relative z-10 h-full container-luxe flex items-center justify-start">
    <motion.div 
      initial={{ opacity: 0, x: -30 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ duration: 0.8 }}
      className="max-w-2xl text-left"
    >
      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl leading-[1.05] text-white mb-6 sm:mb-8 break-words">
        {t.hero.title}
      </h1>
      
      <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-white/90 leading-relaxed font-light max-w-lg">
        {t.hero.sub}
      </p>
      
      <div className="mt-8 sm:mt-12">
        <Link 
          to="/booking" 
          className="inline-flex items-center gap-3 bg-white text-black px-6 sm:px-8 py-3 sm:py-4 text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase hover:bg-stone-200 transition"
        >
          {t.hero.cta} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  </div>
</section>

      {/* --- CONTAINER ENTIÈREMENT DARK MODE (Noir Pur) --- */}
      <div className="bg-black text-white dark">
        
        <section className="container-luxe py-28 md:py-40">
  {/* Texte d'introduction */}
  <div className="max-w-4xl mx-auto text-center mb-20">
    <div className="eyebrow mb-6 text-stone-500">— {t.philosophy.eyebrow}</div>
    <h2 className="text-4xl md:text-5xl leading-tight font-display text-white mb-8">
      {t.philosophy.title}
    </h2>
    <p className="text-lg md:text-xl leading-relaxed text-stone-300 font-light">
      {t.philosophy.subtitle}
    </p>
  </div>

  {/* Grille des 6 points */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-stone-900 border border-stone-900">
    {t.philosophy.points.map((point: string, index: number) => (
      <div 
        key={index} 
        className="bg-black p-10 flex flex-col items-center justify-center text-center group hover:bg-stone-950 transition-colors duration-500"
      >
        <span className="text-stone-600 mb-4 text-xs tracking-[0.2em] font-medium">
          0{index + 1}
        </span>
        <p className="text-sm uppercase tracking-widest text-stone-300 group-hover:text-white transition-colors">
          {point}
        </p>
      </div>
    ))}
  </div>
</section>

       {/* --- SUITES SECTION --- */}
<section className="container-luxe py-28 md:py-40 border-t border-stone-900" id="suites">
  <div className="mb-16 max-w-2xl">
    <div className="eyebrow mb-6 text-stone-400">— {t.suites.eyebrow}</div>
    <h2 className="text-4xl md:text-5xl font-display mb-6 text-white">{t.suites.title}</h2>
  </div>
  
  {/* 
    grid-cols-1 : 1 par ligne sur mobile
    md:grid-cols-2 : 2 par ligne sur ordinateur
  */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    {t.suites.items.map((suite: SuiteItem) => (
      <Link key={suite.id} to={`/suites/${suite.id}`} className="group block overflow-hidden">
        {/* 
          aspect-[4/3] : Format paysage plus naturel qui affiche plus de l'image sur mobile
          md:aspect-[3/2] : Un format un peu plus allongé pour le desktop
        */}
        <div className="aspect-[4/3] md:aspect-[3/2] overflow-hidden mb-6 bg-stone-950">
          <img 
            src={suiteImages[suite.id]} 
            alt={suite.t} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        </div>
        <div className="flex justify-between items-end border-b border-stone-900 pb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-display text-white">{suite.t}</h3>
          </div>
          <ArrowRight className="h-4 w-4 text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
      </Link>
    ))}
  </div>
</section>

{/*partie equipelments*/}

<section className="container-luxe py-28 md:py-40 border-t border-stone-900">
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
    <div className="max-w-xl">
      <div className="eyebrow mb-6 text-stone-500">— {lang === "en" ? "Comfort" : "Commodités"}</div>
      <h2 className="text-4xl md:text-5xl font-display text-white">
        {lang === "en" ? "Everything you need" : "Ce que propose ce logement"}
      </h2>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[
      { icon: ChefHat,    key: "kitchen",       items: lang === "en" ? ["Fully equipped kitchen", "Nespresso", "Full dishware", "Oven & Microwave"]           : ["Cuisine équipée", "Nespresso", "Vaisselle complète", "Four & Micro-ondes"] },
      { icon: HeartPulse, key: "comfort",        items: lang === "en" ? ["Premium bed linen", "Bath towels", "Walk-in closet", "Iron"]                         : ["Linge de lit premium", "Serviettes de bain", "Dressing", "Fer à repasser"] },
      { icon: Waves,      key: "entertainment",  items: lang === "en" ? ["Smart TV Netflix", "Fiber Wifi", "Workspace", "Audio system"]                        : ["Smart TV Netflix", "Wifi Fibre", "Espace de travail", "Système audio"] },
      { icon: Car,        key: "outdoor",        items: lang === "en" ? ["Private pool", "Sun loungers", "Outdoor dining area"]                                : ["Piscine privée", "Chaises longues", "Espace repas extérieur"] },
      { icon: Compass,    key: "safety",         items: lang === "en" ? ["Private parking", "Private elevator", "Smoke detector", "Fire extinguisher"]         : ["Parking privé", "Ascenseur privatif", "Détecteur de fumée", "Extincteur"] },
      { icon: Wine,       key: "climate",        items: lang === "en" ? ["Central air conditioning", "Reversible heating"]                                     : ["Climatisation centrale", "Chauffage réversible"] },
    ].map((cat, idx) => {
      const Icon = cat.icon;
      return (
        <div key={idx} className="group p-8 border border-stone-900 hover:border-stone-700 transition-all duration-500 bg-stone-950/20">
          <div className="h-12 w-12 mb-8 flex items-center justify-center border border-stone-800 text-stone-500 group-hover:text-white group-hover:border-white transition-all duration-500">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="text-xl text-white font-display mb-6">{cat.title}</h3>
          <ul className="space-y-3">
            {cat.items.map((item, i) => (
              <li key={i} className="text-stone-400 text-sm flex items-center gap-3 font-light">
                <span className="h-px w-4 bg-stone-800 group-hover:bg-stone-500 transition-colors" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      );
    })}
  </div>
  
  <div className="mt-16 p-8 border-l-2 border-stone-800 bg-stone-900/20">
    <p className="text-stone-400 text-sm italic font-light max-w-2xl">
      {lang === "en" 
        ? "Note: Security cameras are installed outdoors only (entrance, parking) to ensure your privacy. No cameras inside the villa." 
        : "Note : Des caméras de sécurité sont installées uniquement à l'extérieur (entrée, parking) pour assurer votre tranquillité. Aucune caméra à l'intérieur de la villa."}
    </p>
  </div>
</section>

        {/* --- CARROUSEL INFINI EN CONTINU --- */}
        <section className="py-28 md:py-40 border-t border-stone-900 bg-stone-950/40 overflow-hidden">
          <div className="container-luxe mb-12">
            <div className="eyebrow mb-6 text-stone-400">— {lang === "en" ? "Concierge Services" : "Conciergerie Privée"}</div>
            <h2 className="text-4xl md:text-5xl font-display text-white">{lang === "en" ? "Tailored Experiences" : "Expériences sur Mesure"}</h2>
          </div>

          <div className="pause-on-hover w-full overflow-hidden relative select-none cursor-pointer">
            <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee gap-8 pr-8">
              {duplicatedExperiences.map((exp, index) => {
                const Icon = exp.icon;
                return (
                  <div key={`${exp.id}-${index}`} onClick={() => setActiveExperience(exp)} className="w-[280px] md:w-[360px] flex-shrink-0 group">
                    <div className="aspect-[4/5] overflow-hidden mb-6 relative bg-stone-950">
                      <img src={exp.image} alt={exp.title} className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                      <div className="absolute bottom-6 left-6 h-12 w-12 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="space-y-2 border-b border-stone-900 pb-6">
                      <span className="text-[10px] tracking-[0.25em] uppercase text-stone-500 block">{exp.subtitle}</span>
                      <h3 className="font-display text-2xl text-white group-hover:text-stone-300 transition-colors">{exp.title}</h3>
                      <p className="text-sm text-stone-400 font-light line-clamp-2 leading-relaxed">{exp.description}</p>
                      <span className="inline-flex items-center gap-2 text-[10px] tracking-widest uppercase font-medium pt-2 text-white group-hover:underline underline-offset-4">
                        {lang === "en" ? "Learn more" : "En savoir plus"} →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        

        <section className="bg-stone-950 py-28 md:py-40 border-t border-stone-900">
  <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
    <div>
      <div className="eyebrow mb-6 text-stone-500">— {t.questions.eyebrow}</div>
      <h2 className="text-4xl md:text-5xl leading-tight font-display text-white max-w-lg">
        {t.questions.title}
      </h2>
    </div>
    
    <div className="bg-black border border-stone-900 p-10 md:p-14 shadow-xl">
      <p className="text-stone-400 leading-relaxed">
        {t.questions.sub}
      </p>
      
      <Link 
        to="/contact" 
        className="mt-10 inline-flex items-center gap-3 bg-white text-black px-7 py-4 text-xs tracking-[0.25em] uppercase hover:bg-stone-200 transition w-full justify-center sm:w-auto"
      >
        {t.questions.cta} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
</section>

      </div> {/* --- FIN DU WRAPPER DARK MODE --- */}

      {/* --- MODALE DYNAMIQUE DES EXPERIENCES --- */}
      <AnimatePresence>
        {activeExperience && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActiveExperience(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black text-white w-full max-w-2xl max-h-[90svh] overflow-y-auto p-8 md:p-14 relative shadow-2xl border border-stone-900"
            >
              <button onClick={() => setActiveExperience(null)} className="absolute top-6 right-6 p-2 text-stone-400 hover:text-white transition-colors z-10">
                <X className="h-5 w-5" />
              </button>
              <div className="mb-8">
                <span className="text-[10px] tracking-[0.3em] uppercase text-stone-500 block mb-2">{activeExperience.subtitle}</span>
                <h2 className="text-3xl md:text-4xl font-display mb-4 text-white">{activeExperience.modalTitle}</h2>
                <div className="h-px w-16 bg-stone-900 mt-4" />
              </div>
              <div className="mt-6">
                {activeExperience.content}
              </div>
              <div className="mt-12 pt-6 border-t border-stone-900 text-center">
                <button onClick={() => setActiveExperience(null)} className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-white transition-colors underline underline-offset-4">
                  {lang === "en" ? "Close window" : "Fermer la fenêtre"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODALE CAVE A VINS (ADAPTÉE EN SOMBRE CHIC AUSSI) --- */}
      <AnimatePresence>
        {isWineOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsWineOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black text-white w-full max-w-3xl max-h-[90svh] overflow-y-auto p-8 md:p-16 relative border border-stone-900"
            >
              <button onClick={() => setIsWineOpen(false)} className="absolute top-8 right-8 p-2 text-stone-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
              <div className="text-center mb-16">
                <GlassWater className="h-8 w-8 mx-auto mb-6 text-stone-400" />
                <h2 className="text-4xl font-display mb-2 text-white">{t.wine.modalTitle}</h2>
                <div className="h-px w-20 bg-stone-900 mx-auto mt-6" />
              </div>
              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-stone-400 border-b border-stone-900 pb-2">Vins Rouges</h4>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm text-white">Vieux Magon</span>
                      <span className="text-xs text-stone-400">95 TND</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-20 pt-8 border-t border-stone-900 text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-stone-500">{t.wine.disclaimer}</p>
                <button onClick={() => setIsWineOpen(false)} className="mt-8 text-[10px] uppercase tracking-widest text-stone-400 hover:text-white underline underline-offset-4">{t.wine.close}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SiteLayout>
  );
}