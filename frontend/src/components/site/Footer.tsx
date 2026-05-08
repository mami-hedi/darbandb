import { Link } from "@tanstack/react-router";
import { useLang } from "@/i18n/LanguageContext";
import { Instagram, Facebook, Mail } from "lucide-react";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-32 border-t border-border bg-secondary/40">
      <div className="container-luxe py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-3xl">B&amp;B Hammamet</div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            {t.footer.made}. Avenue de la Plage, 8050 Hammamet, Tunisie.
          </p>
          <div className="mt-6 flex gap-4">
            <a href="#" aria-label="Instagram" className="p-2 hover:opacity-60"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Facebook" className="p-2 hover:opacity-60"><Facebook className="h-4 w-4" /></a>
            <a href="mailto:hello@bnb-hammamet.tn" aria-label="Email" className="p-2 hover:opacity-60"><Mail className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <div className="eyebrow mb-4">Navigation</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">{t.nav.home}</Link></li>
            <li><Link to="/gallery" className="hover:underline">{t.nav.gallery}</Link></li>
            <li><Link to="/blog" className="hover:underline">{t.nav.blog}</Link></li>
            <li><Link to="/contact" className="hover:underline">{t.nav.contact}</Link></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-4">Contact</div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>+216 72 000 000</li>
            <li>hello@bnb-hammamet.tn</li>
            <li><Link to="/admin" className="hover:underline text-foreground">{t.nav.admin}</Link></li>
          </ul>
        </div>
      </div>
      <div className="hairline">
        <div className="container-luxe py-6 flex flex-col md:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} B&amp;B Hammamet — {t.footer.rights}.</span>
          <span>Hammamet · Tunisie</span>
        </div>
      </div>
    </footer>
  );
}
