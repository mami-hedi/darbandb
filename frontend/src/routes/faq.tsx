// ============================================
// Page FAQ
// @/routes/faq.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Dar B&B Hammamet" },
      {
        name: "description",
        content: "Des réponses à vos questions concernant la réservation exclusive de la villa à Hammamet.",
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  const { t } = useLang();
  
  // Utilisation d'un tableau pour permettre d'ouvrir plusieurs questions à la fois si désiré
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Typage de sécurité si les clés ne sont pas encore chargées
  const faqItems = t.faq?.items || [];

  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">— Questions</div>
        <h1 className="font-display text-5xl md:text-7xl">
          {t.faq?.title || "FAQ"}
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl leading-relaxed">
          {t.faq?.sub}
        </p>
      </section>

      <section className="container-luxe pb-32 max-w-4xl">
        <div className="border-t border-border">
          {faqItems.map((item: { q: string; a: string }, index: number) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className="border-b border-border transition-colors duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 flex justify-between items-center text-left gap-4 group focus:outline-none"
                >
                  <span className="font-display text-lg md:text-xl text-foreground group-hover:opacity-70 transition-opacity">
                    {item.q}
                  </span>
                  <div className="flex-shrink-0 p-1 border border-border bg-background group-hover:border-foreground transition-colors">
                    {isOpen ? (
                      <Minus className="h-3 w-3 text-foreground transition-transform duration-300" />
                    ) : (
                      <Plus className="h-3 w-3 text-foreground transition-transform duration-300" />
                    )}
                  </div>
                </button>
                
                {/* Animation fluide d'ouverture */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[300px] pb-6" : "max-h-0"
                  }`}
                >
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed pr-10">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </SiteLayout>
  );
}