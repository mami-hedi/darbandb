// ============================================
// Page: Recherche Disponibilité
// @/routes/availability.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/availability")({
  head: () => ({
    meta: [
      { title: "Vérifier la disponibilité — B&B Hammamet" },
      {
        name: "description",
        content:
          "Consultez le calendrier de disponibilité et trouvez vos dates idéales pour séjourner à B&B Hammamet.",
      },
      {
        property: "og:title",
        content: "Disponibilité — B&B Hammamet",
      },
    ],
  }),
  component: AvailabilityPage,
});

function AvailabilityPage() {
  const { t } = useLang();

  return (
    <SiteLayout>
      {/* SECTION HERO */}
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">— Réservation</div>
        <h1 className="font-display text-5xl md:text-7xl">
          {t.availability?.title || "Disponibilité"}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          {t.availability?.subtitle ||
            "Explorez notre calendrier et réservez vos dates idéales à B&B Hammamet."}
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
              {t.availability?.info1Title || "Conditions"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.availability?.info1Desc ||
                "Séjour minimum d'une nuit. Les annulations gratuites sont acceptées jusqu'à 7 jours avant l'arrivée."}
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl mb-3">
              {t.availability?.info2Title || "Tarifs"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.availability?.info2Desc ||
                "Nos tarifs sont affichés par nuit. Les taxes et frais supplémentaires sont communiqués avant confirmation."}
            </p>
          </div>

          <div>
            <h3 className="font-display text-2xl mb-3">
              {t.availability?.info3Title || "Support"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.availability?.info3Desc ||
                "Des questions? Contactez-nous par email ou téléphone pour une assistance personnalisée."}
            </p>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}