import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminLayout } from "@/admin/AdminLayout";
// Vous pouvez commenter ces imports s'ils ne servent plus du tout
// import { useAdminAuth } from "@/admin/AdminAuth"; 
// import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  ssr: false, 

  // beforeLoad est vidé pour supprimer la redirection vers /admin/login
  beforeLoad: () => {
    // Plus de vérification de token ni de redirection ici
  },
  component: AdminGuard,
});

function AdminGuard() {
  // On ignore temporairement le chargement et l'authentification
  // const { isAuthenticated, isLoading } = useAdminAuth();

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}