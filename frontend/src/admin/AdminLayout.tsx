import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  FileText, 
  CalendarCheck, 
  Coins, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  KeyRound,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/reservations", label: "Réservations", icon: CalendarRange },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/tarifs", label: "Tarifs", icon: Coins },
  { to: "/admin/check-house", label: "Vérifier État", icon: ShieldCheck },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/availability", label: "Disponibilité", icon: CalendarCheck },
];

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setErr("");
    if (!currentPwd || !newPwd || !confirmPwd) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }
    if (newPwd.length < 8) {
      setErr("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      } else {
        setErr(data.message || "Erreur lors du changement.");
      }
    } catch {
      setErr("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <KeyRound size={16} className="text-stone-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Modifier le mot de passe</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-4">
              <p className="text-emerald-600 font-semibold text-sm">✓ Mot de passe modifié avec succès !</p>
            </div>
          ) : (
            <>
              {/* Mot de passe actuel */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Mot de passe actuel</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirmer */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    className="w-full border border-stone-200 rounded-lg px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-300"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {err && <p className="text-xs text-red-500 font-medium">{err}</p>}

              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-2.5 text-sm text-stone-500 bg-stone-100 hover:bg-stone-200 rounded-lg transition font-medium">
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-stone-900 hover:bg-stone-700 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? "..." : "Enregistrer"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Shell() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [showChangePwd, setShowChangePwd] = useState(false);
  
  const isLoginPage = pathname === "/admin/login";
  
  return (
    <div className={cn("min-h-screen bg-secondary/30 flex", isLoginPage && "items-center justify-center")}>
      
      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {!isLoginPage && (
        <aside className="hidden md:flex w-64 shrink-0 flex-col bg-foreground text-background">
          <div className="p-6 border-b border-background/10">
            <div className="font-display text-2xl">B&amp;B</div>
            <div className="text-[0.65rem] tracking-[0.3em] uppercase opacity-60 mt-1">Espace - Admin</div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {nav.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-sm",
                    active ? "bg-background/10 text-background" : "text-background/70 hover:bg-background/5"
                  )}
                >
                  <n.icon className="h-4 w-4" /> {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-background/10 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-2 text-xs text-background/70 hover:text-background">
              <ExternalLink className="h-3.5 w-3.5" /> Voir le site
            </Link>
            <div className="px-4 text-[0.65rem] uppercase tracking-wider opacity-60 truncate">
              experience@bnb-villa.com
            </div>
            {/* ── Modifier mot de passe ── */}
            <button
              onClick={() => setShowChangePwd(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-background/70 hover:text-background hover:bg-background/5 transition rounded-sm"
            >
              <KeyRound className="h-4 w-4" /> Modifier mot de passe
            </button>
            <button
              onClick={() => { logout(); navigate({ to: "/" }); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-background text-foreground hover:opacity-90 transition rounded-sm"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 min-w-0">
        {!isLoginPage && (
          <div className="md:hidden flex items-center justify-between bg-foreground text-background p-4">
            <div className="font-display text-xl">B&amp;B Admin</div>
            <button onClick={() => { logout(); navigate({ to: "/" }); }} className="text-xs flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Sortir
            </button>
          </div>
        )}
        
        <main className={cn("p-6 md:p-10", !isLoginPage && "max-w-7xl")}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminAuthProvider>
      <Shell />
    </AdminAuthProvider>
  );
}