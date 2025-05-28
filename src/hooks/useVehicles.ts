"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export type VehicleMode =
  | "all"     // desejos + garagem
  | "desire"  // apenas desejos
  | "garage"; // apenas garagem

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

    let query = supabase.from("vehicles").select("*, vehicle_images(*)");

    if (mode === "desire") {
      query = query.eq("user_id", user.id).eq("is_wishlist", true);
    } else if (mode === "garage") {
      query = query.eq("owner_id", user.id);
    } else {
      // all: desejos + garagem
      query = query.or(
        `and(user_id.eq.${user.id},is_wishlist.eq.true),owner_id.eq.${user.id}`
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
