import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Play } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";

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

const items: Item[] = [
  { src: g6, alt: "Vue aérienne", type: "image", ratio: "aspect-[16/10]" },
  { src: g1, alt: "Chambre", type: "image", ratio: "aspect-[3/4]" },
  { src: g2, alt: "Piscine", type: "image", ratio: "aspect-[4/3]" },
  { src: g3, alt: "Cuisine", type: "image", ratio: "aspect-square" },
  { src: g4, alt: "Salon", type: "image", ratio: "aspect-[3/4]" },
  { src: g5, alt: "Bain", type: "image", ratio: "aspect-[3/4]" },
  { src: g2, alt: "Visite vidéo", type: "video", ratio: "aspect-video" },
];

function Gallery() {
  const { t } = useLang();
  const [open, setOpen] = useState<Item | null>(null);

  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">— 2026</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.galleryTitle}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.gallerySub}</p>
      </section>

      <section className="container-luxe pb-24">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 md:gap-6 [column-fill:_balance]">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={() => setOpen(it)}
              className={`relative w-full mb-4 md:mb-6 break-inside-avoid overflow-hidden group ${it.ratio}`}
            >
              <img src={it.src} alt={it.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              {it.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <span className="h-16 w-16 rounded-full bg-white/90 text-foreground flex items-center justify-center">
                    <Play className="h-6 w-6 ml-1" />
                  </span>
                </span>
              )}
              <span className="absolute bottom-3 left-3 text-xs uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition">{it.alt}</span>
            </button>
          ))}
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[80] bg-black/90 flex items-center justify-center p-6" onClick={() => setOpen(null)}>
          <img src={open.src} alt={open.alt} className="max-h-[90vh] max-w-full object-contain" />
        </div>
      )}
    </SiteLayout>
  );
}
