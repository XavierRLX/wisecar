// app/minhaGaragem/page.tsx
"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";
import { Wrench, Trash2 } from "lucide-react";

export default function MinhaGaragemPage() {
  const router = useRouter();
  const { vehicles, loading, error, refetch } = useVehicles("garage");

  // handler para excluir veículo e imagens
  async function handleDelete(vehicleId: string) {
    const { data: images } = await supabase
      .from("vehicle_images")
      .select("image_url")
      .eq("vehicle_id", vehicleId);
    for (const img of images || []) {
      const bucket = "vehicle-images";
      const prefix = `/public/${bucket}/`;
      const idx = img.image_url.indexOf(prefix);
      if (idx !== -1) {
        const path = img.image_url.substring(idx + prefix.length);
        await supabase.storage.from(bucket).remove([path]);
      }
    }
    await supabase.from("vehicles").delete().eq("id", vehicleId);
    refetch();
  }

  if (loading) return <LoadingState message="Carregando minha garagem..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Minha Garagem</h1>

        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhum carro na sua garagem.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => router.push(`/veiculos/${v.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard
                  vehicle={v}
                  extraActions={
                    <div className="flex justify-between space-x-2 mt-2">
                      {/* Botão Manutenções */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/veiculos/${v.id}/manutencoes`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        aria-label="Manutenções"
                      >
                        <Wrench className="w-5 h-5" />
                        <span className="text-sm">Manutenções</span>
                      </button>

                      {/* Botão Excluir */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(v.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 transition"
                        aria-label="Excluir veículo"
                      >
                        <Trash2 className="w-5 h-5" />
                        <span className="sr-only">Excluir</span>
                      </button>
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
