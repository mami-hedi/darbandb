import React, { useState, useEffect, useRef } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Pencil, Trash2, Plus, X, Globe, Upload, Eye, EyeOff, Search, FileText } from 'lucide-react';

// --- CONFIGURATION DE LA ROUTE ---
export const Route = createFileRoute('/admin/blog')({
  component: AdminBlog,
});

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE}/blog`;

// Préfixe l'URL du backend pour les chemins relatifs /assets/...
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob')) return path;
  return `${API_BASE.replace('/api', '')}${path}`;
};

const INITIAL_STATE = {
  slug: '',
  cover: '',
  coverFile: null as File | null,
  coverPreview: '',
  status: 'published',
  title: { fr: '', en: '' },
  excerpt: { fr: '', en: '' },
  body: { fr: '', en: '' },
  category: { fr: 'Inspiration', en: 'Inspiration' },
  metaTitle: { fr: '', en: '' },
  metaDescription: { fr: '', en: '' },
  imageAlt: { fr: '', en: '' },
};

type PostState = typeof INITIAL_STATE & { id?: number };

// Onglets de la modale
type Tab = 'settings' | 'fr' | 'en' | 'seo';

function AdminBlog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<PostState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();

      const cleanedPosts = (Array.isArray(data) ? data : []).map((post) => ({
        ...post,
        title: typeof post.title === 'string' ? JSON.parse(post.title) : post.title,
        excerpt: typeof post.excerpt === 'string' ? JSON.parse(post.excerpt) : post.excerpt,
        body: typeof post.body === 'string' ? JSON.parse(post.body) : post.body,
        metaTitle: typeof post.metaTitle === 'string' ? JSON.parse(post.metaTitle) : (post.metaTitle || { fr: '', en: '' }),
        metaDescription: typeof post.metaDescription === 'string' ? JSON.parse(post.metaDescription) : (post.metaDescription || { fr: '', en: '' }),
        imageAlt: typeof post.imageAlt === 'string' ? JSON.parse(post.imageAlt) : (post.imageAlt || { fr: '', en: '' }),
      }));

      setPosts(cleanedPosts);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'upload d'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Prévisualisation locale
    const previewUrl = URL.createObjectURL(file);
    setEditing((prev) =>
      prev ? { ...prev, coverFile: file, coverPreview: previewUrl } : prev
    );
  };

  // Upload de l'image vers le serveur → assets/blogImages
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/blog/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error("Échec de l'upload de l'image");
    const data = await res.json();
    // Le serveur retourne le chemin relatif, ex: "/assets/blogImages/mon-image.webp"
    return data.path;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;

    const isInvalid =
      !editing.slug?.trim() ||
      (!editing.cover?.trim() && !editing.coverFile) ||
      !editing.title?.fr?.trim();

    if (isInvalid) {
      alert("Erreur : Le slug, l'image et le titre (FR) sont obligatoires.");
      return;
    }

    setSaving(true);
    try {
      let coverPath = editing.cover;

      // Upload de la nouvelle image si sélectionnée
      if (editing.coverFile) {
        coverPath = await uploadImage(editing.coverFile);
      }

      const payload = {
        slug: editing.slug,
        cover: coverPath,
        status: editing.status,
        title: editing.title,
        excerpt: editing.excerpt,
        body: editing.body,
        category: editing.category,
        metaTitle: editing.metaTitle,
        metaDescription: editing.metaDescription,
        imageAlt: editing.imageAlt,
      };

      const isUpdate = !!editing.id;
      const url = isUpdate ? `${API_URL}/${editing.id}` : API_URL;
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setEditing(null);
        fetchPosts();
      } else {
        const error = await res.json();
        alert(`Erreur serveur : ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Supprimer cet article ?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchPosts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditor = (post?: any) => {
    const base = post
      ? {
          ...INITIAL_STATE,
          ...post,
          coverPreview: post.cover || '',
          coverFile: null,
        }
      : { ...INITIAL_STATE };
    setEditing(base);
    setActiveTab('settings');
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title?.fr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon?: React.ReactNode }[] = [
    { id: 'settings', label: 'Paramètres', icon: <FileText size={14} /> },
    { id: 'fr', label: 'Français', icon: <span className="text-xs">🇫🇷</span> },
    { id: 'en', label: 'English', icon: <span className="text-xs">🇬🇧</span> },
    { id: 'seo', label: 'SEO & Meta', icon: <Globe size={14} /> },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm tracking-widest uppercase animate-pulse">
          Chargement...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* ── HEADER ── */}
      <div className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 font-bold mb-1">
              — Admin Panel
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Journal Dar B&B
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Recherche */}
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-9 pr-4 py-2.5 bg-stone-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all text-xs font-bold uppercase tracking-widest whitespace-nowrap"
            >
              <Plus size={16} /> Nouveau
            </button>
          </div>
        </div>
      </div>

      {/* ── LISTE ── */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-3">
        {filteredPosts.length === 0 && (
          <div className="text-center py-20 text-stone-400 text-sm">
            {searchQuery ? 'Aucun résultat.' : 'Aucun article. Créez-en un !'}
          </div>
        )}
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4 min-w-0">
              {post.cover ? (
                <img
                  src={getImageUrl(post.cover)}
                  className="w-14 h-14 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                  alt={post.imageAlt?.fr || ''}
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                  <Upload size={18} className="text-stone-400" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-base truncate">
                    {post.title?.fr || 'Sans titre'}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ${
                      post.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {post.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-mono truncate">
                  /{post.slug}
                </p>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-4">
              <button
                onClick={() => openEditor(post)}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-900 transition-colors"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="p-2 hover:bg-red-50 rounded-xl text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── MODALE D'ÉDITION ── */}
      {editing && (
        <div className="fixed inset-0 z-[100] bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header modale */}
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between flex-shrink-0">
              <h2 className="font-bold text-lg">
  {editing.id ? "Modifier l'article" : 'Nouvel article'}
</h2>
              <button
                onClick={() => setEditing(null)}
                className="p-2 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Onglets */}
            <div className="flex border-b border-stone-100 flex-shrink-0 px-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-stone-900 text-stone-900'
                      : 'border-transparent text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Corps de la modale */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-5">

                {/* ── ONGLET PARAMÈTRES ── */}
                {activeTab === 'settings' && (
                  <div className="space-y-5">
                    {/* Upload image */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">
                        Image de couverture *
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${
                          editing.coverPreview
                            ? 'border-stone-300'
                            : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        {editing.coverPreview ? (
                          <div className="relative group">
                            <img
                              src={getImageUrl(editing.coverPreview)}
                              alt="Aperçu"
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-white text-center">
                                <Upload size={24} className="mx-auto mb-2" />
                                <p className="text-xs font-bold">
                                  Changer l'image
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-40 flex flex-col items-center justify-center gap-3 text-stone-400">
                            <Upload size={28} />
                            <div className="text-center">
                              <p className="text-sm font-semibold">
                                Cliquez pour importer
                              </p>
                              <p className="text-xs mt-1">
                                PNG, JPG, WebP — sera sauvegardé dans{' '}
                                <code className="font-mono">
                                  assets/blogImages/
                                </code>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      {editing.coverFile && (
                        <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                          ✓ {editing.coverFile.name}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Slug */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                          Slug (URL) *
                        </label>
                        <input
                          value={editing.slug || ''}
                          onChange={(e) =>
                            setEditing({ ...editing, slug: e.target.value })
                          }
                          placeholder="mon-article"
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 font-mono"
                        />
                      </div>

                      {/* Statut */}
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                          Statut
                        </label>
                        <select
                          value={editing.status || 'published'}
                          onChange={(e) =>
                            setEditing({ ...editing, status: e.target.value })
                          }
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                        >
                          <option value="draft">🟡 Brouillon</option>
                          <option value="published">🟢 Publié</option>
                        </select>
                      </div>
                    </div>

                    {/* Catégorie */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                          Catégorie (FR)
                        </label>
                        <input
                          value={editing.category?.fr || ''}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              category: { ...editing.category, fr: e.target.value },
                            })
                          }
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                          Category (EN)
                        </label>
                        <input
                          value={editing.category?.en || ''}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              category: { ...editing.category, en: e.target.value },
                            })
                          }
                          className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ONGLET FRANÇAIS ── */}
                {activeTab === 'fr' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <span>🇫🇷</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Contenu en Français
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Titre *
                      </label>
                      <input
                        placeholder="Titre de l'article"
                        value={editing.title?.fr || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            title: { ...editing.title, fr: e.target.value },
                          })
                        }
                        className="w-full text-lg font-bold border border-stone-200 bg-stone-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Résumé (extrait)
                      </label>
                      <textarea
                        placeholder="Court résumé affiché dans la liste..."
                        rows={3}
                        value={editing.excerpt?.fr || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            excerpt: { ...editing.excerpt, fr: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Contenu complet
                      </label>
                      <textarea
                        placeholder="Contenu de l'article en français..."
                        rows={10}
                        value={editing.body?.fr || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            body: { ...editing.body, fr: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* ── ONGLET ENGLISH ── */}
                {activeTab === 'en' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <span>🇬🇧</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        English Content
                      </span>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Title
                      </label>
                      <input
                        placeholder="Article title"
                        value={editing.title?.en || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            title: { ...editing.title, en: e.target.value },
                          })
                        }
                        className="w-full text-lg font-bold border border-stone-200 bg-stone-50 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Excerpt
                      </label>
                      <textarea
                        placeholder="Short summary displayed in the list..."
                        rows={3}
                        value={editing.excerpt?.en || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            excerpt: { ...editing.excerpt, en: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1.5">
                        Full Body
                      </label>
                      <textarea
                        placeholder="Full article content in English..."
                        rows={10}
                        value={editing.body?.en || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            body: { ...editing.body, en: e.target.value },
                          })
                        }
                        className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-y"
                      />
                    </div>
                  </div>
                )}

                {/* ── ONGLET SEO ── */}
                {activeTab === 'seo' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                      <Globe size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        SEO & Métadonnées
                      </span>
                    </div>

                    {/* Alt image */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-stone-400 mb-2">
                        Texte alternatif de l'image (alt)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇫🇷 FR
                          </label>
                          <input
                            placeholder="Description de l'image..."
                            value={editing.imageAlt?.fr || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                imageAlt: { ...editing.imageAlt, fr: e.target.value },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇬🇧 EN
                          </label>
                          <input
                            placeholder="Image description..."
                            value={editing.imageAlt?.en || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                imageAlt: { ...editing.imageAlt, en: e.target.value },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] uppercase font-bold text-stone-400">
                          Meta Title
                        </label>
                        <span className="text-[10px] text-stone-400">
                          Recommandé : 50–60 caractères
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇫🇷 FR{' '}
                            <span
                              className={`ml-1 font-bold ${
                                (editing.metaTitle?.fr?.length || 0) > 60
                                  ? 'text-red-500'
                                  : 'text-stone-400'
                              }`}
                            >
                              ({editing.metaTitle?.fr?.length || 0}/60)
                            </span>
                          </label>
                          <input
                            placeholder="Titre optimisé pour les moteurs de recherche..."
                            value={editing.metaTitle?.fr || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                metaTitle: { ...editing.metaTitle, fr: e.target.value },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇬🇧 EN{' '}
                            <span
                              className={`ml-1 font-bold ${
                                (editing.metaTitle?.en?.length || 0) > 60
                                  ? 'text-red-500'
                                  : 'text-stone-400'
                              }`}
                            >
                              ({editing.metaTitle?.en?.length || 0}/60)
                            </span>
                          </label>
                          <input
                            placeholder="SEO-optimized title..."
                            value={editing.metaTitle?.en || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                metaTitle: { ...editing.metaTitle, en: e.target.value },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] uppercase font-bold text-stone-400">
                          Meta Description
                        </label>
                        <span className="text-[10px] text-stone-400">
                          Recommandé : 150–160 caractères
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇫🇷 FR{' '}
                            <span
                              className={`ml-1 font-bold ${
                                (editing.metaDescription?.fr?.length || 0) > 160
                                  ? 'text-red-500'
                                  : 'text-stone-400'
                              }`}
                            >
                              ({editing.metaDescription?.fr?.length || 0}/160)
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Description affichée dans les résultats Google..."
                            value={editing.metaDescription?.fr || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                metaDescription: {
                                  ...editing.metaDescription,
                                  fr: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-stone-400 mb-1">
                            🇬🇧 EN{' '}
                            <span
                              className={`ml-1 font-bold ${
                                (editing.metaDescription?.en?.length || 0) > 160
                                  ? 'text-red-500'
                                  : 'text-stone-400'
                              }`}
                            >
                              ({editing.metaDescription?.en?.length || 0}/160)
                            </span>
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Description displayed in Google results..."
                            value={editing.metaDescription?.en || ''}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                metaDescription: {
                                  ...editing.metaDescription,
                                  en: e.target.value,
                                },
                              })
                            }
                            className="w-full bg-stone-50 border border-stone-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-300 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Aperçu Google */}
                    {(editing.metaTitle?.fr || editing.metaDescription?.fr) && (
                      <div className="mt-2 p-4 bg-white border border-stone-200 rounded-2xl">
                        <p className="text-[10px] uppercase font-bold text-stone-400 mb-3">
                          Aperçu Google (FR)
                        </p>
                        <p className="text-blue-600 text-base font-medium leading-tight truncate">
                          {editing.metaTitle?.fr || editing.title?.fr || 'Titre'}
                        </p>
                        <p className="text-green-700 text-xs mt-0.5">
                          darbnb.com/{editing.slug || 'blog/article'}
                        </p>
                        <p className="text-stone-600 text-sm mt-1 line-clamp-2">
                          {editing.metaDescription?.fr || 'Description...'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer modale */}
              <div className="sticky bottom-0 bg-white border-t border-stone-100 px-6 py-4 flex justify-between items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-xs uppercase font-bold text-stone-400 hover:text-stone-900 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-stone-900 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
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