// lib/vehicleRequestsService.ts
import { supabase } from "@/lib/supabase";
import { Vehicle, Profile } from "@/types";

export type RequestType = "share" | "transfer";
export type RequestStatus = "pending" | "accepted" | "rejected" | "cancelled";

export interface VehicleRequest {
  id: string;
  type: RequestType;
  status: RequestStatus;
  created_at: string;
  vehicle: {
    id: string;
    brand: string;
    model: string;
    image_url?: string;
  };
  from_user: string;
  to_user: string;
}

// busca tanto enviados quanto recebidos
export async function fetchVehicleRequests(userId: string) {
  const { data, error } = await supabase
    .from("vehicle_requests")
    .select(`
      id,
      type,
      status,
      created_at,
      vehicles!inner(
        id,
        brand,
        model,
        vehicle_images!inner(image_url)
      ),
      from_user,
      to_user
    `)
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []).map((r: any) => ({
    id: r.id,
    type: r.type,
    status: r.status,
    created_at: r.created_at,
    vehicle: {
      id: r.vehicles[0].id,
      brand: r.vehicles[0].brand,
      model: r.vehicles[0].model,
      image_url: r.vehicles[0].vehicle_images[0]?.image_url,
    },
    from_user: r.from_user,
    to_user: r.to_user,
  })) as VehicleRequest[];
}

// criação de pedido
export async function createVehicleRequest(
  vehicleId: string,
  toUserId: string,
  type: RequestType
) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Não autenticado");

  const { error } = await supabase
    .from("vehicle_requests")
    .insert({ vehicle_id: vehicleId, from_user: user.id, to_user: toUserId, type });

  if (error) throw new Error(error.message);
}

// responder/cancelar
export async function respondVehicleRequest(
  requestId: string,
  action: "accepted" | "rejected" | "cancelled"
) {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error("Não autenticado");

  // atualiza status
  const { error: updErr } = await supabase
    .from("vehicle_requests")
    .update({ status: action })
    .eq("id", requestId);
  if (updErr) throw new Error(updErr.message);

  // se aceitou, aplica share ou transfer
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
      await supabase.from("vehicle_access").delete().eq("vehicle_id", reqData.vehicle_id);
      await supabase.from("vehicles").update({ owner_id: reqData.to_user }).eq("id", reqData.vehicle_id);
    }
  }
}
