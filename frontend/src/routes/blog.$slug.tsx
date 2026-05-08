import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { posts } from "@/data/blogPosts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = posts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.post.title.fr} — B&B Hammamet` },
          { name: "description", content: loaderData.post.excerpt.fr },
          { property: "og:title", content: loaderData.post.title.fr },
          { property: "og:image", content: loaderData.post.cover },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <h1 className="font-display text-4xl">Article introuvable</h1>
        <Link to="/blog" className="mt-6 inline-block underline">← Retour au journal</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-luxe py-32 text-center">
        <p>{error.message}</p>
      </div>
    </SiteLayout>
  ),
  component: Post,
});

function Post() {
  const { post } = Route.useLoaderData();
  const { lang } = useLang();
  return (
    <SiteLayout>
      <article>
        <div className="container-luxe pt-12">
          <Link to="/blog" className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Journal
          </Link>
        </div>
        <header className="container-luxe py-12 max-w-3xl">
          <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">{post.date} · {post.category[lang]}</div>
          <h1 className="mt-4 font-display text-4xl md:text-6xl leading-tight">{post.title[lang]}</h1>
        </header>
        <div className="aspect-[16/9] overflow-hidden">
          <img src={post.cover} alt={post.title[lang]} className="h-full w-full object-cover" />
        </div>
        <div className="container-luxe py-16 max-w-2xl prose prose-neutral">
          {post.body[lang].split("\n\n").map((p: string, i: number) => (
            <p key={i} className="mb-6 leading-relaxed text-foreground/85">{p}</p>
          ))}
        </div>
      </article>
    </SiteLayout>
  );
}
