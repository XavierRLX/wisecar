// hooks/useUserVehicles.ts
"use client";
import { useState, useEffect } from "react";
import { fetchVehiclesByUserId } from "@/lib/vehicleService";
import type { Vehicle } from "@/types";

export function useUserVehicles(userId: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchVehiclesByUserId(userId)
      .then(setVehicles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);
  return { vehicles, loading, error };
}
