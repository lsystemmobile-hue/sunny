import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // 1. Set up the listener FIRST (sync only inside this callback)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession?.user) {
        // Defer the role check so we don't deadlock the auth client
        setTimeout(() => {
          checkAdmin(newSession.user.id).then((v) => active && setIsAdmin(v));
        }, 0);
      } else {
        setIsAdmin(false);
      }
    });

    // 2. Then fetch the existing session
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session?.user) {
        checkAdmin(data.session.user.id).then((v) => {
          if (!active) return;
          setIsAdmin(v);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, isAdmin, loading };
}

async function checkAdmin(userId: string): Promise<boolean> {
  try {
    // Timeout de 8s para não travar caso o banco esteja pausado/indisponível
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), 8000)
    );

    const queryPromise = supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    const { data, error } = await Promise.race([
      queryPromise,
      timeoutPromise.then(() => ({ data: null, error: new Error("timeout") })),
    ]);

    if (error) {
      // 503 ou timeout = banco indisponível, não bloqueia o usuário
      console.warn("Admin check unavailable:", (error as Error).message ?? error);
      return false;
    }
    return !!data;
  } catch (e) {
    console.warn("Admin check failed:", e);
    return false;
  }
}