import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

export const Route = createFileRoute("/blog")({
  component: Blog,
});

// Centralisation de la route API avec fallback de secours pour le dev local
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Blog() {
  const { t, lang } = useLang();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Changement de l'URL brute par la variable dynamique
    fetch(`${API_BASE}/blog`)
      .then((res) => res.json())
      .then((data) => {
        const rawPosts = Array.isArray(data) ? data : [];
        
        // Nettoyage et désérialisation sécurisée
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

  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-16">
        <div className="eyebrow mb-4">— Journal</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.blogTitle}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.blogSub}</p>
      </section>

      <section className="container-luxe pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
        {loading ? (
          <p className="col-span-full text-center py-20 font-display opacity-50 uppercase tracking-widest">Chargement...</p>
        ) : (
          posts.map((p) => {
            // Sécurité affichage
            const title = p.title?.[lang] || p.title?.['fr'] || "Sans titre";
            const excerpt = p.excerpt?.[lang] || p.excerpt?.['fr'] || "";
            const category = p.category?.[lang] || p.category?.['fr'] || "Inspiration";

            return (
              <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group">
                <div className="aspect-[4/5] overflow-hidden mb-5 bg-stone-100">
                  <img 
                    src={p.cover} 
                    alt={title} 
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                </div>
                <div className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground font-bold">
                  {new Date(p.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {category}
                </div>
                <h2 className="mt-2 font-display text-2xl leading-snug group-hover:underline underline-offset-4">
                  {title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {excerpt}
                </p>
              </Link>
            );
          })
        )}
      </section>
    </SiteLayout>
  );
}