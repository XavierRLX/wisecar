// app/vendedor/page.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import AsyncSelect from "react-select/async";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";
import { getOrCreateConversation } from "@/lib/chatService";
import { useIsSeller } from "@/hooks/useIsSeller";
import { useSellerVehicles } from "@/hooks/useSellerVehicles";
import { VehicleStatus } from "@/types";
import RestrictedAccessAlert from "@/components/RestrictedAccessAlert";
import { ToggleFilter, Option } from "@/components/ToggleFilter";
import { supabase } from "@/lib/supabase";

interface Options {
  value: string;
  label: string;
}

type SellerFilter = "WISHLIST" | "FOR_SALE";
const sellerOptions: Option<SellerFilter>[] = [
  { value: "WISHLIST", label: "Desejo" },
  { value: "FOR_SALE",  label: "À Venda" },
];

export default function SellerPage() {
  const router = useRouter();
  const isSeller = useIsSeller();

  // 1) estado do filtro de status
  const [statusFilter, setStatusFilter] = useState<VehicleStatus>("WISHLIST");

  // 2) hook buscando todos os veículos com o status escolhido
  const { vehicles, loading, error } = useSellerVehicles(statusFilter);

  // 3) AsyncSelect filtra sobre esse conjunto
  const [selectedOption, setSelectedOption] = useState<Options | null>(null);
  const loadOptions = useCallback(
    async (input: string) => {
      if (!input) return [];
      const term = input.toLowerCase();
      return vehicles
        .filter((v) =>
          `${v.brand} ${v.model}`.toLowerCase().includes(term)
        )
        .map((v) => ({ value: v.id, label: `${v.brand} ${v.model}` }));
    },
    [vehicles]
  );
  const filtered = useMemo(() => {
    if (!selectedOption) return vehicles;
    return vehicles.filter((v) => v.id === selectedOption.value);
  }, [vehicles, selectedOption]);

  // acesso restrito
  if (isSeller === false) {
    return (
      <div className="p-2 mt-60 flex justify-center items-center">
        <RestrictedAccessAlert
          message="Área exclusiva para vendedores."
          buttonText="Assinar Plano"
          onButtonClick={() => router.push("/planos")}
        />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6">
      {/* Toggle de Status e título */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Área do Vendedor</h1>
          <p className="text-gray-600">
            {statusFilter === "WISHLIST"
              ? "Veículos na lista de desejo de todos os usuários"
              : "Veículos à venda de todos os usuários"}
          </p>
        </div>
        <ToggleFilter
          options={sellerOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Filtro por AsyncSelect + total */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <AsyncSelect<Options, false>
          cacheOptions
          defaultOptions={false}
          loadOptions={loadOptions}
          onChange={setSelectedOption}
          value={selectedOption}
          placeholder="Busque por marca/modelo..."
          isClearable
          className="react-select-container flex-1"
          classNamePrefix="react-select"
        />
        <div className="text-gray-700 font-medium">
          Total: {filtered.length}
        </div>
      </div>

      {error && <p className="text-red-500">Erro: {error}</p>}

      {/* Grid de resultados com carregamento interno */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-8">
            <LoadingState message="Carregando veículos..." />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((v) => (
            <div key={v.id} className="cursor-pointer">
              <VehicleCard
                vehicle={v}
                extraActions={
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      const buyerId = v.user_id;
                      const {
                        data: { user },
                      } = await supabase.auth.getUser();
                      if (!buyerId || !user?.id) {
                        alert("Não foi possível iniciar o chat.");
                        return;
                      }
                      const conv = await getOrCreateConversation(
                        v.id,
                        buyerId,
                        user.id
                      );
                      router.push(`/chat/${conv.id}`);
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    Chat <span className="font-medium">@{v.profiles.username}</span>
                  </button>
                }
              />
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Nenhum veículo encontrado.
          </p>
        )}
      </div>
    </div>
  );
}
