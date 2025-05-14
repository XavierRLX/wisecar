"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserId(user?.id ?? null);
      } catch (err) {
        console.error("Erro ao obter usuário:", err);
        setUserId(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { userId, loading };
}
