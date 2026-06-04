// ============================================
// Page Contact — Version Black Édition Luxe
// @/routes/contact.tsx
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Phone, Check } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Services — B&B Hammamet" },
      {
        name: "description",
        content: "Une question, une demande de partenariat ou besoin d'assistance ? Contactez l'équipe de Dar B&B.",
      },
    ],
  }),
  component: Contact,
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Contact() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "general",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (response.ok) {
        setSent(true);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          subject: "general",
          message: "",
        });

        setTimeout(() => {
          setSent(false);
        }, 4000);
      } else {
        const error = await response.json();
        setErrorMsg(error.error || "Une erreur est survenue.");
      }
    } catch (error) {
      setErrorMsg("Impossible d'envoyer le message. Vérifiez votre connexion.");
      console.error(error);
    }
  };

  return (
    <SiteLayout>
      {/* Conteneur principal plein écran noir */}
      <div className="bg-neutral-950 text-white min-h-screen font-sans selection:bg-white selection:text-black">
        
        {/* En-tête de la page */}
        <section className="container-luxe pt-24 pb-12">
          <div className="text-[10px] tracking-[0.3em] uppercase text-neutral-400 mb-4">
            — {t.contact.eyebrow}
          </div>
          <h1 className="font-display text-5xl md:text-7xl text-white tracking-tight">
            {t.contact.title}
          </h1>
          <p className="mt-4 text-neutral-400 max-w-xl text-sm md:text-base leading-relaxed">
            {t.contact.sub}
          </p>
        </section>

        {/* Section principale du contenu */}
        <section className="container-luxe pb-32 grid lg:grid-cols-12 gap-16 items-start">
          
          {/* COLONNE GAUCHE : FORMULAIRE DE CONTACT */}
          <div className="lg:col-span-7 space-y-8">
            
            {errorMsg && (
              <div className="p-4 bg-red-950/40 border border-red-800 text-sm text-red-200 backdrop-blur-sm animate-fade-in">
                {errorMsg}
              </div>
            )}

            {sent && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-sm text-emerald-200 flex items-center gap-2 backdrop-blur-sm animate-fade-in">
                <Check className="h-4 w-4 text-emerald-400" /> {t.contact.success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label={t.contact.firstName} required>
                  <input
                    required
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className={inputCls}
                    placeholder={t.contact.firstName}
                  />
                </Field>
                
                <Field label={t.contact.lastName} required>
                  <input
                    required
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className={inputCls}
                    placeholder={t.contact.lastName}
                  />
                </Field>

                <Field label={t.contact.email} required>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={inputCls}
                    placeholder="exemple@domaine.com"
                  />
                </Field>

                <Field label={t.contact.phone}>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={inputCls}
                    placeholder="---- -- --- ---"
                  />
                </Field>
              </div>

              <Field label={t.contact.subject} required>
                <select
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={inputCls}
                >
                  <option value="general" className="bg-neutral-900 text-white">
                    {t.contact.subjects.general}
                  </option>
                  <option value="service" className="bg-neutral-900 text-white">
                    {t.contact.subjects.service}
                  </option>
                  <option value="partnership" className="bg-neutral-900 text-white">
                    {t.contact.subjects.partnership}
                  </option>
                  <option value="support" className="bg-neutral-900 text-white">
                    {t.contact.subjects.support}
                  </option>
                  <option value="other" className="bg-neutral-900 text-white">
                    {t.contact.subjects.other}
                  </option>
                </select>
              </Field>

              <Field label={t.contact.message} required>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={inputCls}
                  placeholder={t.contact.messagePlaceholder}
                />
              </Field>

              <button
                type="submit"
                disabled={sent}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black font-semibold px-8 py-4 text-xs tracking-[0.25em] uppercase hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {sent ? (
                  <>
                    <Check className="h-4 w-4 text-black" /> {t.contact.submit}
                  </>
                ) : (
                  t.contact.submit
                )}
              </button>
            </form>
          </div>

          {/* COLONNE DROITE : COORDONNÉES DIRECTES & CARTE CARRÉE */}
          <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            
            {/* Blocs d'informations */}
            <div className="space-y-6 border border-neutral-800 p-6 bg-neutral-900/40 backdrop-blur-sm">
              <div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-neutral-400 font-bold mb-3">
                  {t.contact.infoTitle}
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {t.contact.infoDesc}
                </p>
              </div>
              
              <ul className="space-y-4 text-sm border-t border-neutral-800 pt-6">
                <li className="flex items-start gap-4">
                  <MapPin className="h-4 w-4 mt-0.5 text-neutral-400 flex-shrink-0" /> 
                  <span className="text-neutral-200">Avenue de la Plage, 8050 Hammamet, Tunisie</span>
                </li>
                <li className="flex items-start gap-4">
                  <Phone className="h-4 w-4 mt-0.5 text-neutral-400 flex-shrink-0" /> 
                  <span className="text-neutral-200">+216 72 000 000</span>
                </li>
                <li className="flex items-start gap-4">
                  <Mail className="h-4 w-4 mt-0.5 text-neutral-400 flex-shrink-0" /> 
                  <span className="text-neutral-200">experience@bnb-villa.com</span>
                </li>
              </ul>
            </div>

            {/* LA CARTE EN FORMAT CARRÉ PERFECT */}
            <div className="w-full aspect-square overflow-hidden border border-neutral-800 shadow-2xl relative group">
  <iframe
    title="Carte Dar B&B"
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2679.5965991201792!2d10.6492908!3d36.421302499999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13029f1a7e18f0a3%3A0x26c98417956920f1!2sDar%20B%26B!5e1!3m2!1sfr!2stn!4v1780318631513!5m2!1sfr!2stn"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    className="w-full h-full grayscale invert opacity-70 transition-all duration-700 group-hover:grayscale-0 group-hover:invert-0 group-hover:opacity-100"
  />
</div>

          </aside>
        </section>

      </div>
    </SiteLayout>
  );
}

// Styles d'input optimisés pour le thème Dark Luxury
const inputCls =
  "w-full bg-neutral-900/50 border border-neutral-800 text-white focus:border-white transition px-4 py-4 text-sm outline-none placeholder:text-neutral-600 appearance-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[0.65rem] tracking-[0.25em] uppercase text-neutral-400 font-bold">
        {label}
        {required && <span className="text-neutral-500"> *</span>}
      </span>
      <div className="mt-2.5">{children}</div>
    </label>
  );
}