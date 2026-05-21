import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Trash2, Plus, X, Globe, Layout, Image as ImageIcon } from 'lucide-react';

// --- CONFIGURATION DE LA ROUTE ---
export const Route = createFileRoute('/admin/blog')({
  component: AdminBlog,
});

// Gestion dynamique de l'URL de l'API (S'adapte automatiquement entre dev et prod)
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE}/blog`;

const INITIAL_STATE = {
  slug: '',
  cover: '',
  status: 'published',
  title: { fr: '', en: '' },
  excerpt: { fr: '', en: '' },
  body: { fr: '', en: '' },
  category: { fr: 'Inspiration', en: 'Inspiration' }
};

function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();

      // Nettoyage de sécurité
      const cleanedPosts = (Array.isArray(data) ? data : []).map(post => ({
        ...post,
        title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
        excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
        body: typeof post.body === 'string' ? JSON.parse(post.body) : post.body,
      }));

      setPosts(cleanedPosts);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    preventDefault();
    if (!editing) return;

    // Validation stricte
    const isInvalid = !editing.slug?.trim() || !editing.cover?.trim() || !editing.title?.fr?.trim();
    
    if (isInvalid) {
      alert("Erreur : Le slug, l'image et le titre (FR) sont obligatoires.");
      return;
    }

    const isUpdate = !!editing.id;
    const url = isUpdate ? `${API_URL}/${editing.id}` : API_URL;
    const method = isUpdate ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });

      if (res.ok) {
        setEditing(null);
        fetchPosts();
      } else {
        const error = await res.json();
        alert(`Erreur serveur : ${error.message}`);
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Supprimer cet article ?")) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchPosts();
      } catch (err) { console.error(err); }
    }
  };

  if (loading) return <div className="p-20 text-center font-display opacity-50">Chargement...</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6 md:p-12 text-stone-900">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-end mb-12">
        <div>
          <p className="text-[10px] tracking-widest uppercase text-stone-400 mb-2 font-bold">— Admin Panel</p>
          <h1 className="font-display text-5xl">Journal Dar B&B</h1>
        </div>
        <button 
          onClick={() => setEditing({ ...INITIAL_STATE })}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-black transition-all"
        >
          <Plus size={18} /> <span className="text-xs font-bold uppercase tracking-widest">Nouveau</span>
        </button>
      </div>

      {/* LISTE DES ARTICLES */}
      <div className="max-w-6xl mx-auto grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <img src={post.cover} className="w-16 h-16 rounded-lg object-cover bg-stone-100" alt="" />
              <div>
                <h3 className="font-bold text-lg">{post.title?.fr || "Sans titre"}</h3>
                <p className="text-xs text-stone-400 font-mono">/{post.slug}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditing({ ...INITIAL_STATE, ...post })} 
                className="p-2 hover:bg-stone-100 rounded-full text-stone-400 hover:text-stone-900"
              >
                <Pencil size={18} />
              </button>
              <button 
                onClick={() => handleDelete(post.id)} 
                className="p-2 hover:bg-red-50 rounded-full text-stone-300 hover:text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE D'ÉDITION */}
      {editing && (
        <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-display text-xl uppercase italic">Édition de l'article</h2>
              <button onClick={() => setEditing(null)} className="p-2 hover:bg-stone-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSave} className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* SETTINGS */}
                <div className="space-y-6 lg:border-r lg:pr-8">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400">Slug (URL)</label>
                    <input 
                      value={editing.slug || ''} 
                      onChange={e => setEditing({...editing, slug: e.target.value})} 
                      className="w-full bg-stone-50 p-3 rounded-xl mt-1 text-sm outline-none focus:ring-1 focus:ring-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400">Image URL</label>
                    <input 
                      value={editing.cover || ''} 
                      onChange={e => setEditing({...editing, cover: e.target.value})} 
                      className="w-full bg-stone-50 p-3 rounded-xl mt-1 text-sm outline-none focus:ring-1 focus:ring-stone-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400">Statut</label>
                    <select 
                      value={editing.status || 'published'} 
                      onChange={e => setEditing({...editing, status: e.target.value})} 
                      className="w-full bg-stone-50 p-3 rounded-xl mt-1 text-sm outline-none"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                </div>

                {/* CONTENT FR */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-blue-500"/> <span className="text-[10px] uppercase font-bold">Français</span>
                  </div>
                  <input 
                    placeholder="Titre FR" 
                    value={editing.title?.fr || ''} 
                    onChange={e => setEditing({...editing, title: {...editing.title, fr: e.target.value}})}
                    className="w-full text-xl font-display border-b py-2 outline-none focus:border-stone-900"
                  />
                  <textarea 
                    placeholder="Résumé (FR)" 
                    rows={3}
                    value={editing.excerpt?.fr || ''} 
                    onChange={e => setEditing({...editing, excerpt: {...editing.excerpt, fr: e.target.value}})}
                    className="w-full bg-stone-50 p-3 rounded-xl text-sm outline-none"
                  />
                  <textarea 
                    placeholder="Contenu (FR)" 
                    rows={6}
                    value={editing.body?.fr || ''} 
                    onChange={e => setEditing({...editing, body: {...editing.body, fr: e.target.value}})}
                    className="w-full bg-stone-50 p-3 rounded-xl text-sm outline-none"
                  />
                </div>

                {/* CONTENT EN */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe size={14} className="text-stone-300"/> <span className="text-[10px] uppercase font-bold">English</span>
                  </div>
                  <input 
                    placeholder="Title EN" 
                    value={editing.title?.en || ''} 
                    onChange={e => setEditing({...editing, title: {...editing.title, en: e.target.value}})}
                    className="w-full text-xl font-display border-b py-2 outline-none focus:border-stone-900"
                  />
                  <textarea 
                    placeholder="Excerpt (EN)" 
                    rows={3}
                    value={editing.excerpt?.en || ''} 
                    onChange={e => setEditing({...editing, excerpt: {...editing.excerpt, en: e.target.value}})}
                    className="w-full bg-stone-50 p-3 rounded-xl text-sm outline-none"
                  />
                  <textarea 
                    placeholder="Body (EN)" 
                    rows={6}
                    value={editing.body?.en || ''} 
                    onChange={e => setEditing({...editing, body: {...editing.body, en: e.target.value}})}
                    className="w-full bg-stone-50 p-3 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              <div className="mt-10 pt-6 border-t flex justify-end gap-4">
                <button type="button" onClick={() => setEditing(null)} className="text-xs uppercase font-bold text-stone-400 hover:text-stone-900">Annuler</button>
                <button type="submit" className="bg-stone-900 text-white px-10 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-black transition-all">
                  {editing.id ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}