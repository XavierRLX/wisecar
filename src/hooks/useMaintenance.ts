// hooks/useMaintenance.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { fetchMaintenanceRecords, deleteMaintenanceRecord, updateMaintenanceStatus } from "@/lib/maintenanceService";
import type { MaintenanceRecord } from "@/types";

export function useMaintenance(ownerId: string) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMaintenanceRecords(ownerId);
      setRecords(data);
    } catch (err: any) {
      setError(err.message);
      setRecords([]);
    }
    setLoading(false);
  }, [ownerId]);

  const remove = useCallback(async (id: string) => {
    await deleteMaintenanceRecord(id);
    setRecords(r => r.filter(x => x.id !== id));
  }, []);

  const changeStatus = useCallback(async (id: string, status: MaintenanceRecord["status"]) => {
    await updateMaintenanceStatus(id, status);
    setRecords(r => r.map(x => x.id === id ? { ...x, status } : x));
  }, []);

  useEffect(() => {
    if (ownerId) load();
  }, [ownerId, load]);

  return { records, loading, error, reload: load, remove, changeStatus };
}
