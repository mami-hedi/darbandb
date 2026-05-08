import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { useLang } from "@/i18n/LanguageContext";
import { LangSwitch } from "./LangSwitch";
import { cn } from "@/lib/utils";

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
        <Link to="/" className={cn("font-display text-2xl tracking-wide", onDark ? "text-white" : "text-foreground")}>
          B<span className="opacity-60">&amp;</span>B
          <span className="ml-2 hidden sm:inline text-xs tracking-[0.3em] opacity-70">HAMMAMET</span>
        </Link>

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

        <div className="hidden md:flex items-center gap-4">
          <LangSwitch className={onDark ? "text-white" : ""} />
          <Link
            to="/contact"
            className={cn(
              "inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase border px-4 py-2.5 transition-colors",
              onDark
                ? "border-white/40 text-white hover:bg-white hover:text-foreground"
                : "border-foreground text-foreground hover:bg-foreground hover:text-background"
            )}
          >
            <Search className="h-3.5 w-3.5" />
            {t.nav.check}
          </Link>
        </div>

        <button
          className={cn("md:hidden p-2", onDark ? "text-white" : "text-foreground")}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="container-luxe py-6 flex flex-col gap-5">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-base">
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <LangSwitch />
              <Link to="/contact" onClick={() => setOpen(false)} className="text-xs tracking-[0.2em] uppercase border border-foreground px-4 py-2.5">
                {t.nav.check}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
