// ============================================
// Page Galerie — Version Black Édition Luxe
// @/routes/gallery.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import g2 from "@/assets/gallery/outside.webp";
import g1 from "@/assets/gallery/kitchen.webp";

import g3 from "@/assets/gallery/outside2.webp";
import g4 from "@/assets/gallery/plus.webp";
import g5 from "@/assets/gallery/plusss.webp";
import g6 from "@/assets/gallery/table.webp";
import g7 from "@/assets/g7.jpeg";
import g8 from "@/assets/g8.jpeg";
import g9 from "@/assets/gallery/terr3.webp";
import g10 from "@/assets/gallery/topterr.webp";
import g11 from "@/assets/gallery/vue-sallon-terasse.webp";
//import g12 from "@/assets/gallery/g12.jpeg";
import g13 from "@/assets/jasminsuite/toilette-jasminsuite.webp";
import g14 from "@/assets/g14.jpeg";
import g15 from "@/assets/olivesuite/Balacony-oliviersuite.webp";
import g16 from "@/assets/g16.jpeg";
import g17 from "@/assets/jasminsuite/room-jasminsuite.webp";
import g18 from "@/assets/azuresuite/room.webp";
import g19 from "@/assets/olivesuite/room-view-olivesuite.webp";
import g20 from "@/assets/royalesuite/room2.webp";
import g21 from "@/assets/g2.jpeg";
import g22 from "@/assets/g5.jpeg";
import g23 from "@/assets/g9.jpeg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Galerie — B&B Hammamet" },
      { name: "description", content: "Photos et vidéos de la villa B&B à Hammamet : chambres, piscine, terrasse, vue mer." },
      { property: "og:title", content: "Galerie — B&B Hammamet" },
      { property: "og:image", content: g6 },
    ],
  }),
  component: Gallery,
});

// NOTE : le libellé (alt / légende) n'est plus stocké ici en dur.
// Il est désormais traduit dynamiquement via t.gallery.items[i] (voir dict.ts),
// dans le MÊME ORDRE que ce tableau, afin de s'afficher en FR ou EN selon la langue active.
type Item = { src: string; type: "image" | "video"; ratio: string };

const items: Item[] = [
  { src: g3, type: "image", ratio: "aspect-[4/3]" },
  { src: g6, type: "image", ratio: "aspect-[4/3]" },
  { src: g5, type: "image", ratio: "aspect-[4/3]" },

  { src: g18, type: "image", ratio: "aspect-[4/3]" },
  { src: g9, type: "image", ratio: "aspect-[4/3]" },
  { src: g15, type: "image", ratio: "aspect-[4/3]" },

  { src: g17, type: "image", ratio: "aspect-[4/3]" },
  { src: g2, type: "image", ratio: "aspect-[4/3]" },
  { src: g7, type: "image", ratio: "aspect-[4/3]" },

  { src: g8, type: "image", ratio: "aspect-[4/3]" },
  { src: g10, type: "image", ratio: "aspect-[4/3]" },
  { src: g11, type: "image", ratio: "aspect-[4/3]" },

  { src: g13, type: "image", ratio: "aspect-[4/3]" },
  { src: g14, type: "image", ratio: "aspect-[4/3]" },
  { src: g1, type: "image", ratio: "aspect-[4/3]" },

  { src: g19, type: "image", ratio: "aspect-[4/3]" },
  { src: g4, type: "image", ratio: "aspect-[4/3]" },
  { src: g20, type: "image", ratio: "aspect-[4/3]" },

  { src: g21, type: "image", ratio: "aspect-[4/3]" },
  { src: g22, type: "image", ratio: "aspect-[4/3]" },
  { src: g23, type: "image", ratio: "aspect-[4/3]" },
];

function Gallery() {
  const { t } = useLang();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Légendes traduites, dans le même ordre que le tableau `items` ci-dessus.
  const alts: readonly string[] = t.gallery.items;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev! - 1));
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activeIndex !== null) {
      setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev! + 1));
    }
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") setActiveIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  const currentItem = activeIndex !== null ? items[activeIndex] : null;
  const currentAlt = activeIndex !== null ? alts[activeIndex] : "";

  return (
    <SiteLayout>
      {/* Conteneur principal plein écran noir */}
      <div className="bg-neutral-950 text-white min-h-screen font-sans selection:bg-white selection:text-black">
        
        {/* En-tête de la page */}
        <section className="container-luxe pt-24 pb-12">
          <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
            — 2026
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-white tracking-tight">
            {t.galleryTitle}
          </h1>
          <p className="mt-4 text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed">
            {t.gallerySub}
          </p>
        </section>

        {/* Grille de médias étendue */}
        <section className="container-luxe pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {items.map((it, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative w-full overflow-hidden group bg-neutral-900 border border-neutral-900 focus:outline-none focus:border-neutral-700 ${it.ratio}`}
              >
                <img 
                  src={it.src} 
                  alt={alts[i]} 
                  loading="lazy" 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] opacity-85 group-hover:opacity-100" 
                />
                
                {/* Overlay sombre raffiné au survol */}
                <div className="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {it.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-neutral-950/20">
                    <span className="h-14 w-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                      <Play className="h-5 w-5 ml-0.5 fill-current text-black" />
                    </span>
                  </span>
                )}
                
                {/* Légende au survol */}
                <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {alts[i]}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Lightbox Plein Écran (Mode Cinéma Sombre) */}
        {activeIndex !== null && currentItem && (
          <div 
            className="fixed inset-0 z-[100] bg-neutral-950/98 backdrop-blur-md flex items-center justify-center select-none animate-fade-in"
            onClick={() => setActiveIndex(null)}
          >
            {/* Bouton Fermer */}
            <button 
              onClick={() => setActiveIndex(null)}
              className="absolute top-6 right-6 text-neutral-400 hover:text-white transition-colors p-2 z-[110]"
            >
              <X size={28} />
            </button>

            {/* Bouton Précédent */}
            <button 
              onClick={handlePrev}
              className="absolute left-4 md:left-6 text-neutral-400 hover:text-white transition-colors bg-neutral-900/40 p-3 rounded-none border border-neutral-800 hover:bg-neutral-900/80 z-[110]"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Conteneur Média */}
            <div className="relative max-h-[85vh] max-w-[90vw] md:max-w-[80vw] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {currentItem.type === "video" ? (
                <video src={currentItem.src} controls autoPlay className="max-h-[80vh] max-w-full shadow-2xl border border-neutral-900 object-contain" />
              ) : (
                <img src={currentItem.src} alt={currentAlt} className="max-h-[80vh] max-w-full shadow-2xl border border-neutral-900 object-contain pointer-events-none" />
              )}
              
              {/* Informations Médias de la Lightbox */}
              <div className="mt-4 text-center text-[10px] tracking-[0.2em] uppercase text-neutral-400">
                <span className="text-white font-medium">{currentAlt}</span> — {activeIndex + 1} / {items.length}
              </div>
            </div>

            {/* Bouton Suivant */}
            <button 
              onClick={handleNext}
              className="absolute right-4 md:right-6 text-neutral-400 hover:text-white transition-colors bg-neutral-900/40 p-3 rounded-none border border-neutral-800 hover:bg-neutral-900/80 z-[110]"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}

      </div>
    </SiteLayout>
  );
}