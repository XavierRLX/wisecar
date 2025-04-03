// hooks/useIsSeller.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function useIsSeller() {
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkSeller() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_seller")
          .eq("id", user.id)
          .single();
        if (error || !profile || !profile.is_seller) {
          setIsSeller(false);
        } else {
          setIsSeller(true);
        }
      } catch (err: any) {
        console.error("Erro ao verificar se é vendedor:", err.message);
        setIsSeller(false);
      }
    }
    checkSeller();
  }, [router]);

  return isSeller;
}
