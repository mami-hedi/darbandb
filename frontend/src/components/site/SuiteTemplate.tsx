import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, Calendar, X } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

type SuiteIdType = "suite-azur" | "suite-olive" | "suite-jasmin" | "suite-royale";

interface SuiteTemplateProps {
  suiteId: SuiteIdType;
  mainImage: string;
  galleryImages: string[];
}

const SUITES_ORDER: SuiteIdType[] = ["suite-azur", "suite-olive", "suite-jasmin", "suite-royale"];

export function SuiteTemplate({ suiteId, mainImage, galleryImages }: SuiteTemplateProps) {
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const suiteDetails = t.suites.details?.[suiteId];
  if (!suiteDetails) return null;

  const labelRetour = lang === "en" ? "Back to Suites" : "Retour aux Suites";
  const labelReserver = lang === "en" ? "Book now" : "Réserver";

  const currentIndex = SUITES_ORDER.indexOf(suiteId);
  const prevSuiteId = SUITES_ORDER[currentIndex === 0 ? SUITES_ORDER.length - 1 : currentIndex - 1];
  const nextSuiteId = SUITES_ORDER[currentIndex === SUITES_ORDER.length - 1 ? 0 : currentIndex + 1];

  const handleNavigate = (targetId: SuiteIdType) => {
    navigate({ to: "/suites/$suiteId", params: { suiteId: targetId } });
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24 md:pb-40 relative">
        <div className="container-luxe relative">
          
          <div className="mb-12 relative z-10">
            <Link to="/#suites" className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {labelRetour}
            </Link>
          </div>

          <div className="border border-stone-200 dark:border-stone-800 p-4 md:p-8 mb-24 md:mb-36 relative bg-stone-50/30 dark:bg-stone-950/10">
            {/* Boutons de navigation */}
{/* Nous ajoutons -translate-x-1/2 pour centrer le bouton sur la ligne de bordure */}
<button 
  onClick={() => handleNavigate(prevSuiteId)} 
  className="absolute -left-5 top-1/2 -translate-y-1/2 z-30 p-2 bg-background border border-stone-200 dark:border-stone-800 hover:border-foreground rounded-full transition-all shadow-md"
>
  <ArrowLeft className="h-4 w-4" />
</button>

<button 
  onClick={() => handleNavigate(nextSuiteId)} 
  className="absolute -right-5 top-1/2 -translate-y-1/2 z-30 p-2 bg-background border border-stone-200 dark:border-stone-800 hover:border-foreground rounded-full transition-all shadow-md"
>
  <ArrowRight className="h-4 w-4" />
</button>

            <motion.div key={suiteId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-12 gap-8 md:gap-16 items-center p-2 md:p-4">
              <div className="md:col-span-7 overflow-hidden bg-accent aspect-video md:aspect-[3/4] shadow-sm">
                <img src={mainImage} alt={suiteDetails.title} className="h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
              </div>

              <div className="md:col-span-5">
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground block mb-4">{suiteDetails.tagline}</span>
                <h1 className="font-display text-3xl md:text-5xl mb-6 border-b pb-6">{suiteDetails.title}</h1>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">{suiteDetails.description}</p>
                <div className="space-y-4 mb-8">
                  <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] uppercase text-foreground">{t.suites.amenitiesTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suiteDetails.specs?.map((spec: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-foreground" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link to="/booking" className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 text-xs tracking-[0.25em] uppercase hover:bg-foreground/90 w-full md:w-auto">
                  <Calendar className="h-4 w-4" /> {labelReserver}
                </Link>
              </div>
            </motion.div>
          </div>

          {galleryImages && galleryImages.length > 0 && (
            <div className="border-t pt-20">
              <h2 className="font-display text-3xl mb-12">Galerie Privée</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {galleryImages.map((img, idx) => (
                  <div key={idx} onClick={() => setLightboxIndex(idx)} className="relative overflow-hidden cursor-pointer bg-accent group h-64 md:h-96">
                    <img src={img} alt={`Détail ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4">
          <button className="absolute top-6 right-6 text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setLightboxIndex(null)}>
            <X size={32} />
          </button>
          <button className="absolute left-4 md:left-8 text-white p-3 hover:bg-white/10 rounded-full transition-all" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1)); }}>
            <ArrowLeft size={40} />
          </button>
          <img src={galleryImages[lightboxIndex]} alt="Zoom" className="max-h-[90vh] max-w-full object-contain cursor-pointer" onClick={() => setLightboxIndex(null)} />
          <button className="absolute right-4 md:right-8 text-white p-3 hover:bg-white/10 rounded-full transition-all" onClick={(e) => { e.stopPropagation(); setLightboxIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0)); }}>
            <ArrowRight size={40} />
          </button>
        </div>
      )}
    </SiteLayout>
  );
}