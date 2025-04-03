// hooks/useNonSellerVehicles.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export function useNonSellerVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchVehicles() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, vehicle_images(*), profiles(is_seller, username), favorites(*)")
        .eq("profiles.is_seller", false);
      if (error) {
        setError(error.message);
      } else {
        setVehicles(data || []);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchVehicles();
  }, []);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
