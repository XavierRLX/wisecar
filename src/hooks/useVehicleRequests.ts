// hooks/useVehicleRequests.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchVehicleRequests,
  createVehicleRequest,
  respondVehicleRequest,
} from "@/lib/vehicleRequestsService";
import type { VehicleRequest } from "@/types";
import { supabase } from "@/lib/supabase";

export function useVehicleRequests() {
  const [sent, setSent] = useState<VehicleRequest[]>([]);
  const [received, setReceived] = useState<VehicleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const all = await fetchVehicleRequests(user.id);
      setSent(all.filter((r) => r.from_user === user.id && r.status === "pending"));
      setReceived(all.filter((r) => r.to_user === user.id && r.status === "pending"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    sent,
    received,
    loading,
    error,
    refresh: load,
    share: createVehicleRequest,
    transfer: createVehicleRequest,
    respond: respondVehicleRequest,
  };
}
