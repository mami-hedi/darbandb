import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";

// Configuration de l'URL de l'API avec fallback pour le dev local
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    try {
      // Utilisation de la variable d'environnement
      const res = await fetch(`${API_BASE}/blog/${params.slug}`);
      if (!res.ok) throw notFound();
      const post = await res.json();
      return { post };
    } catch (err) {
      console.error("Erreur Loader:", err);
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.post) return { meta: [] };

    const { post } = loaderData;
    
    // Extraction sécurisée pour les métadonnées (fallback FR par défaut)
    const getMetaString = (field: any) => {
      if (!field) return "";
      if (typeof field === "string") {
        try {
          const parsed = JSON.parse(field);
          return parsed.fr || parsed.en || "";
        } catch {
          return field;
        }
      }
      return field.fr || field.en || "";
    };

    const metaTitle = getMetaString(post.title) || "Journal";
    const metaDescription = getMetaString(post.excerpt);

    return {
      meta: [
        { title: `${metaTitle} — B&B Hammamet` },
        { name: "description", content: metaDescription },
        { property: "og:image", content: post.cover },
      ],
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl">Article introuvable</h1>
        <Link to="/blog" className="mt-6 inline-block underline">← Retour au journal</Link>
      </div>
    </SiteLayout>
  ),
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  const { lang } = useLang();

  /**
   * Fonction de secours pour extraire le texte multilingue 
   * peu importe le format envoyé par le backend (string ou objet)
   */
  const parseContent = (data: any, language: string) => {
    if (!data) return "";
    
    let target = data;

    // Si c'est une string, on tente de la parser en JSON
    if (typeof target === 'string') {
      try {
        const parsed = JSON.parse(target);
        target = parsed;
      } catch (e) {
        // Si ce n'est pas du JSON, c'est du texte brut, on le retourne
        return target;
      }
    }

    // Si on a un objet, on cherche la langue, sinon on prend le français, sinon la valeur brute
    if (typeof target === 'object' && target !== null) {
      return target[language] || target['fr'] || Object.values(target)[0] || "";
    }

    return String(target);
  };

  const title = parseContent(post.title, lang);
  const category = parseContent(post.category, lang);
  const bodyText = parseContent(post.body, lang);

  return (
    <SiteLayout>
      <article className="bg-white min-h-screen">
        {/* Navigation retour */}
        <div className="container-luxe pt-12">
          <Link 
            to="/blog" 
            className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-stone-400 hover:text-stone-900 transition-colors font-bold"
          >
            <ArrowLeft size={14} /> Journal
          </Link>
        </div>
        
        {/* En-tête */}
        <header className="container-luxe py-12 md:py-20 max-w-4xl">
          <div className="text-[10px] tracking-[0.25em] uppercase text-stone-400 font-bold mb-4">
             {new Date(post.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { 
               year: 'numeric', 
               month: 'long', 
               day: 'numeric' 
             })} · {category}
          </div>
          <h1 className="font-display text-4xl md:text-7xl leading-[1.1] text-stone-950">
            {title}
          </h1>
        </header>

        {/* Image de couverture */}
        <div className="w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-stone-100">
          <img 
            src={post.cover} 
            alt={title} 
            className="h-full w-full object-cover" 
          />
        </div>

        {/* Corps de l'article */}
        <div className="container-luxe py-16 md:py-24 max-w-2xl">
          <div className="prose prose-stone prose-lg max-w-none">
            {bodyText ? (
              bodyText.split("\n").map((paragraph: string, i: number) => {
                const trimmed = paragraph.trim();
                return trimmed ? (
                  <p 
                    key={i} 
                    className="mb-8 leading-relaxed text-stone-800 text-lg md:text-xl font-serif"
                  >
                    {trimmed}
                  </p>
                ) : null;
              })
            ) : (
              <p className="text-stone-400 italic">Aucun contenu à afficher.</p>
            )}
          </div>
        </div>
      </article>
    </SiteLayout>
  );
}