// app/minhaGaragem/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import VehicleCard from "@/components/VehicleCard";
import { Wrench, DollarSign } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useVehicles, VehicleMode } from "@/hooks/useVehicles";
import { useDeleteVehicle } from "@/hooks/useDeleteVehicle";

export default function MinhaGaragemPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();

  // somente garagem (mesmo se estiver à venda)
  const [mode] = useState<VehicleMode>("garage");
  const {
    vehicles,
    loading: vehiclesLoading,
    error,
    refetch,
  } = useVehicles(mode);
  const { deleteVehicle } = useDeleteVehicle(refetch);

  const sorted = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      ),
    [vehicles]
  );

  if (authLoading || vehiclesLoading)
    return (
      <div className="flex justify-center py-16">
        <LoadingState message="Carregando veículos na garagem..." />
      </div>
    );

  if (error)
    return <p className="p-8 text-red-500">Erro ao carregar: {error}</p>;

  if (sorted.length === 0)
    return (
      <AuthGuard>
        <EnsureProfile />
        <EmptyState
          title="Nenhum veículo na garagem"
          description="Você ainda não adicionou nenhum veículo à sua garagem."
          buttonText="Adicionar Veículo"
          redirectTo="/adicionar"
        />
      </AuthGuard>
    );

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-bold mb-4">Minha Garagem</h2>

        <div className="grid grid-cols-1 gap-4">
          {sorted.map((v) => (
            <div
              key={v.id}
              className="relative cursor-pointer"
              onClick={() => router.push(`/veiculos/${v.id}`)}
            >
              {/* Badge “À Venda” caso esteja */}
              {v.is_for_sale && (
                <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> À Venda
                </div>
              )}

              <VehicleCard
                vehicle={v}
                onDelete={() => deleteVehicle(v.id, userId!)}
                extraActions={
                  // só aparece manutenção quando NÃO é wishlist
                  !v.is_wishlist && (
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
                  )
                }
              />
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}
