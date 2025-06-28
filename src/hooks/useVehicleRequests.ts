"use client";

import { supabase } from "@/lib/supabase";

export type RequestType = "share" | "transfer";

/**
 * Cria um pedido de compartilhamento ou transferência
 */
export async function createVehicleRequest(
  vehicleId: string,
  toUserId: string,
  type: RequestType
): Promise<void> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error("Não autenticado");
  }

  const { error } = await supabase
    .from("vehicle_requests")
    .insert({
      vehicle_id: vehicleId,
      from_user: user.id,
      to_user: toUserId,
      type,
    });

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Responde (aceita/recusa/cancela) um pedido existente
 */
export async function respondVehicleRequest(
  requestId: string,
  action: "accepted" | "rejected" | "cancelled"
): Promise<void> {
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error("Não autenticado");
  }

  // 1) Atualiza o status
  const { error: updErr } = await supabase
    .from("vehicle_requests")
    .update({ status: action })
    .eq("id", requestId);
  if (updErr) {
    throw new Error(updErr.message);
  }

  // 2) Se aceitou, aplica de fato o share ou transfer
  if (action === "accepted") {
    const { data: reqData, error: fetchErr } = await supabase
      .from("vehicle_requests")
      .select("*")
      .eq("id", requestId)
      .single();
    if (fetchErr || !reqData) {
      throw new Error(fetchErr?.message || "Pedido não encontrado");
    }

    if (reqData.type === "share") {
      await supabase.from("vehicle_access").insert({
        vehicle_id: reqData.vehicle_id,
        shared_by: reqData.from_user,
        shared_with: reqData.to_user,
        permission: "viewer",
      });
    } else {
      // transfer
      await supabase
        .from("vehicle_access")
        .delete()
        .eq("vehicle_id", reqData.vehicle_id);
      await supabase
        .from("vehicles")
        .update({ owner_id: reqData.to_user })
        .eq("id", reqData.vehicle_id);
    }
  }
}
