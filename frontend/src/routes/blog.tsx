import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { motion } from "framer-motion"; // Import de framer-motion

export const Route = createFileRoute("/blog")({
  component: Blog,
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Blog() {
  const { t, lang } = useLang();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/blog`)
      .then((res) => res.json())
      .then((data) => {
        const rawPosts = Array.isArray(data) ? data : [];
        
        const cleanedPosts = rawPosts.map((p: any) => ({
          ...p,
          title: typeof p.title === 'string' ? JSON.parse(p.title) : p.title,
          excerpt: typeof p.excerpt === 'string' ? JSON.parse(p.excerpt) : p.excerpt,
          category: typeof p.category === 'string' ? JSON.parse(p.category) : p.category,
        }));

        const published = cleanedPosts.filter((p: any) => p.status === "published");
        setPosts(published);
      })
      .catch((err) => console.error("Erreur blog:", err))
      .finally(() => setLoading(false));
  }, []);

  // Configuration de l'animation au scroll pour chaque ligne
  const rowVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.215, 0.610, 0.355, 1.000] } // Transition fluide style luxe
    }
  };

  return (
    <SiteLayout>
      {/* En-tête du blog */}
      <section className="container-luxe pt-16 pb-16">
        <div className="eyebrow mb-4">— Journal</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.blogTitle}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.blogSub}</p>
      </section>

      {/* Section style "Total Escape" : Grid à 3 colonnes sur desktop */}
      <section className="container-luxe pb-32 flex flex-col gap-20 md:gap-28">
        {loading ? (
          <p className="text-center py-20 font-display opacity-50 uppercase tracking-widest">Chargement...</p>
        ) : (
          posts.map((p, index) => {
            const title = p.title?.[lang] || p.title?.['fr'] || "Sans titre";
            const excerpt = p.excerpt?.[lang] || p.excerpt?.['fr'] || "";
            const category = p.category?.[lang] || p.category?.['fr'] || "Inspiration";
            const formattedDate = new Date(p.createdAt).toLocaleDateString(
              lang === 'fr' ? 'fr-FR' : 'en-US', 
              { year: 'numeric', month: 'long', day: 'numeric' }
            );

            return (
              <motion.div
                key={p.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={rowVariants}
              >
                <Link 
                  to="/blog/$slug" 
                  params={{ slug: p.slug }} 
                  className="group grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b border-stone-200/60 pb-12 md:pb-16 last:border-none"
                >
                  
                  {/* COLONNE 1 : TITRE & CATEGORIE (Prend 4 colonnes sur 12) */}
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-semibold mb-3">
                      {category} — {formattedDate}
                    </span>
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-tight text-stone-900 group-hover:text-stone-600 transition-colors duration-300">
                      {title}
                    </h2>
                  </div>

                  {/* COLONNE 2 : IMAGE ALIGNÉE AU CENTRE (Prend 4 colonnes sur 12) */}
                  <div className="md:col-span-4 flex justify-center w-full">
                    <div className="aspect-[4/5] w-full max-w-[340px] overflow-hidden bg-stone-100 shadow-sm">
                      <img 
                        src={p.cover} 
                        alt={title} 
                        className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105" 
                      />
                    </div>
                  </div>

                  {/* COLONNE 3 : DESCRIPTION / EXTRAIT (Prend 4 colonnes sur 12) */}
                  <div className="md:col-span-4 flex flex-col justify-center">
                    <p className="text-stone-600 font-sans text-base md:text-md leading-relaxed line-clamp-4 md:max-w-xs md:ml-auto">
                      {excerpt}
                    </p>
                    {/* Lien "Lire l'article" invisible sur mobile, apparaît subtilement au hover */}
                    <span className="hidden md:block text-xs uppercase tracking-widest text-stone-400 group-hover:text-stone-900 mt-6 transition-colors duration-300 md:ml-auto underline underline-offset-4">
                      Lire l'article →
                    </span>
                  </div>

                </Link>
              </motion.div>
            );
          })
        )}
      </section>
    </SiteLayout>
  );
}