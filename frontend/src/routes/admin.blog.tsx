import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { posts as initial } from "@/data/blogPosts";

type Item = { slug: string; title: string; date: string; category: string };

export const Route = createFileRoute("/admin/blog")({
  component: BlogAdmin,
});

function BlogAdmin() {
  const [items, setItems] = useState<Item[]>(initial.map((p) => ({ slug: p.slug, title: p.title.fr, date: p.date, category: p.category.fr })));
  const [editing, setEditing] = useState<Item | null>(null);

  const save = (it: Item) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.slug === it.slug);
      if (idx === -1) return [it, ...prev];
      const c = [...prev]; c[idx] = it; return c;
    });
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <div className="eyebrow">— Édition</div>
          <h1 className="font-display text-4xl mt-2">Blog</h1>
        </div>
        <button onClick={() => setEditing({ slug: `nouveau-${Date.now()}`, title: "", date: new Date().toLocaleDateString("fr-FR"), category: "Inspiration" })} className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2.5 text-xs tracking-[0.2em] uppercase">
          <Plus className="h-4 w-4" /> Nouvel article
        </button>
      </div>

      <div className="bg-background border border-border">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="text-left p-4">Titre</th>
              <th className="text-left p-4">Catégorie</th>
              <th className="text-left p-4">Date</th>
              <th className="text-right p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="p-4">{p.title}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 text-muted-foreground">{p.date}</td>
                <td className="p-4 text-right space-x-3">
                  <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 text-xs hover:underline"><Pencil className="h-3.5 w-3.5" /> Éditer</button>
                  <button onClick={() => setItems((prev) => prev.filter((i) => i.slug !== p.slug))} className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5" /> Suppr</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => { e.preventDefault(); save(editing); }}
            className="bg-background w-full max-w-xl p-8 space-y-5"
          >
            <div className="font-display text-2xl">Article</div>
            <Field label="Titre"><input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inp} required /></Field>
            <Field label="Catégorie"><input value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className={inp} /></Field>
            <Field label="Date"><input value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={inp} /></Field>
            <Field label="Contenu"><textarea rows={6} className={inp} placeholder="Texte de l'article…" /></Field>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-xs uppercase tracking-wider">Annuler</button>
              <button className="bg-foreground text-background px-5 py-2.5 text-xs tracking-[0.2em] uppercase">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const inp = "w-full bg-transparent border border-border focus:border-foreground px-3 py-2 text-sm outline-none";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">{label}</span><div className="mt-2">{children}</div></label>;
}
