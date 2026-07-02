import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Calendar } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { useEffect } from "react";

// Import des images correspondant à la structure de la Home
import g1 from "@/assets/jasminsuite/room-jasminsuite.webp";
import g2 from "@/assets/azuresuite/room.webp";
import g4 from "@/assets/olivesuite/room-view-olivesuite.webp";
import g6 from "@/assets/royalesuite/room2.webp";

export const Route = createFileRoute("/suites/$suiteId")({
  component: SuiteDetail,
});

function SuiteDetail() {
  const { suiteId } = useParams({ from: "/suites/$suiteId" });
  const { t } = useLang();
  const navigate = useNavigate();

  // Mapping des images synchronisé avec la page d'accueil
  const suiteImages: Record<string, string> = {
  "suite-royale": g6,
  "suite-sunrise": g1, // Assurez-vous que g1 pointe vers l'image de cette suite
  "suite-chill-1": g2, // Assurez-vous que g2 pointe vers l'image de cette suite
  "suite-chill-2": g4, // Assurez-vous que g4 pointe vers l'image de cette suite
};

  const currentImage = suiteImages[suiteId];
  // Récupération sécurisée des données
  const suiteData = t.suiteDetails?.suites?.[suiteId as keyof typeof t.suiteDetails.suites];

  // Redirection si l'ID est invalide
  useEffect(() => {
    if (!suiteData) {
      navigate({ to: "/" });
    }
  }, [suiteData, navigate]);

  if (!suiteData) return null;

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-24 pb-28 md:pb-40">
        <div className="container-luxe">
          
          {/* Bouton Retour */}
          <div className="mb-12">
            <Link 
              to="/#suites" 
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {t.suiteDetails.back}
            </Link>
          </div>

          {/* Grille principale */}
          <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-start">
            
            {/* Colonne Visuelle */}
            <div className="md:col-span-7 overflow-hidden bg-accent aspect-[4/5] md:aspect-[3/4]">
              <motion.img
                src={currentImage}
                alt={suiteData.title}
                className="h-full w-full object-cover"
                initial={{ scale: 1.08, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
              />
            </div>

            {/* Colonne Descriptif */}
            <div className="md:col-span-5 flex flex-col justify-center h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground block mb-3">
                  {suiteData.tagline}
                </span>
                
                <h1 className="font-display text-4xl md:text-5xl leading-tight mb-8 border-b border-border pb-6">
                  {suiteData.title}
                </h1>
                
                <p className="text-base text-muted-foreground leading-relaxed mb-10">
                  {suiteData.description}
                </p>

                {/* Prestations */}
                <div className="space-y-4 mb-12">
                  <h3 className="text-xs font-semibold tracking-wider uppercase mb-4 text-foreground">
                    {t.suiteDetails.amenitiesTitle}
                  </h3>
                  {suiteData.specs?.map((spec: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-foreground flex-shrink-0" strokeWidth={1.5} />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-5 text-xs tracking-[0.25em] uppercase hover:bg-foreground/90 transition-all w-full md:w-auto"
                >
                  <Calendar className="h-4 w-4" />
                  {t.suiteDetails.bookCta}
                </Link>
              </motion.div>
            </div>

          </div>
        </div>
      </div>
    </SiteLayout>
  );
}