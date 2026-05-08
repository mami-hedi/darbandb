import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/SiteLayout";
import { useLang } from "@/i18n/LanguageContext";
import { posts } from "@/data/blogPosts";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Journal — B&B Hammamet" },
      { name: "description", content: "Récits, adresses et inspirations autour d'Hammamet et de la Tunisie." },
      { property: "og:title", content: "Journal — B&B Hammamet" },
    ],
  }),
  component: Blog,
});

function Blog() {
  const { t, lang } = useLang();
  return (
    <SiteLayout>
      <section className="container-luxe pt-16 pb-16">
        <div className="eyebrow mb-4">— Journal</div>
        <h1 className="font-display text-5xl md:text-7xl">{t.blogTitle}</h1>
        <p className="mt-4 text-muted-foreground max-w-xl">{t.blogSub}</p>
      </section>

      <section className="container-luxe pb-24 grid md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-14">
        {posts.map((p) => (
          <Link key={p.slug} to="/blog/$slug" params={{ slug: p.slug }} className="group">
            <div className="aspect-[4/5] overflow-hidden mb-5">
              <img src={p.cover} alt={p.title[lang]} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="text-xs tracking-[0.25em] uppercase text-muted-foreground">{p.date} · {p.category[lang]}</div>
            <h2 className="mt-2 font-display text-2xl leading-snug group-hover:underline underline-offset-4">{p.title[lang]}</h2>
            <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{p.excerpt[lang]}</p>
          </Link>
        ))}
      </section>
    </SiteLayout>
  );
}
