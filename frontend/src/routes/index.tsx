import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MapPin, Wine, X, GlassWater } from "lucide-react";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

// Assets
import heroImg from "@/assets/hero.jpg";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g4 from "@/assets/g4.jpg";
import g6 from "@/assets/g6.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { t } = useLang();
  const [isWineOpen, setIsWineOpen] = useState(false);

  // Images mapping pour les suites (correspondance avec les ID du dictionnaire)
  const suiteImages: Record<string, string> = {
    "suite-azur": g1,
    "suite-olive": g2,
    "suite-jasmin": g4,
    "suite-ambre": g6,
  };

  // Bloquer le scroll quand la modal est ouverte
  useEffect(() => {
    if (isWineOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isWineOpen]);

  return (
    <SiteLayout transparentHeader>
      {/* --- HERO --- */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        <img src={heroImg} alt="Villa B&B Hammamet" className="absolute inset-0 h-full w-full object-cover" width={1920} height={1280} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative z-10 h-full container-luxe flex flex-col justify-end pb-20 md:pb-28 text-white">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <div className="text-[0.7rem] tracking-[0.35em] uppercase text-white/80 mb-6">{t.hero.eyebrow}</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[1.05] whitespace-pre-line">{t.hero.title}</h1>
            <p className="mt-8 max-w-xl text-base md:text-lg text-white/85 leading-relaxed">{t.hero.sub}</p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/contact" className="inline-flex items-center gap-3 bg-white text-foreground px-7 py-4 text-xs tracking-[0.25em] uppercase hover:bg-white/90 transition">
                {t.hero.cta} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/gallery" className="inline-flex items-center gap-3 border border-white/60 text-white px-7 py-4 text-xs tracking-[0.25em] uppercase hover:bg-white hover:text-foreground transition">
                {t.hero.cta2}
              </Link>
            </div>
          </motion.div>
          <div className="hidden md:flex absolute right-10 bottom-12 items-center gap-2 text-xs tracking-[0.25em] uppercase">
            <MapPin className="h-3.5 w-3.5" /> Hammamet · Tunisie
          </div>
        </div>
      </section>

      {/* --- INTRO & FEATURES --- */}
      <section className="container-luxe py-28 md:py-40">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 items-end">
          <div className="md:col-span-5">
            <div className="eyebrow mb-6">— {t.intro.eyebrow}</div>
            <h2 className="text-4xl md:text-5xl leading-tight font-display">{t.intro.title}</h2>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <p className="text-lg leading-relaxed text-muted-foreground">{t.intro.body}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-px mt-20 bg-border">
          {t.features.map((f: any) => (
            <div key={f.t} className="bg-background p-8 group hover:bg-accent transition-colors duration-500">
              <div className="font-display text-2xl mb-3">{f.t}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- SUITES SECTION --- */}
      <section className="container-luxe py-28 md:py-40 border-t border-border">
        <div className="mb-16 max-w-2xl">
          <div className="eyebrow mb-6">— {t.suites.eyebrow}</div>
          <h2 className="text-4xl md:text-5xl font-display mb-6">{t.suites.title}</h2>
          <p className="text-muted-foreground">{t.suites.sub}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.suites.items.map((suite: any) => (
            <Link 
              key={suite.id} 
              to={`/suites/${suite.id}`} 
              className="group block overflow-hidden"
            >
              <div className="aspect-[3/4] overflow-hidden mb-6 bg-accent">
                <img 
                  src={suiteImages[suite.id]} 
                  alt={suite.t} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
              </div>
              <div className="flex justify-between items-end border-b border-border pb-4">
                <div>
                  <h3 className="text-xl font-display">{suite.t}</h3>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{suite.d}</p>
                </div>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* --- WINE & SELECTION (Popup) --- */}
      <section className="bg-foreground text-background py-28 md:py-40 overflow-hidden">
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <div className="relative group cursor-pointer" onClick={() => setIsWineOpen(true)}>
            <div className="aspect-video overflow-hidden border border-background/10">
              <img src={g4} alt="Selection" className="h-full w-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border border-background/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-background group-hover:text-foreground transition-all duration-500">
                <Wine className="h-8 w-8" />
              </div>
            </div>
          </div>
          <div>
            <div className="text-[0.7rem] tracking-[0.35em] uppercase text-background/50 mb-6">— {t.wine.eyebrow}</div>
            <h2 className="text-4xl md:text-5xl font-display mb-6">{t.wine.title}</h2>
            <p className="text-background/70 mb-10 leading-relaxed max-w-md">{t.wine.sub}</p>
            <button 
              onClick={() => setIsWineOpen(true)}
              className="inline-flex items-center gap-3 border border-background/30 px-8 py-4 text-[10px] tracking-[0.3em] uppercase hover:bg-background hover:text-foreground transition-all"
            >
              {t.wine.cta}
            </button>
          </div>
        </div>
      </section>

      {/* --- WINE MODAL --- */}
      <AnimatePresence>
        {isWineOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-md"
          >
            <motion.div 
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-background text-foreground w-full max-w-3xl max-h-[90svh] overflow-y-auto p-8 md:p-16 relative"
            >
              <button onClick={() => setIsWineOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-accent rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
              
              <div className="text-center mb-16">
                <GlassWater className="h-8 w-8 mx-auto mb-6 text-muted-foreground" />
                <h2 className="text-4xl font-display mb-2">{t.wine.modalTitle}</h2>
                <div className="h-px w-20 bg-border mx-auto mt-6" />
              </div>

              <div className="space-y-12">
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground border-b pb-2">Vins Rouges</h4>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm">Vieux Magnon</span>
                      <span className="text-xs text-muted-foreground">95 TND</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm">Château Kurubis</span>
                      <span className="text-xs text-muted-foreground">120 TND</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-muted-foreground border-b pb-2">Vins Blancs</h4>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm">Terres de Carthage</span>
                      <span className="text-xs text-muted-foreground">80 TND</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-sm">Muscat Sec de Kelibia</span>
                      <span className="text-xs text-muted-foreground">75 TND</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-20 pt-8 border-t border-border text-center">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  {t.wine.disclaimer}
                </p>
                <button 
                  onClick={() => setIsWineOpen(false)}
                  className="mt-8 text-[10px] uppercase tracking-widest underline underline-offset-4"
                >
                  {t.wine.close}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PRICING --- */}
      <section className="bg-accent py-28 md:py-40">
        <div className="container-luxe grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="eyebrow mb-6">— {t.pricing.eyebrow}</div>
            <h2 className="text-4xl md:text-5xl leading-tight font-display text-foreground">{t.pricing.title}</h2>
          </div>
          <div className="bg-background border border-border p-10 md:p-14 shadow-sm">
            <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground">{t.pricing.from}</div>
            <div className="mt-3 flex items-baseline gap-3 text-foreground">
              <span className="font-display text-7xl">{t.pricing.price}</span>
              <span className="text-sm opacity-60">{t.pricing.per}</span>
            </div>
            <p className="mt-6 text-sm text-muted-foreground italic">{t.pricing.note}</p>
            <Link to="/contact" className="mt-10 inline-flex items-center gap-3 bg-foreground text-background px-7 py-4 text-xs tracking-[0.25em] uppercase hover:opacity-90 transition w-full justify-center sm:w-auto">
              {t.pricing.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}