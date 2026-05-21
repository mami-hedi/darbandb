// ============================================
// Page: Recherche Disponibilité (Bilingue)
// @/routes/availability.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/availability")({
  head: () => {
    // Note: Comme head est en dehors du composant, 
    // il est préférable de gérer les titres via une logique simple ou d'attendre le rendu
    return {
      meta: [
        { title: "Disponibilité — B&B Hammamet" },
        {
          name: "description",
          content: "Check availability and find your perfect stay dates at B&B Hammamet.",
        },
      ],
    };
  },
  component: AvailabilityPage,
});

function AvailabilityPage() {
  const { t, lang } = useLang();

  // Traductions de secours au cas où elles manquent dans ton fichier i18n
  const translations = {
    eyebrow: lang === 'fr' ? "— Réservation" : "— Reservation",
    title: t.availability?.title || (lang === 'fr' ? "Disponibilité" : "Availability"),
    subtitle: t.availability?.subtitle || (lang === 'fr' 
      ? "Explorez notre calendrier et réservez vos dates idéales à B&B Hammamet." 
      : "Explore our calendar and book your ideal dates at B&B Hammamet."),
    info1: {
      title: t.availability?.info1Title || (lang === 'fr' ? "Conditions" : "Terms"),
      desc: t.availability?.info1Desc || (lang === 'fr' 
        ? "Séjour minimum d'une nuit. Les annulations gratuites sont acceptées jusqu'à 7 jours avant l'arrivée." 
        : "Minimum stay of one night. Free cancellations are accepted up to 7 days before arrival.")
    },
    info2: {
      title: t.availability?.info2Title || (lang === 'fr' ? "Tarifs" : "Rates"),
      desc: t.availability?.info2Desc || (lang === 'fr' 
        ? "Nos tarifs sont affichés par nuit. Les taxes et frais supplémentaires sont communiqués avant confirmation." 
        : "Our rates are displayed per night. Taxes and additional fees are communicated before confirmation.")
    },
    info3: {
      title: t.availability?.info3Title || (lang === 'fr' ? "Support" : "Support"),
      desc: t.availability?.info3Desc || (lang === 'fr' 
        ? "Des questions? Contactez-nous par email ou téléphone pour une assistance personnalisée." 
        : "Any questions? Contact us by email or phone for personalized assistance.")
    }
  };

  return (
    <SiteLayout>
      {/* SECTION HERO */}
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">{translations.eyebrow}</div>
        <h1 className="font-display text-5xl md:text-7xl">
          {translations.title}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {translations.subtitle}
        </p>
      </section>

      {/* CALENDRIER */}
      <section className="container-luxe py-16 pb-32">
        <AvailabilityCalendar />
      </section>

      {/* INFO SUPPLÉMENTAIRE */}
      <section className="container-luxe pb-32 bg-accent/5 py-16 -mx-4 px-4">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-2xl mb-3">
              {translations.info1.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {translations.info1.desc}
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl mb-3">
              {translations.info2.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {translations.info2.desc}
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl mb-3">
              {translations.info3.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {translations.info3.desc}
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}