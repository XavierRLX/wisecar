// hooks/useUserProfile.ts
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  id: string;
  is_admin: boolean;
  is_provider: boolean;
  is_seller: boolean;
  // adicione outros campos que precisar
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("is_admin,is_provider,is_seller")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile({ id: user.id, ...data });
      }
      setLoading(false);
    })();
  }, []);

  return { profile, loading };
}
