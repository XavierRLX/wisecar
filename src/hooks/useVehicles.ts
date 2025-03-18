"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicles() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id);
        if (error) {
          setError(error.message);
        } else {
          setVehicles(data || []);
        }
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  return { vehicles, loading, error };
}
