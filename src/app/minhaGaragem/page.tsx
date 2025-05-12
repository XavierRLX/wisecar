// app/minhaGaragem/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles, VehicleMode } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import VehicleCard from "@/components/VehicleCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { Wrench, Trash2 } from "lucide-react";

export default function MinhaGaragemPage() {
  const router = useRouter();
  const mode: VehicleMode = "garage";
  const { vehicles, loading, error, refetch } = useVehicles(mode);
  const [userId, setUserId] = useState<string | null>(null);

  // carregar userId para permitir deletes
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  // ordena alfabeticamente
  const sorted = useMemo(() => {
    return [...vehicles].sort((a, b) =>
      `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
    );
  }, [vehicles]);

  async function handleDelete(id: string) {
    if (!userId) return;
    if (!confirm("Deseja realmente excluir este veículo?")) return;
    // apagar imagens
    const { data: imgs } = await supabase
      .from("vehicle_images")
      .select("image_url")
      .eq("vehicle_id", id);
    for (const img of imgs || []) {
      const marker = `/public/vehicle-images/`;
      const idx = img.image_url.indexOf(marker);
      if (idx !== -1) {
        const path = img.image_url.substring(idx + marker.length);
        await supabase.storage.from("vehicle-images").remove([path]);
      }
    }
    // apagar veículo
    await supabase
      .from("vehicles")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);
    refetch();
  }

  if (loading) return <LoadingState message="Carregando garagem..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Minha Garagem</h1>
        </header>

        {sorted.length === 0 ? (
          <EmptyState
            title="Nenhum veículo na garagem"
            description="Você ainda não moveu nenhum veículo para a garagem."
            buttonText="Adicionar Veículo"
            redirectTo="/veiculos/novo"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sorted.map((v) => (
              <div key={v.id} className="cursor-pointer">
                <VehicleCard
                  vehicle={v}
                  extraActions={
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/manutencoes?vehicleId=${v.id}`);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                      >
                        <Wrench className="w-5 h-5" />
                        <span className="text-sm">Manutenções</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(v.id);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5" />
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
