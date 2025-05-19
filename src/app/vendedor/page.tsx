// app/vendedor/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import AsyncSelect from "react-select/async";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";
import { getOrCreateConversation } from "@/lib/chatService";
import { useIsSeller } from "@/hooks/useIsSeller";
import { useNonSellerVehicles } from "@/hooks/useNonSellerVehicles";
import { supabase } from "@/lib/supabase";
import RestrictedAccessAlert from "@/components/RestrictedAccessAlert";

interface Option {
  value: string;
  label: string;
}

export default function SellerPage() {
  const router = useRouter();
  const isSeller = useIsSeller();
  const { vehicles, loading, error } = useNonSellerVehicles();

  // Estado do filtro
  const [selectedVehicle, setSelectedVehicle] = useState<Option | null>(null);

  // Carrega opções somente dos veículos já em `vehicles`
  const loadVehicleOptions = useCallback(
    async (input: string) => {
      if (!input) return [];
      const term = input.toLowerCase().trim();
      return vehicles
        .filter((v) =>
          `${v.brand} ${v.model}`.toLowerCase().includes(term)
        )
        .map((v) => ({
          value: v.id,
          label: `${v.brand} ${v.model}`,
        }));
    },
    [vehicles]
  );

  // Lista final, já filtrada pelo select
  const filtered = useMemo(() => {
    if (!selectedVehicle) return vehicles;
    return vehicles.filter((v) => v.id === selectedVehicle.value);
  }, [vehicles, selectedVehicle]);

  // Retornos antecipados **após** todos os Hooks
  if (loading) {
    return <LoadingState message="Carregando..." />;
  }
  if (isSeller === false) {
    return (
      <div className="p-2 mt-60 flex justify-center items-center">
        <RestrictedAccessAlert
          message="Esta área é exclusiva para vendedores. Para acessar, assine um plano ou atualize seu perfil."
          buttonText="Assinar Plano"
          onButtonClick={() => router.push("/planos")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Cabeçalho & Filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Área do Vendedor</h1>
          <p className="text-gray-600">
            Veja os veículos que usuários adicionaram aos seus desejos e inicie o contato.
          </p>
        </div>

        <div className="flex-1">
          <AsyncSelect<Option, false>
            cacheOptions
            defaultOptions={false}
            loadOptions={loadVehicleOptions}
            onChange={(opt) => setSelectedVehicle(opt)}
            value={selectedVehicle}
            placeholder="Digite para filtrar veículo..."
            noOptionsMessage={() => "Nenhum veículo nessa lista"}
            isClearable
            className="react-select-container w-full"
            classNamePrefix="react-select"
          />
          <div className="mt-1 text-gray-700 font-medium">
            Total: {filtered.length}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500">Erro ao carregar veículos: {error}</p>
      )}

      {/* Grid de VehicleCard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((vehicle) => {
            const formattedDate = vehicle.created_at
              ? new Date(vehicle.created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "";

            return (
              <div key={vehicle.id} className="cursor-pointer">
                <VehicleCard
                  vehicle={vehicle}
                  extraActions={
                    <div className="flex justify-between items-center">
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const buyerId = vehicle.user_id;
                          const {
                            data: { user },
                          } = await supabase.auth.getUser();
                          const sellerId = user?.id;
                          if (!buyerId || !sellerId) {
                            alert("Dados insuficientes para iniciar o chat.");
                            return;
                          }
                          try {
                            const conv = await getOrCreateConversation(
                              vehicle.id,
                              buyerId,
                              sellerId
                            );
                            router.push(`/chat/${conv.id}`);
                          } catch {
                            console.error("Erro ao iniciar o chat");
                          }
                        }}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Chat <span className="font-medium">@{vehicle.profiles.username}</span>
                      </button>
                      {formattedDate && (
                        <span className="text-xs text-gray-500">{formattedDate}</span>
                      )}
                    </div>
                  }
                />
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Nenhum veículo encontrado para esse filtro.
          </p>
        )}
      </div>
    </div>
  );
}
