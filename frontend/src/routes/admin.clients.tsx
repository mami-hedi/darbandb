import { createFileRoute } from "@tanstack/react-router";
import { clients } from "@/admin/mockData";

export const Route = createFileRoute("/admin/clients")({
  component: ClientsPage,
});

function ClientsPage() {
  return (
    <div className="space-y-8">
      <div>
        <div className="eyebrow">— Carnet</div>
        <h1 className="font-display text-4xl mt-2">Clients</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((c) => (
          <div key={c.id} className="bg-background border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center font-display text-lg">
                {c.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
              </div>
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.country}</div>
              </div>
            </div>
            <div className="mt-5 space-y-1 text-sm text-muted-foreground">
              <div>{c.email}</div>
              <div>{c.phone}</div>
            </div>
            <div className="hairline mt-5 pt-4 flex justify-between text-xs">
              <span>{c.stays} séjours</span>
              <span className="font-medium text-foreground">{c.totalSpent.toLocaleString("fr-FR")} €</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
