import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { LangSwitch } from "./LangSwitch";
import { cn } from "@/lib/utils";

// Importation des logos depuis assets
import logoBlanc from "@/assets/LogoB_BBlanc.png";
import logoNoir from "@/assets/LogoB_B-noir.png";

export function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t.nav.home },
    { to: "/gallery", label: t.nav.gallery },
    { to: "/blog", label: t.nav.blog },
    { to: "/contact", label: t.nav.contact },
  ] as const;

  // Détermine si on est en mode "clair sur sombre" (Header transparent sur la Home)
  const onDark = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border"
          : isHome
            ? "bg-transparent"
            : "bg-background border-b border-border"
      )}
    >
      <div className="container-luxe flex items-center justify-between h-20">
        {/* Zone du Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src={onDark ? logoBlanc : logoNoir} 
            alt="B&B Hammamet Oasis" 
            className="h-20 w-auto transition-all duration-500"
          />
          <span className={cn(
            "hidden sm:inline text-[10px] tracking-[0.4em] uppercase transition-colors duration-500",
            onDark ? "text-white/80" : "text-foreground/80"
          )}>
            
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "text-sm tracking-wide transition-colors relative",
                onDark ? "text-white/85 hover:text-white" : "text-foreground/70 hover:text-foreground"
              )}
              activeProps={{ className: "after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-current" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <LangSwitch className={onDark ? "text-white" : ""} />
          <Link
            to="/contact"
            className={cn(
              "inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase border px-5 py-2.5 transition-all duration-300",
              onDark
                ? "border-white/40 text-white hover:bg-white hover:text-black"
                : "border-foreground text-foreground hover:bg-foreground hover:text-background"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            {t.nav.check}
          </Link>
        </div>

        {/* Bouton Menu Mobile */}
        <button
          className={cn("md:hidden p-2 transition-colors", onDark ? "text-white" : "text-foreground")}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Menu Mobile */}
      {open && (
        <div className="md:hidden bg-background border-t border-border animate-in fade-in slide-in-from-top-4">
          <div className="container-luxe py-8 flex flex-col gap-6">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-lg tracking-wide">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <LangSwitch />
              <Link to="/contact" onClick={() => setOpen(false)} className="text-[10px] tracking-[0.2em] uppercase border border-foreground px-5 py-2.5">
                {t.nav.check}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}