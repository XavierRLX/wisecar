// app/todosVeiculos/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import VehicleCard from "@/components/VehicleCard";
import { Wrench, Trash2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useVehicles, VehicleMode } from "@/hooks/useVehicles";
import { useFavorites } from "@/hooks/useFavorites";
import { useDeleteVehicle } from "@/hooks/useDeleteVehicle";

export default function TodosVeiculosPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();

  // modo de filtro
  const [mode, setMode] = useState<VehicleMode>("all");

  // dados de veículos
  const { vehicles, loading: vehiclesLoading, error, refetch } = useVehicles(mode);
  const { favorites, toggle: toggleFavorite } = useFavorites(userId);
  const { deleteVehicle } = useDeleteVehicle(refetch);

  // ordenação
  const sorted = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      ),
    [vehicles]
  );

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Filtro de modo sempre visível */}
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex bg-gray-200 rounded-full p-1 h-10 w-72">
            <div
              style={{
                left:
                  mode === "all"
                    ? "1px"
                    : mode === "desire"
                    ? "calc(100%/3 + 1px)"
                    : "calc(2 * 100%/3 + 1px)",
              }}
              className="absolute top-1 h-8 w-1/3 bg-white rounded-full shadow transition-all duration-300"
            />
            {( ["all", "desire", "garage"] as VehicleMode[] ).map((m) => {
              const labels = { all: "Todos", desire: "Desejado", garage: "Garagem" } as const;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 flex-1 text-sm font-medium transition-colors ${
                    mode === m ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Área de listagem: carregamento apenas aqui */}
        {vehiclesLoading ? (
          <div className="flex justify-center py-16">
            <LoadingState message="Carregando veículos..." />
          </div>
        ) : error ? (
          <p className="p-8 text-red-500">Erro: {error}</p>
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Nenhum veículo encontrado"
            description="Altere o filtro acima ou adicione novos veículos."
            buttonText="Adicionar Veículo"
            redirectTo="/adicionar"
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
                  isFavorited={v.is_for_sale ? favorites.includes(v.id) : undefined}
                  onToggleFavorite={v.is_for_sale ? () => toggleFavorite(v.id) : undefined}
                  onDelete={v.is_for_sale ? () => deleteVehicle(v.id, userId!) : undefined}
                  extraActions={
                    !v.is_for_sale && (
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
                    )
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
