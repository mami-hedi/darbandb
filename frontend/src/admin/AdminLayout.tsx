import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, CalendarRange, Users, FileText, CalendarCheck, LogOut, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import { AdminAuthProvider, useAdminAuth } from "./AdminAuth";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/reservations", label: "Réservations", icon: CalendarRange },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/availability", label: "Disponibilité", icon: CalendarCheck },
];

function Shell() {
  const { isAuthed, logout, email } = useAdminAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isAuthed && pathname !== "/admin/login") {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthed, pathname, navigate]);

  if (pathname === "/admin/login") return <Outlet />;
  if (!isAuthed) return null;

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      <aside className="hidden md:flex w-64 shrink-0 flex-col bg-foreground text-background">
        <div className="p-6 border-b border-background/10">
          <div className="font-display text-2xl">B&amp;B</div>
          <div className="text-[0.65rem] tracking-[0.3em] uppercase opacity-60 mt-1">Admin · Hammamet</div>
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
          <div className="px-4 text-[0.65rem] uppercase tracking-wider opacity-60 truncate">{email}</div>
          <button
            onClick={() => { logout(); navigate({ to: "/admin/login" }); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm bg-background text-foreground hover:opacity-90 transition rounded-sm"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between bg-foreground text-background p-4">
          <div className="font-display text-xl">B&amp;B Admin</div>
          <button onClick={() => { logout(); navigate({ to: "/admin/login" }); }} className="text-xs flex items-center gap-2"><LogOut className="h-4 w-4" /> Sortir</button>
        </div>
        <div className="md:hidden flex overflow-x-auto bg-foreground text-background border-t border-background/10">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex-shrink-0 px-4 py-3 text-xs", active ? "bg-background/10" : "opacity-70")}>{n.label}</Link>
            );
          })}
        </div>
        <main className="p-6 md:p-10 max-w-7xl">
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
