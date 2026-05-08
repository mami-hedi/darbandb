import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminAuth } from "@/admin/AdminAuth";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@bnb-hammamet.tn");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (login(email, pwd)) navigate({ to: "/admin" });
          else setErr("Identifiants invalides (mot de passe ≥ 4 caractères)");
        }}
        className="w-full max-w-md bg-background border border-border p-10"
      >
        <div className="font-display text-3xl">B&amp;B Admin</div>
        <p className="text-sm text-muted-foreground mt-2">Espace de gestion · Hammamet</p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-2 w-full bg-transparent border border-border focus:border-foreground px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">Mot de passe</span>
            <input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" className="mt-2 w-full bg-transparent border border-border focus:border-foreground px-4 py-3 text-sm outline-none" />
          </label>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button type="submit" className="w-full bg-foreground text-background py-3.5 text-xs tracking-[0.25em] uppercase hover:opacity-90">
            Se connecter
          </button>
          <p className="text-xs text-muted-foreground text-center">Démo : tout email + mot de passe ≥ 4 caractères</p>
        </div>
      </form>
    </div>
  );
}
