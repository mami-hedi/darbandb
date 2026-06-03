import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/admin/AdminLayout";

export function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminLayout>
        {children}
      </AdminLayout>
    </ProtectedRoute>
  );
}