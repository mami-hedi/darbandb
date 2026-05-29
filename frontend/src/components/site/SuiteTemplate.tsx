import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router"; // Ajout de useNavigate
import { ArrowLeft, ArrowRight, Check, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

type SuiteIdType = "suite-azur" | "suite-olive" | "suite-jasmin" | "suite-ambre";

interface SuiteTemplateProps {
  suiteId: SuiteIdType;
  mainImage: string;
  galleryImages: string[];
}

// Ordre des suites pour la navigation
const SUITES_ORDER: SuiteIdType[] = ["suite-azur", "suite-olive", "suite-jasmin", "suite-ambre"];

export function SuiteTemplate({ suiteId, mainImage, galleryImages }: SuiteTemplateProps) {
  const { t, lang } = useLang();
  const navigate = useNavigate();

  // Récupération des données selon la suite actuelle (portée par l'URL/Props)
  const suiteDetails = t.suites.details?.[suiteId];

  if (!suiteDetails) return null;

  const labelRetour = lang === "en" ? "Retour aux Suites" : "Retour aux Suites";
  const labelReserver = lang === "en" ? "Book now" : "Réserver";

  // Calcul des identifiants précédent et suivant
  const currentIndex = SUITES_ORDER.indexOf(suiteId);
  const prevIndex = currentIndex === 0 ? SUITES_ORDER.length - 1 : currentIndex - 1;
  const nextIndex = currentIndex === SUITES_ORDER.length - 1 ? 0 : currentIndex + 1;

  const prevSuiteId = SUITES_ORDER[prevIndex];
  const nextSuiteId = SUITES_ORDER[nextIndex];

  // Fonction de navigation qui met à jour l'URL réelle de TanStack Router
  const handleNavigate = (targetId: SuiteIdType) => {
    navigate({
      to: "/suites/$suiteId", // Ajustez ce chemin selon votre configuration de route réelle
      params: { suiteId: targetId },
    });
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24 md:pb-40 relative">
        <div className="container-luxe relative">
          
          {/* Fil d'ariane */}
          <div className="mb-12 relative z-10">
            <Link
              to="/#suites"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {labelRetour}
            </Link>
          </div>

          {/* ZONE ENCADRÉE DE PRÉSENTATION (CARROUSEL PAR URL) */}
          <div className="border border-stone-200 dark:border-stone-800 p-4 md:p-8 mb-24 md:mb-36 relative bg-stone-50/30 dark:bg-stone-950/10">
            
            {/* FLÈCHE GAUCHE : CHANGE L'URL VERS LA SUITE PRÉCÉDENTE */}
            <button
              onClick={() => handleNavigate(prevSuiteId)}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-background border border-border hover:border-foreground rounded-full transition-all group shadow-sm"
              title="Précédent"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:-translate-x-0.5" />
            </button>

            {/* FLÈCHE DROITE : CHANGE L'URL VERS LA SUITE SUIVANTE */}
            <button
              onClick={() => handleNavigate(nextSuiteId)}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 p-3 bg-background border border-border hover:border-foreground rounded-full transition-all group shadow-sm"
              title="Suivant"
            >
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* CONTENU DE LA SUITE ACTUELLE */}
            <motion.div
              key={suiteId} // Déclenche une transition fluide native à chaque changement d'URL
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="grid md:grid-cols-12 gap-8 md:gap-16 items-center p-2 md:p-4"
            >
              
              {/* Colonne Image Principale (Reçoit directement 'mainImage' liée à l'URL via le parent) */}
              <div className="md:col-span-7 overflow-hidden bg-accent aspect-[4/5] md:aspect-[3/4] shadow-sm">
                <img
                  src={mainImage}
                  alt={suiteDetails.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
                />
              </div>

              {/* Colonne Textes & Caractéristiques */}
              <div className="md:col-span-5 flex flex-col justify-center">
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground block mb-4">
                  {suiteDetails.tagline}
                </span>
                
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.1] mb-6 border-b border-border pb-6">
                  {suiteDetails.title}
                </h1>
                
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-8 font-light">
                  {suiteDetails.description}
                </p>

                {/* Équipements */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] uppercase mb-4 text-foreground">
                    {t.suites.amenitiesTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suiteDetails.specs?.map((spec: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton Réserver */}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 text-xs tracking-[0.25em] uppercase hover:bg-foreground/90 transition-all w-full md:w-auto"
                >
                  <Calendar className="h-4 w-4" />
                  {labelReserver}
                </Link>
              </div>

            </motion.div>
          </div>

          {/* SECTION 2 : Galerie Mosaïque (Suit dynamiquement la suite de l'URL) */}
          {galleryImages && galleryImages.length > 0 && (
            <div className="border-t border-border pt-20 md:pt-32 relative z-10">
              <div className="mb-12">
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground block mb-2">— Perspective</span>
                <h2 className="font-display text-3xl md:text-4xl">Galerie Privée</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                {galleryImages[0] && (
                  <div className="md:col-span-8 overflow-hidden aspect-video bg-accent">
                    <img src={galleryImages[0]} alt="Détail 1" className="w-full h-full object-cover hover:scale-102 transition-transform duration-700" />
                  </div>
                )}
                {galleryImages[1] && (
                  <div className="md:col-span-4 overflow-hidden aspect-[3/4] md:aspect-auto bg-accent">
                    <img src={galleryImages[1]} alt="Détail 2" className="w-full h-full object-cover hover:scale-102 transition-transform duration-700" />
                  </div>
                )}
                {galleryImages[2] && (
                  <div className="md:col-span-4 overflow-hidden aspect-[4/5] bg-accent">
                    <img src={galleryImages[2]} alt="Détail 3" className="w-full h-full object-cover hover:scale-102 transition-transform duration-700" />
                  </div>
                )}
                {galleryImages[3] && (
                  <div className="md:col-span-8 overflow-hidden aspect-[4/3] md:aspect-auto bg-accent">
                    <img src={galleryImages[3]} alt="Détail 4" className="w-full h-full object-cover hover:scale-102 transition-transform duration-700" />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </SiteLayout>
  );
}