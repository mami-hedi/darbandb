import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getImageUrl = (path: string) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("blob")) return path;
  return `${API_BASE.replace("/api", "")}${path}`;
};

export const Route = createFileRoute("/blog_/$slug")({
  loader: async ({ params }) => {
  try {
    const res = await fetch(`${API_BASE}/blog/${params.slug}`);
    if (!res.ok) throw notFound();
    const post = await res.json();
    return { post };
  } catch (err: any) {
    if (err?.isNotFound) throw err;  // laisse passer le notFound
    console.error("Erreur Loader:", err);
    throw notFound();
  }
},
  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [] };
    const { post } = loaderData;

    const getMetaString = (field: any) => {
      if (!field) return "";
      if (typeof field === "string") {
        try { return JSON.parse(field).fr || ""; } catch { return field; }
      }
      return field.fr || field.en || "";
    };

    // Utilise metaTitle si défini, sinon title
    const metaTitle =
      getMetaString(post.metaTitle) || getMetaString(post.title) || "Blog";
    const metaDescription =
      getMetaString(post.metaDescription) || getMetaString(post.excerpt) || "";
    const imageAlt = getMetaString(post.imageAlt) || metaTitle;

    return {
      meta: [
        { title: `${metaTitle} — Dar B&B Hammamet` },
        { name: "description", content: metaDescription },
        { property: "og:title", content: metaTitle },
        { property: "og:description", content: metaDescription },
        { property: "og:image", content: getImageUrl(post.cover) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl">Article introuvable</h1>
        <Link to="/blog" className="mt-6 inline-block underline">
          ← Retour au Blog
        </Link>
      </div>
    </SiteLayout>
  ),
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  const { lang } = useLang();

  const parseContent = (data: any, language: string) => {
    if (!data) return "";
    let target = data;
    if (typeof target === "string") {
      try { target = JSON.parse(target); } catch { return target; }
    }
    if (typeof target === "object" && target !== null) {
      return target[language] || target["fr"] || Object.values(target)[0] || "";
    }
    return String(target);
  };

  const title = parseContent(post.title, lang);
  const category = parseContent(post.category, lang);
  const bodyText = parseContent(post.body, lang);
  const imageAlt = parseContent(post.imageAlt, lang) || title;
  const formattedDate = new Date(post.createdAt).toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <SiteLayout>
      <article className="bg-white min-h-screen">

        {/* ── NAVIGATION RETOUR ── */}
        <div className="container-luxe pt-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-stone-900 transition-colors font-bold"
          >
            <ArrowLeft size={14} /> Blog
          </Link>
        </div>

        {/* ── EN-TÊTE ── */}
        <header className="container-luxe py-12 md:py-20 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <div className="text-[10px] tracking-[0.25em] uppercase text-stone-400 font-bold mb-4">
              {formattedDate} · {category}
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-stone-950">
              {title}
            </h1>
          </motion.div>
        </header>

        {/* ── IMAGE COUVERTURE pleine largeur ── */}
        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.215, 0.61, 0.355, 1], delay: 0.1 }}
          className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-stone-100"
        >
          <img
            src={getImageUrl(post.cover)}
            alt={imageAlt}
            className="h-full w-full object-cover"
          />
        </motion.div>

        {/* ── CORPS ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.215, 0.61, 0.355, 1], delay: 0.25 }}
          className="container-luxe py-16 md:py-24 max-w-2xl"
        >
          {/* Ligne décorative style Hotellia */}
          <div className="w-12 h-px bg-stone-300 mb-12" />

          <div className="prose prose-stone prose-lg max-w-none">
            {bodyText ? (
              bodyText.split("\n").map((paragraph: string, i: number) => {
                const trimmed = paragraph.trim();
                return trimmed ? (
                  <p
                    key={i}
                    className="mb-8 leading-relaxed text-stone-700 text-lg md:text-xl font-serif"
                  >
                    {trimmed}
                  </p>
                ) : null;
              })
            ) : (
              <p className="text-stone-400 italic">Aucun contenu à afficher.</p>
            )}
          </div>

          {/* ── RETOUR AU BAS ── */}
          <div className="mt-20 pt-8 border-t border-stone-100">
            <Link
              to="/blog"
              className="inline-flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase font-bold text-stone-400 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft size={13} />
              {lang === "fr" ? "Retour au journal" : "Back to journal"}
            </Link>
          </div>
        </motion.div>

      </article>
    </SiteLayout>
  );
}