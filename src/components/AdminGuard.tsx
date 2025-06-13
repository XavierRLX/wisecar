// components/AdminGuard.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "./LoadingState";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // não logado → login
        router.push("/login");
        return;
      }

      // busca o campo is_admin
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error || !profile?.is_admin) {
        router.push("/login");
      } else {
        setIsAdmin(true);
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <LoadingState message="Verificando permissão…" />;
  if (!isAdmin) return null; // redirecionando, não renderiza children

  return <>{children}</>;
}
