import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminAuth } from "@/admin/AdminAuth";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: Login,
});

const API_BASE = (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

function Login() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("experience@bnb-villa.com");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password: pwd }),
      });
      if (response.ok) {
        login();
        navigate({ to: "/admin" });
      } else {
        const data = await response.json();
        setErr(data.message || "Email ou mot de passe incorrect.");
      }
    } catch (error) {
      setErr("Erreur lors de la connexion au serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/40 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-background border border-border p-10 rounded-lg shadow-sm"
      >
        <div className="font-display text-3xl font-bold">B&amp;B Admin</div>
        <p className="text-sm text-muted-foreground mt-2">Espace de gestion · Hammamet</p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="mt-2 w-full bg-transparent border border-border focus:border-foreground px-4 py-3 text-sm outline-none transition-colors"
            />
          </label>

          <label className="block">
            <span className="text-[0.7rem] tracking-[0.25em] uppercase text-muted-foreground">Mot de passe</span>
            <div className="relative mt-2">
              <input
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                type={showPwd ? "text" : "password"}
                required
                className="w-full bg-transparent border border-border focus:border-foreground px-4 py-3 pr-12 text-sm outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          {err && <p className="text-xs text-red-500 font-medium">{err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-foreground text-background py-3.5 text-xs tracking-[0.25em] uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Accès réservé à l'administrateur
          </p>
        </div>
      </form>
    </div>
  );
}