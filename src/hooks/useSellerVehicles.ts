// src/hooks/useSellerVehicles.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle, VehicleStatus } from "@/types";

type RawVehicle = Vehicle & {
  vehicle_images: any[];
  profiles: { username: string };
};

export function useSellerVehicles(status: VehicleStatus) {
  const [vehicles, setVehicles] = useState<RawVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);

    const { data, error: supError } = await supabase
      .from("vehicles")
      .select("*, vehicle_images(*), profiles:user_id(username)")
      .eq("status", status);

    if (supError) {
      setError(supError.message);
      setVehicles([]);
    } else {
      setVehicles((data as RawVehicle[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
  }, [status]);

  return { vehicles, loading, error, refetch: fetchVehicles };
}
