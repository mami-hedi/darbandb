import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import g1 from "@/assets/g1.jpeg";
import g2 from "@/assets/g2.jpeg";
import g3 from "@/assets/g3.jpeg";
import g4 from "@/assets/g4.jpeg";
import g5 from "@/assets/g5.jpeg";
import g6 from "@/assets/g6.jpeg";
import g7 from "@/assets/g7.jpeg";
import g8 from "@/assets/g8.jpeg";

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

type Item = { src: string; alt: string; type: "image" | "video"; ratio: string };

// Tableau trié : Ratios identiques regroupés pour s'aligner côte à côte
const items: Item[] = [
  // Bloc 1 : Les Carrés (1/1) - S'alignent ensemble
  { src: g6, alt: "suite", type: "image", ratio: "aspect-[1/1]" },
  { src: g5, alt: "Dressing", type: "image", ratio: "aspect-[1/1]" },
  { src: g3, alt: "salle de bain", type: "image", ratio: "aspect-[1/1]" },
  
  // Bloc 2 : Les Paysages (4/3) - Forment des lignes horizontales parfaites
  { src: g1, alt: "Salon", type: "image", ratio: "aspect-[4/3]" },
  { src: g2, alt: "Cuisine", type: "image", ratio: "aspect-[4/3]" },
  { src: g7, alt: "Piscine", type: "image", ratio: "aspect-[4/3]" },
  { src: g8, alt: "Piscine", type: "image", ratio: "aspect-[4/3]" },
  
  // Bloc 3 : Le Portrait (3/4)
  { src: g4, alt: "Salon", type: "image", ratio: "aspect-[4/3]" },
];

function Gallery() {
  const { t } = useLang();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

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

  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">— 2026</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.galleryTitle}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.gallerySub}</p>
      </section>

      {/* Grille responsive organisée par lignes horizontales */}
      <section className="container-luxe pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              // Chaque élément utilise sa propre forme (${it.ratio}) mais s'aligne proprement sur la ligne
              className={`relative w-full overflow-hidden group bg-stone-100 ${it.ratio}`}
            >
              <img 
                src={it.src} 
                alt={it.alt} 
                loading="lazy" 
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
              />
              
              <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {it.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-stone-950/20">
                  <span className="h-14 w-14 rounded-full bg-white/90 text-stone-950 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-5 w-5 ml-0.5 fill-current" />
                  </span>
                </span>
              )}
              
              <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] font-semibold text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                {it.alt}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Plein Écran */}
      {activeIndex !== null && currentItem && (
        <div 
          className="fixed inset-0 z-[100] bg-stone-950/95 backdrop-blur-md flex items-center justify-center select-none"
          onClick={() => setActiveIndex(null)}
        >
          <button 
            onClick={() => setActiveIndex(null)}
            className="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors p-2 z-[110]"
          >
            <X size={28} />
          </button>

          <button 
            onClick={handlePrev}
            className="absolute left-4 md:left-6 text-stone-400 hover:text-white transition-colors bg-stone-900/40 p-3 rounded-full hover:bg-stone-900/80 z-[110]"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="relative max-h-[85vh] max-w-[90vw] md:max-w-[80vw] flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {currentItem.type === "video" ? (
              <video src={currentItem.src} controls autoPlay className="max-h-[80vh] max-w-full shadow-2xl object-contain" />
            ) : (
              <img src={currentItem.src} alt={currentItem.alt} className="max-h-[80vh] max-w-full shadow-2xl object-contain pointer-events-none" />
            )}
            <div className="mt-4 text-center text-xs tracking-[0.15em] uppercase text-stone-400">
              <span className="text-white font-medium">{currentItem.alt}</span> — {activeIndex + 1} / {items.length}
            </div>
          </div>

          <button 
            onClick={handleNext}
            className="absolute right-4 md:right-6 text-stone-400 hover:text-white transition-colors bg-stone-900/40 p-3 rounded-full hover:bg-stone-900/80 z-[110]"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </SiteLayout>
  );
}