import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, CalendarRange, Users, FileText, CalendarCheck, 
  Coins, LogOut, ShieldCheck, KeyRound, X, Tag, Menu
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth";
import { cn } from "@/lib/utils";
import { useReservationNotifications } from "@/hooks/useReservationNotifications";
import { Toaster } from "sonner";
import { NotificationPanel } from "@/components/NotificationPanel";

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const nav: NavItem[] = [
  { to: "/admin",              label: "Dashboard",      icon: LayoutDashboard, exact: true },
  { to: "/admin/reservations", label: "Réservations",   icon: CalendarRange },
  { to: "/admin/clients",      label: "Clients",        icon: Users },
  { to: "/admin/tarifs",       label: "Tarifs",         icon: Coins },
  { to: "/admin/check-house",  label: "Vérifier État",  icon: ShieldCheck },
  { to: "/admin/blog",         label: "Blog",           icon: FileText },
  { to: "/admin/availability", label: "Disponibilité",  icon: CalendarCheck },
  { to: "/admin/promotions",   label: "Promotions",     icon: Tag },
];

// ─── Modal mot de passe ───────────────────────────────────────

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd]         = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading]       = useState(false);
  const [err, setErr]               = useState("");
  const [success, setSuccess]       = useState(false);

  const handleSubmit = async () => {
    if (newPwd !== confirmPwd) return setErr("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (res.ok) { setSuccess(true); setTimeout(onClose, 1500); }
      else { const d = await res.json(); setErr(d.message || "Erreur."); }
    } catch { setErr("Erreur de connexion."); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-sm font-bold uppercase">Modifier mot de passe</h2>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {success ? (
            <p className="text-center text-emerald-600 font-semibold text-sm">✓ Succès !</p>
          ) : (
            <>
              <input type="password" placeholder="Actuel"    value={currentPwd}  onChange={e => setCurrentPwd(e.target.value)}  className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="password" placeholder="Nouveau"   value={newPwd}       onChange={e => setNewPwd(e.target.value)}       className="w-full border rounded-lg p-2.5 text-sm" />
              <input type="password" placeholder="Confirmer" value={confirmPwd}   onChange={e => setConfirmPwd(e.target.value)}   className="w-full border rounded-lg p-2.5 text-sm" />
              {err && <p className="text-xs text-red-500">{err}</p>}
              <button onClick={handleSubmit} disabled={loading} className="w-full py-2.5 bg-stone-900 text-white rounded-lg font-bold">
                {loading ? "..." : "Enregistrer"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shell ────────────────────────────────────────────────────

function Shell() {
  const { logout }       = useAdminAuth();
  const navigate         = useNavigate();
  const { pathname }     = useLocation();
  const { notifications, unreadCount, markAllRead } = useReservationNotifications();

  const [showNotif,     setShowNotif]     = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [isMenuOpen,    setIsMenuOpen]    = useState(false);

  const isLoginPage = pathname === "/admin/login";
  const handleLogout = () => { logout(); navigate({ to: "/" }); setIsMenuOpen(false); };

  return (
    <div className={cn(
      "min-h-screen bg-secondary/30 flex",
      isLoginPage ? "items-center justify-center" : "flex-col md:flex-row"
    )}>
      <Toaster position="top-right" richColors closeButton />

      {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}

      {!isLoginPage && (
        <>
          {/* ── Header mobile — fond noir, notification à droite ── */}
          <div className="md:hidden flex items-center justify-between bg-neutral-950 text-white px-4 h-14 z-30 border-b border-neutral-800">
            {/* Gauche : burger */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Centre : logo */}
            <span className="font-display text-lg tracking-widest">B&B Admin</span>

            {/* Droite : notification */}
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              markAllRead={markAllRead}
              open={showNotif}
              onToggle={() => setShowNotif(v => !v)}
              onClose={() => setShowNotif(false)}
            />
          </div>

          {/* ── Menu mobile overlay ── */}
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[400] bg-neutral-950 text-white p-6 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <span className="font-display text-xl tracking-widest">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 space-y-1">
                {nav.map(n => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-lg text-base transition-colors",
                      pathname === n.to
                        ? "bg-white/10 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <n.icon size={18} /> {n.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-white/10 pt-6 space-y-2">
                <a href="/" className="block text-center text-xs text-white/40 hover:text-white/70 underline underline-offset-4 transition-colors pb-2">
                  Aller vers le site web
                </a>
                <button
                  onClick={() => { setShowChangePwd(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <KeyRound size={16} /> Mot de passe
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} /> Déconnexion
                </button>
              </div>
            </div>
          )}

          {/* ── Sidebar desktop — notification en haut à droite du header ── */}
          <aside className="hidden md:flex w-64 flex-col bg-neutral-950 text-white min-h-screen shrink-0 border-r border-neutral-800">

            {/* Brand + notification côte à côte */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <div className="font-display text-2xl tracking-wider">B&B</div>
                <div className="text-[0.6rem] tracking-[0.3em] uppercase text-white/40 mt-0.5">Espace Admin</div>
              </div>
              {/* Notification — alignée à droite dans le header du sidebar */}
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                markAllRead={markAllRead}
                open={showNotif}
                onToggle={() => setShowNotif(v => !v)}
                onClose={() => setShowNotif(false)}
              />
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-0.5">
              {nav.map(n => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors",
                    pathname === n.to
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <n.icon size={16} /> {n.label}
                </Link>
              ))}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 space-y-1">
              <a href="/" className="block text-center text-xs text-white/30 hover:text-white/60 underline underline-offset-4 transition-colors py-2">
                Aller vers le site web
              </a>
              <button
                onClick={() => setShowChangePwd(true)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <KeyRound size={16} /> Mot de passe
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="flex-1 overflow-auto p-4 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return <AdminAuthProvider><Shell /></AdminAuthProvider>;
}