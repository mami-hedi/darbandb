import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AdminLayout } from "@/admin/AdminLayout";
import { useAdminAuth } from "@/admin/AdminAuth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminGuard,
});

function AdminGuard() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const routerState = useRouterState();
  
  // Si on est sur /admin/login, on rend juste l'Outlet sans protection
  const isLoginPage = routerState.location.pathname === '/admin/login';
  
  if (isLoginPage) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-stone-400" size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.replace('/admin/login');
    return null;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}