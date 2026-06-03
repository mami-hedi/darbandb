import { useAdminAuth } from "@/admin/AdminAuth";
import { Navigate, Outlet } from "@tanstack/react-router";

interface Props {
  children?: React.ReactNode;
}

export function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAdminAuth();
  
  if (!isAuthenticated) return <Navigate to="/admin/login" />;
  
  // Si children fournis, les rendre — sinon fallback sur Outlet
  return children ? <>{children}</> : <Outlet />;
}