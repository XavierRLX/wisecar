// hooks/useCurrentUser.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCurrentUser() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
      setLoading(false);
    });
  }, []);

  return { userId, loading };
}