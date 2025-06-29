// lib/vehicleRequestsService.ts
import { supabase } from "@/lib/supabase";
import type { VehicleRequest } from "@/types";

export type RequestType = "share" | "transfer";
export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

/**
 * Busca todos os pedidos (enviados ou recebidos) para um usuário
 */
export async function fetchVehicleRequests(userId: string): Promise<VehicleRequest[]> {
  const { data, error } = await supabase
    .from("vehicle_requests")
    .select(`
      id,
      type,
      status,
      created_at,
      from_user,
      to_user,
      vehicles!inner(
        id,
        brand,
        model,
        vehicle_images!inner(image_url)
      )
    `)
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((r: any) => {
    // supabase retorna `r.vehicles` como array de 1 elemento
    const veh = Array.isArray(r.vehicles) ? r.vehicles[0] : r.vehicles;
    return {
      id: r.id,
      type: r.type,
      status: r.status,
      created_at: r.created_at,
      vehicle: {
        id: veh.id,
        brand: veh.brand,
        model: veh.model,
        image_url: veh.vehicle_images?.[0]?.image_url,
      },
      from_user: r.from_user,
      to_user: r.to_user,
    };
  });
}

/**
 * Cria um pedido de compartilhamento/transferência
 */
export async function createVehicleRequest(
  vehicleId: string,
  toUserId: string,
  type: RequestType
) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("vehicle_requests")
    .insert({
      vehicle_id: vehicleId,
      from_user: user.id,
      to_user: toUserId,
      type,
    });

  if (error) throw new Error(error.message);
}

/**
 * Responde (aceita/recusa/cancela) um pedido existente
 */
export async function respondVehicleRequest(
  requestId: string,
  action: "accepted" | "rejected" | "cancelled"
) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Não autenticado");

  // 1) atualiza status
  const { error: updErr } = await supabase
    .from("vehicle_requests")
    .update({ status: action })
    .eq("id", requestId);
  if (updErr) throw new Error(updErr.message);

  // 2) se aceitou → aplica share ou transfer
  if (action === "accepted") {
    const { data: reqData, error: fetchErr } = await supabase
      .from("vehicle_requests")
      .select("*")
      .eq("id", requestId)
      .single();
    if (fetchErr || !reqData) throw new Error(fetchErr?.message || "Pedido não encontrado");

    if (reqData.type === "share") {
      await supabase.from("vehicle_access").insert({
        vehicle_id: reqData.vehicle_id,
        shared_by: reqData.from_user,
        shared_with: reqData.to_user,
        permission: "viewer",
      });
    } else {
      // transfer
      await supabase.from("vehicle_access").delete().eq("vehicle_id", reqData.vehicle_id);
      await supabase.from("vehicles").update({ owner_id: reqData.to_user }).eq("id", reqData.vehicle_id);
    }
  }
}
