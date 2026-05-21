import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

interface SuiteTemplateProps {
  suiteId: "suite-azur" | "suite-olive" | "suite-jasmin" | "suite-ambre";
  mainImage: string;
  galleryImages: string[];
}

export function SuiteTemplate({ suiteId, mainImage, galleryImages }: SuiteTemplateProps) {
  const { t, lang } = useLang();

  // Extraction propre des données d'introduction et des détails imbriqués
  const suiteIntro = t.suites.items.find((item: any) => item.id === suiteId);
  const suiteDetails = t.suites.details?.[suiteId];

  if (!suiteIntro || !suiteDetails) return null;

  // Gestion simple de l'alternative multilingue pour les deux modifications fixes
  const labelRetour = lang === "en" ? "Back" : "Retour";
  const labelReserver = lang === "en" ? "Book now" : "Réserver";

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24 md:pb-40">
        <div className="container-luxe">
          
          {/* Fil d'ariane / Retour simple */}
          <div className="mb-12">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {labelRetour}
            </Link>
          </div>

          {/* SECTION 1 : Présentation & Titre asymétrique */}
          <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start mb-24 md:mb-36">
            
            {/* Colonne Image Principale */}
            <div className="md:col-span-7 overflow-hidden bg-accent aspect-[4/5] md:aspect-[3/4]">
              <motion.img
                src={mainImage}
                alt={suiteDetails.title}
                className="h-full w-full object-cover"
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>

            {/* Colonne Textes & Caractéristiques */}
            <div className="md:col-span-5 flex flex-col justify-center pt-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground block mb-4">
                  {suiteDetails.tagline}
                </span>
                
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-8 border-b border-border pb-8">
                  {suiteDetails.title}
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12 font-light">
                  {suiteDetails.description}
                </p>

                {/* Liste des équipements */}
                <div className="space-y-4 mb-12">
                  <h3 className="text-[0.7rem] font-semibold tracking-[0.25em] uppercase mb-6 text-foreground">
                    {t.suites.amenitiesTitle}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suiteDetails.specs?.map((spec: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-foreground flex-shrink-0" strokeWidth={1.5} />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Réservation globale vers la page Contact */}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-5 text-xs tracking-[0.25em] uppercase hover:bg-foreground/90 transition-all w-full md:w-auto"
                >
                  <Calendar className="h-4 w-4" />
                  {labelReserver}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* SECTION 2 : Galerie Photo Mosaïque haut de gamme */}
          {galleryImages && galleryImages.length > 0 && (
            <div className="border-t border-border pt-20 md:pt-32">
              <div className="mb-12">
                <span className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground block mb-2">— Perspective</span>
                <h2 className="font-display text-3xl md:text-4xl">Galerie Privée</h2>
              </div>

              {/* Grille Mosaïque type Magazine d'architecture */}
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