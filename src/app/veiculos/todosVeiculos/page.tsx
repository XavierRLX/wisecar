// app/veiculos/todosVeiculos/page.tsx
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
import { useFavorites } from "@/hooks/useFavorites";
import { useDeleteVehicle } from "@/hooks/useDeleteVehicle";
import { ToggleFilter, Option } from "@/components/ToggleFilter";

export default function TodosVeiculosPage() {
  const router = useRouter();
  const { userId, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<VehicleMode>("all");
  const { vehicles, loading: vehiclesLoading, error, refetch } = useVehicles(mode);
  const { favorites, toggle: toggleFavorite } = useFavorites(userId);
  const { deleteVehicle } = useDeleteVehicle(refetch);

  const sorted = useMemo(
    () =>
      [...vehicles].sort((a, b) =>
        `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`)
      ),
    [vehicles]
  );

  if (authLoading || vehiclesLoading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingState message="Carregando veículos..." />
      </div>
    );
  }

  if (error) {
    return <p className="p-8 text-red-500">Erro ao carregar: {error}</p>;
  }

  if (sorted.length === 0) {
    return (
      <AuthGuard>
        <EnsureProfile />
        <EmptyState
          title="Nenhum veículo encontrado"
          description="Altere o filtro acima ou adicione novos veículos."
          buttonText="Adicionar Veículo"
          redirectTo="/adicionar"
        />
      </AuthGuard>
    );
  }

  const vehicleModeOptions: Option<VehicleMode>[] = [
    { value: "all",    label: "Todos" },
    { value: "desire", label: "Desejado" },
    { value: "garage", label: "Garagem" },
  ];

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* filtro sem form: só botão normal */}
        <div className="text-center">
          <ToggleFilter
            options={vehicleModeOptions}
            value={mode}
            onChange={setMode}
            className="w-72"
          />
        </div>

        {/* lista recarrega só por causa do hook useVehicles(mode) */}
        <div className="grid grid-cols-1 gap-4">
          {sorted.map((v) => (
            <div
              key={v.id}
              className="relative cursor-pointer"
              onClick={() => router.push(`/veiculos/${v.id}`)}
            >
              {v.status === "FOR_SALE" && (
                <div className="absolute top-2 left-2 z-10 bg-green-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> À Venda
                </div>
              )}

              <VehicleCard
                vehicle={v}
                isFavorited={favorites.includes(v.id)}
                onToggleFavorite={() => toggleFavorite(v.id)}
                onDelete={() => deleteVehicle(v.id, userId!)}
                extraActions={
                  v.status !== "WISHLIST" && (
                    <button
                      type="button"
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
