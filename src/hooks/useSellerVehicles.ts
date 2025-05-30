// src/hooks/useSellerVehicles.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle, VehicleStatus } from "@/types";

export type SellerFilter = "ALL" | VehicleStatus;

type RawVehicle = Vehicle & {
  vehicle_images: any[];
  profiles: { username: string };
};

export function useSellerVehicles(status: SellerFilter) {
  const [vehicles, setVehicles] = useState<RawVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from("vehicles")
      .select("*, vehicle_images(*), profiles:user_id(username)");

    if (status === "ALL") {
      // traz wishlist e à venda (com owner_id não-nulo em FOR_SALE)
      query = query
        .in("status", ["WISHLIST", "FOR_SALE"])
        .not("owner_id", "is", null);
    } else if (status === "FOR_SALE") {
      query = query
        .eq("status", "FOR_SALE")
        .not("owner_id", "is", null);
    } else {
      // WISHLIST
      query = query.eq("status", "WISHLIST");
    }

    const { data, error: supError } = await query;

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
