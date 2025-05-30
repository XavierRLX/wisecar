"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export type VehicleMode =
  | "all"     // Desejo + Garagem + À Venda
  | "desire"  // Apenas Desejo
  | "garage"; // Garagem + À Venda

export function useVehicles(mode: VehicleMode = "desire") {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchVehicles() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setVehicles([]);
      setLoading(false);
      return;
    }

    let query = supabase
      .from("vehicles")
      .select("*, vehicle_images(*)");

    if (mode === "desire") {
      // só lista de desejo
      query = query
        .eq("user_id", user.id)
        .eq("status", "WISHLIST");
    } else if (mode === "garage") {
      query = query
        .eq("owner_id", user.id)
        .in("status", ["GARAGE", "FOR_SALE"]);
    } else {
      query = query.or(
        `and(user_id.eq.${user.id},status.eq.WISHLIST),` +
        `and(owner_id.eq.${user.id},status.in.(GARAGE,FOR_SALE))`
      );
    }

    const { data, error: supError } = await query;
    if (supError) {
      setError(supError.message);
      setVehicles([]);
    } else {
      setVehicles(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchVehicles();
  }, [mode]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
