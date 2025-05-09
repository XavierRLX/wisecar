// src/hooks/useVehicles.ts
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export type VehicleMode = 
  | "all"     // todos os veículos (desejados + garagem)
  | "desire"  // itens que o usuário adicionou como “desejados” (is_for_sale = true)
  | "garage"; // itens na “minha garagem” (is_for_sale = false)

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

    // monta a query base
    let query = supabase
      .from("vehicles")
      .select("*, vehicle_images(*)");

    // ajusta filtros conforme o modo
    if (mode === "desire") {
      query = query
        .eq("user_id", user.id)
        .eq("is_for_sale", true);
    } else if (mode === "garage") {
      query = query
        .eq("owner_id", user.id)
        .eq("is_for_sale", false);
    } else {
      // mode === "all": combine desejados e garagem
      query = query.or(
        `and(user_id.eq.${user.id},is_for_sale.eq.true),and(owner_id.eq.${user.id},is_for_sale.eq.false)`
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
  }, [mode]); // refetch toda vez que o modo mudar

  return { vehicles, loading, error, refetch: fetchVehicles };
}
