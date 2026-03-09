import { useState, useEffect } from "react";
import supabase from "../lib/supabase";

export function useAuth() {
  const [user, setUser]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      } else if (event === "SIGNED_OUT") {
        setIsRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, isRecovery };
}