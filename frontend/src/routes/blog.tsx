import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { motion, useScroll, useTransform } from "framer-motion";

export const Route = createFileRoute("/blog")({
  component: Blog,
});

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  return `${API_BASE.replace("/api", "")}${path}`;
};

function BlogCard({ post, index, lang }: { post: any; index: number; lang: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // ── Détection mobile ──
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax désactivé sur mobile
  const imageY = useTransform(scrollYProgress, [0, 1], ["6%", "-6%"]);

  const title = post.title?.[lang] || post.title?.fr || "Sans titre";
  const excerpt = post.excerpt?.[lang] || post.excerpt?.fr || "";
  const category = post.category?.[lang] || post.category?.fr || "Inspiration";
  const formattedDate = new Date(post.createdAt).toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${80 + index * 24}px`, zIndex: index + 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1] }}
      >
        <Link
          to="/blog/$slug"
          params={{ slug: post.slug }}
          className="group block bg-white border border-stone-100 overflow-hidden"
          style={{ borderRadius: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 min-h-[480px] md:min-h-[560px]">

            {/* IMAGE — alterne gauche/droite selon l'index */}
            <div
              className={`relative overflow-hidden bg-stone-100 ${
                index % 2 === 1 ? "md:order-2" : ""
              }`}
            >
              <motion.div
                className="absolute inset-0"
                style={{ y: isMobile ? 0 : imageY }}
              >
                <img
                  src={getImageUrl(post.cover)}
                  alt={title}
                  className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{
                    height: isMobile ? "100%" : "115%",
                    marginTop: isMobile ? "0" : "-7.5%",
                  }}
                />
              </motion.div>

              {/* Badge catégorie sur l'image */}
              <div className="absolute top-6 left-6 z-10">
                <span className="text-[9px] tracking-[0.22em] uppercase font-bold bg-white/90 text-stone-700 px-3 py-1.5 backdrop-blur-sm">
                  {category}
                </span>
              </div>

              {/* Numéro d'article */}
              <div className="absolute bottom-6 right-6 z-10">
                <span className="font-display text-white/40 text-4xl font-bold select-none">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* TEXTE */}
            <div
              className={`flex flex-col justify-between p-10 md:p-14 lg:p-20 ${
                index % 2 === 1 ? "md:order-1" : ""
              }`}
            >
              {/* Haut : date */}
              <div className="text-[10px] tracking-[0.25em] uppercase text-stone-400 font-semibold">
                {formattedDate}
              </div>

              {/* Milieu : titre + extrait */}
              <div className="flex flex-col gap-6 my-auto py-10">
                <h2 className="font-display text-3xl md:text-4xl lg:text-5xl leading-[1.08] text-stone-900 group-hover:text-stone-500 transition-colors duration-500">
                  {title}
                </h2>
                <p className="text-stone-500 text-base leading-relaxed line-clamp-4 max-w-sm">
                  {excerpt}
                </p>
              </div>

              {/* Bas : CTA */}
              <div className="flex items-center gap-3 border-t border-stone-100 pt-6">
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-stone-400 group-hover:text-stone-900 transition-colors duration-300">
                  {lang === "fr" ? "Lire l'article" : "Read more"}
                </span>
                <span className="text-stone-300 group-hover:text-stone-900 transition-all duration-300 transform group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>

          </div>
        </Link>
      </motion.div>
    </div>
  );
}

function Blog() {
  const { t, lang } = useLang();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/blog`)
      .then((res) => res.json())
      .then((data) => {
        const rawPosts = Array.isArray(data) ? data : [];
        const cleaned = rawPosts.map((p: any) => ({
          ...p,
          title: typeof p.title === "string" ? JSON.parse(p.title) : p.title,
          excerpt: typeof p.excerpt === "string" ? JSON.parse(p.excerpt) : p.excerpt,
          category: typeof p.category === "string" ? JSON.parse(p.category) : p.category,
        }));
        setPosts(cleaned.filter((p: any) => p.status === "published"));
      })
      .catch((err) => console.error("Erreur blog:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteLayout>
      {/* ── EN-TÊTE ── */}
      <section className="container-luxe pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.215, 0.61, 0.355, 1] }}
        >
          <div className="eyebrow mb-4">— Journal</div>
          <h1 className="font-display text-5xl md:text-7xl">{t.blogTitle}</h1>
          <p className="mt-4 text-muted-foreground max-w-xl">{t.blogSub}</p>
        </motion.div>
      </section>

      {/* ── SÉPARATEUR ── */}
      <div className="w-full border-t border-stone-200" />

      {/* ── ARTICLES ── */}
      <section className="pb-40">
        {loading ? (
          <p className="text-center py-32 font-display opacity-30 uppercase tracking-widest text-sm">
            Chargement...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center py-32 text-stone-400 text-sm">
            {lang === "fr" ? "Aucun article publié." : "No published articles yet."}
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: "2px" }}>
            {posts.map((post, index) => (
              <BlogCard key={post.slug} post={post} index={index} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}