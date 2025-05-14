"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useFavorites(userId: string | null) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("vehicle_id")
      .eq("user_id", userId);
    if (!error && data) {
      setFavorites(data.map((f) => f.vehicle_id));
    }
    setLoading(false);
  }, [userId]);

  const toggle = useCallback(
    async (vehicleId: string) => {
      if (!userId) return;
      const isFav = favorites.includes(vehicleId);
      if (!isFav) {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: userId, vehicle_id: vehicleId });
        if (!error) setFavorites((prev) => [...prev, vehicleId]);
      } else {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("vehicle_id", vehicleId);
        if (!error) setFavorites((prev) => prev.filter((id) => id !== vehicleId));
      }
    },
    [userId, favorites]
  );

  useEffect(() => {
    load();
  }, [load]);

  return { favorites, loading, toggle, refetch: load };
}
