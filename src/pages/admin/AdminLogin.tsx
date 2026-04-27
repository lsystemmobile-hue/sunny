import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [loading, session, isAdmin, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Login realizado!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
        });
        if (error) throw error;
        toast.success("Conta criada! Solicite ao administrador para liberar seu acesso.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro inesperado";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero">
      <div className="w-full max-w-md glass-card p-8 md:p-10 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-8">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow mb-4">
            <Sun className="w-7 h-7" strokeWidth={2.5} />
          </span>
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grupo Sunny Energia
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-glow transition-all disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button
            type="button"
            onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
            className="text-primary hover:underline font-medium"
          >
            {mode === "login" ? "Criar conta" : "Fazer login"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;