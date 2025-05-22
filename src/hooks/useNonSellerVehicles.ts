// src/hooks/useNonSellerVehicles.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

type RawVehicle = Vehicle & {
  vehicle_images: any[];
  profiles: { is_seller: boolean; username: string };
};

export function useNonSellerVehicles() {
  const [vehicles, setVehicles] = useState<RawVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchVehicles() {
    setLoading(true);
    setError(null);

    // 1) busca só anúncios e já puxa o username do dono
    const { data, error: supError } = await supabase
      .from("vehicles")
      .select("*, vehicle_images(*), profiles:user_id(is_seller, username)")
      .eq("is_for_sale", true);

    if (supError) {
      setError(supError.message);
      setVehicles([]);
      setLoading(false);
      return;
    }

    // 2) filtra só perfis não‐vendedores
    const raw = (data as RawVehicle[]) || [];
    const filtered = raw.filter((v) => v.profiles.is_seller === false);

    setVehicles(filtered);
    setLoading(false);
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
