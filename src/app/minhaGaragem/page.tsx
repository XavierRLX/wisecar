// app/minhaGaragem/page.tsx
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import VehicleCard from "@/components/VehicleCard";
import { Wrench, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useVehicles, VehicleMode } from "@/hooks/useVehicles";
import { useDeleteVehicle } from "@/hooks/useDeleteVehicle";

export default function MinhaGaragemPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();
  const mode: VehicleMode = "garage";
  const { vehicles, loading: vehiclesLoading, error, refetch } = useVehicles(mode);
  const { deleteVehicle } = useDeleteVehicle(refetch);

  const loading = authLoading || vehiclesLoading;

  const sorted = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      ),
    [vehicles]
  );

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
              <div
                key={v.id}
                className="cursor-pointer"
                onClick={() => router.push(`/veiculos/${v.id}`)}
              >
                <VehicleCard
                  vehicle={v}
                  extraActions={
                    <div className="flex justify-between items-center mt-2">
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
                          deleteVehicle(v.id, userId!);
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
