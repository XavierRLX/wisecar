// lib/maintenanceService.ts
import { supabase } from "@/lib/supabase";
import type { MaintenanceRecord, MaintenancePart } from "@/types";

export async function fetchMaintenanceRecords(
  ownerId: string
): Promise<(MaintenanceRecord & { maintenance_parts: MaintenancePart[]; vehicle: { id: string; brand: string; model: string } })[]> {
  const { data, error } = await supabase
    .from("maintenance_records")
    .select(`
      *,
      maintenance_parts(*),
      vehicle:vehicles(id, brand, model)
    `)
    .in('vehicle_id', (await supabase
      .from("vehicles")
      .select("id")
      .eq("owner_id", ownerId)
      .eq("is_for_sale", false)
    ).data!.map(v => v.id))
    .order("scheduled_date", { ascending: true });

  if (error) throw new Error(error.message);
  return data as any;
}

export async function deleteMaintenanceRecord(id: string) {
  const { error } = await supabase
    .from("maintenance_records")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateMaintenanceStatus(id: string, status: MaintenanceRecord["status"]) {
  const { error } = await supabase
    .from("maintenance_records")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
