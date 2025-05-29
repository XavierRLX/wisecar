// lib/maintenanceService.ts

import { supabase } from "@/lib/supabase";
import type { MaintenanceRecord, MaintenancePart } from "@/types";

export async function fetchMaintenanceRecords(
  ownerId: string
): Promise<
  (MaintenanceRecord & {
    maintenance_parts: MaintenancePart[];
    vehicle: { id: string; brand: string; model: string };
  })[]
> {
  // 1) Busca todos os IDs de veículos que o usuário possui
  const { data: owned, error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("owner_id", ownerId);

  if (vehicleError) {
    throw new Error(`Erro ao buscar veículos da garagem: ${vehicleError.message}`);
  }

  const vehicleIds = (owned || []).map((v) => v.id);

  // 2) Busca as manutenções de todos esses veículos
  const { data, error } = await supabase
    .from("maintenance_records")
    .select(`
      *,
      maintenance_parts(*),
      vehicle:vehicles(id, brand, model)
    `)
    .in("vehicle_id", vehicleIds)
    .order("scheduled_date", { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar manutenções: ${error.message}`);
  }

  return data as any;
}

export async function deleteMaintenanceRecord(id: string) {
  const { error } = await supabase
    .from("maintenance_records")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao excluir manutenção: ${error.message}`);
  }
}

export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceRecord["status"]
) {
  const { error } = await supabase
    .from("maintenance_records")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Erro ao atualizar status da manutenção: ${error.message}`);
  }
}
