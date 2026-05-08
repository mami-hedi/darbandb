import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Check, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Réservation & contact — B&B Hammamet" },
      { name: "description", content: "Demandez vos dates pour réserver la villa B&B à Hammamet en exclusivité." },
      { property: "og:title", content: "Contact — B&B Hammamet" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  // Remplacez par votre vrai lien Airbnb
  const AIRBNB_URL = "https://www.airbnb.com/h/votre-villa-hammamet";

  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-12">
        <div className="eyebrow mb-4">— Contact</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.contact.title}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.contact.sub}</p>
      </section>

      <section className="container-luxe pb-32 grid md:grid-cols-12 gap-12">
        <div className="md:col-span-7">
          <div className="mb-8 p-6 border border-border bg-accent/30">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2">{t.contact.localTitle || "Réservation Directe"}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t.contact.localDesc || "Idéal pour les résidents locaux (paiement en TND ou virement)."}
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="space-y-6"
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label={t.contact.name} required><input required type="text" className={inputCls} /></Field>
              <Field label={t.contact.email} required><input required type="email" className={inputCls} /></Field>
              <Field label={t.contact.phone}><input type="tel" className={inputCls} /></Field>
              <Field label={t.contact.guests}>
                <select className={inputCls} defaultValue="2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </Field>
              <Field label={t.contact.arrival} required><input required type="date" className={inputCls} /></Field>
              <Field label={t.contact.departure} required><input required type="date" className={inputCls} /></Field>
            </div>
            <Field label={t.contact.message}>
              <textarea rows={5} className={inputCls} />
            </Field>
            <button
              type="submit"
              disabled={sent}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-foreground text-background px-8 py-4 text-xs tracking-[0.25em] uppercase hover:opacity-90 transition disabled:opacity-60"
            >
              {sent ? <><Check className="h-4 w-4" /> {t.contact.ok}</> : t.contact.submit}
            </button>
          </form>
        </div>

        <aside className="md:col-span-4 md:col-start-9 space-y-10">
          {/* Section Airbnb pour les Internationaux */}
          <div className="p-8 border border-foreground/10 bg-foreground/[0.02] flex flex-col items-center text-center">
            <div className="eyebrow mb-4">International</div>
            <h3 className="font-display text-2xl mb-4">{t.contact.airbnbTitle || "Réserver via Airbnb"}</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {t.contact.airbnbDesc || "Pour nos clients internationaux, nous recommandons de passer par la plateforme Airbnb pour une sécurité optimale."}
            </p>
            <a 
              href={AIRBNB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-3 border border-foreground px-6 py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-foreground hover:text-background transition-all duration-300"
            >
              <ExternalLink className="h-3 w-3" />
              {t.contact.airbnbAction || "Voir sur Airbnb"}
            </a>
          </div>

          <hr className="border-border" />

          <div>
            <div className="eyebrow mb-3">B&amp;B Hammamet</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Une équipe à votre écoute, 7j/7. Réponse garantie sous 24 heures.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3"><MapPin className="h-4 w-4 mt-0.5" /> Avenue de la Plage, 8050 Hammamet</li>
            <li className="flex items-start gap-3"><Phone className="h-4 w-4 mt-0.5" /> +216 72 000 000</li>
            <li className="flex items-start gap-3"><Mail className="h-4 w-4 mt-0.5" /> hello@bnb-hammamet.tn</li>
          </ul>
          
          <div className="aspect-[4/3] overflow-hidden border border-border grayscale hover:grayscale-0 transition-all duration-700">
            <iframe
              title="Carte"
              src="https://www.openstreetmap.org/export/embed.html?bbox=10.59%2C36.39%2C10.65%2C36.42&layer=mapnik"
              className="h-full w-full"
              loading="lazy"
            />
          </div>
        </aside>
      </section>
    </SiteLayout>
  );
}

const inputCls = "w-full bg-transparent border border-border focus:border-foreground transition px-4 py-3 text-sm outline-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">{label}{required && " *"}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}