import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { 
  LayoutDashboard, CalendarRange, Users, FileText, CalendarCheck, 
  Coins, LogOut, ShieldCheck, KeyRound, X, Eye, EyeOff, Tag, Menu, Bell // <--- Ajoutez Bell
} from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth";
import { cn } from "@/lib/utils";
// Ajouter après l'import de { cn }
import { useReservationNotifications } from "@/hooks/useReservationNotifications";
import { Toaster } from "sonner"; // Ajoutez cette ligne
import { NotificationPanel } from "@/components/NotificationPanel";
// --- Configuration ---
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
  { to: "/admin/promotions",   label: "Promotions",     icon: Tag },  // ← nouveau
];

// --- Composant : Modal Changement de mot de passe ---
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
    if (newPwd !== confirmPwd) return setErr("Les mots de passe ne correspondent pas.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/update-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(onClose, 1500);
      } else {
        const data = await res.json();
        setErr(data.message || "Erreur lors du changement.");
      }
    } catch { setErr("Erreur de connexion."); } finally { setLoading(false); }
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
              <input type={showCurrent ? "text" : "password"} placeholder="Actuel" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
              <input type={showNew ? "text" : "password"} placeholder="Nouveau" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
              <input type={showConfirm ? "text" : "password"} placeholder="Confirmer" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm" />
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

// --- Composant : Shell Principal ---
function Shell() {
  // 1. TOUS les hooks doivent être en haut, sans condition
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  // Appel du hook de notifications ici, tout en haut
  const { notifications, unreadCount, markAllRead } = useReservationNotifications();
const [showNotif, setShowNotif] = useState(false);
  
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = () => { logout(); navigate({ to: "/" }); setIsMenuOpen(false); };

  return (
    <div className={cn(
      "min-h-screen bg-secondary/30 flex",
      isLoginPage ? "items-center justify-center" : "flex-col md:flex-row"
    )}>
      {/* Toast container — notifications SSE */}
      <Toaster position="top-right" richColors closeButton />

      {showChangePwd && (
        <ChangePasswordModal onClose={() => setShowChangePwd(false)} />
      )}

      {!isLoginPage && (
        <>
          {/* Header Mobile */}
          <div className="md:hidden flex items-center justify-between bg-foreground text-background p-4 h-16 z-30">
              <button onClick={() => setIsMenuOpen(true)}><Menu className="h-6 w-6" /></button>
              <div className="font-display text-xl">B&B Admin</div>
              {/* Icône Notification Mobile */}
              <NotificationPanel
  notifications={notifications}
  unreadCount={unreadCount}
  markAllRead={markAllRead}
  open={showNotif}
  onToggle={() => setShowNotif(v => !v)}
  onClose={() => setShowNotif(false)}
/>
            </div>

          {/* Menu Mobile Overlay */}
          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[400] bg-foreground text-background p-6 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <span className="font-display text-xl">Menu</span>
                <button onClick={() => setIsMenuOpen(false)}><X size={32} /></button>
              </div>
              <nav className="flex-1 space-y-6">
                {nav.map(n => (
                  <Link key={n.to} to={n.to} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-4 text-xl">
                    <n.icon /> {n.label}
                  </Link>
                ))}
              </nav>
              <div className="border-t border-background/20 pt-6 space-y-4">
                <div className="text-center pt-2">
            <a 
              href="/" 
              className="text-xs text-muted-foreground  underline underline-offset-4 transition-colors"
            >
              Aller vers le site web
            </a>
          </div>
                <button onClick={() => { setShowChangePwd(true); setIsMenuOpen(false); }} className="flex items-center gap-4 text-lg"><KeyRound size={20} /> Mot de passe</button>
                <button onClick={handleLogout} className="flex items-center gap-4 text-lg text-red-400"><LogOut size={20} /> Déconnexion</button>
              </div>
            </div>
          )}

          {/* Sidebar Desktop */}
          <aside className="hidden md:flex w-64 flex-col bg-foreground text-background min-h-screen shrink-0">
            <div className="p-6 border-b border-background/10">
              <div className="font-display text-2xl">B&B</div>
              <div className="text-[0.65rem] tracking-[0.3em] uppercase opacity-60 mt-1">Espace Admin</div>
            </div>
            {/* Icône Notification Desktop */}
                <NotificationPanel
  notifications={notifications}
  unreadCount={unreadCount}
  markAllRead={markAllRead}
  open={showNotif}
  onToggle={() => setShowNotif(v => !v)}
  onClose={() => setShowNotif(false)}
/>
            <nav className="flex-1 p-4 space-y-1">
              {nav.map(n => (
                <Link key={n.to} to={n.to} className={cn("flex items-center gap-3 px-4 py-3 text-sm rounded-sm", pathname === n.to ? "bg-background/10" : "hover:bg-background/5")}>
                  <n.icon size={16} /> {n.label}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-background/10 space-y-2">
              <div className="text-center pt-2">
            <a 
              href="/" 
              className="text-xs text-muted-foreground  underline underline-offset-4 transition-colors"
            >
              Aller vers le site web
            </a>
          </div>
              <button onClick={() => setShowChangePwd(true)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-background/5"><KeyRound size={16} /> Mot de passe</button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-background text-foreground"><LogOut size={16} /> Déconnexion</button>
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