"use client";

import { supabase } from "@/lib/supabase";

export function useDeleteVehicle(onDeleted: () => void) {
  async function deleteVehicle(vehicleId: string, userId: string) {
    try {
      // 1) buscar URLs das imagens
      const { data: imgs, error: imgErr } = await supabase
        .from("vehicle_images")
        .select("image_url")
        .eq("vehicle_id", vehicleId);
      if (imgErr) console.error("Erro ao buscar imagens:", imgErr);

      // 2) remover do Storage
      const bucket = "vehicle-images";
      await Promise.all(
        (imgs || []).map((img) => {
          const parts = img.image_url.split(`/public/${bucket}/`);
          return parts[1]
            ? supabase.storage.from(bucket).remove([parts[1]])
            : Promise.resolve(null);
        })
      );

      // 3) remover registro no banco
      const { error: delErr } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", vehicleId)
        .eq("user_id", userId);
      if (delErr) throw delErr;

      onDeleted();
    } catch (err) {
      console.error("Erro ao excluir veículo:", err);
      alert("Não foi possível excluir o veículo. Tente novamente.");
    }
  }

  return { deleteVehicle };
}
