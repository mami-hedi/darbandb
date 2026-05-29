import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageContext";
import { Instagram, Facebook, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  
  return (
    <footer className="mt-32 border-t border-border bg-secondary/40">
      {/* Passage à 5 colonnes sur desktop pour intégrer la FAQ */}
      <div className="container-luxe py-16 grid md:grid-cols-5 gap-10">
        
        <div className="md:col-span-2">
          <div className="font-display text-3xl">Dar B&amp;B</div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            {t.footer.made}. Avenue de la Plage, 8050 Hammamet, Tunisie.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="#" aria-label="Instagram" className="p-2 hover:opacity-60"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 hover:opacity-60"><Facebook className="h-4 w-4" /></a>
            <a href="mailto:hello@bnb-hammamet.tn" aria-label="Email" className="p-2 hover:opacity-60"><Mail className="h-4 w-4" /></a>
            {/* Icône officielle WhatsApp en SVG épuré */}
  <a 
    href="https://wa.me/21658146177" 
    target="_blank" 
    rel="noopener noreferrer" 
    aria-label="WhatsApp" 
    className="p-2 hover:opacity-60"
  >
    <svg 
      viewBox="0 0 24 24" 
      className="h-4 w-4 fill-current"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.454 5.709 1.455h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  </a>
          </div>
        </div>

        <div>
          <div className="eyebrow mb-4">Navigation</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">{t.nav.home}</Link></li>
            <li><Link to="/gallery" className="hover:underline">{t.nav.gallery}</Link></li>
            <li><Link to="/blog" className="hover:underline">{t.nav.blog}</Link></li>
            <li><Link to="/contact" className="hover:underline">{t.nav.contact}</Link></li>
            <li><Link to="/booking" className="hover:underline font-medium">{t.nav.booking}</Link></li>
          </ul>
        </div>

        {/* NOUVELLE COLONNE : Infos Pratiques */}
        <div>
          <div className="eyebrow mb-4">Informations</div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/faq" className="hover:underline font-medium">
                {t.nav.faq || "FAQ"}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-4">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>+216 72 000 000</li>
            <li>experience@bnb-villa.com</li>
          </ul>
        </div>

      </div>

      <div className="hairline">
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Dar B&amp;B  — {t.footer.rights}.</span>
          <span>Hammamet · Tunisie</span>
        </div>
      </div>
    </footer>
  );
}