// app/vendedor/page.tsx
"use client";

import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";
import { getOrCreateConversation } from "@/lib/chatService";
import { useIsSeller } from "@/hooks/useIsSeller";
import { useNonSellerVehicles } from "@/hooks/useNonSellerVehicles";
import { supabase } from "@/lib/supabase";
import RestrictedAccessAlert from "@/components/RestrictedAccessAlert";

export default function SellerPage() {
  const router = useRouter();
  const isSeller = useIsSeller();
  const { vehicles, loading, error } = useNonSellerVehicles();

  if (loading) return <LoadingState message="Carregando..." />;

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
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Área do Vendedor</h1>
      <p className="mb-6 text-base text-gray-600">
        Veja os veículos que usuários adicionaram aos seus desejos. Inicie o
        contato com cada comprador via chat.
      </p>

      {error && (
        <p className="mb-4 text-red-500">Erro ao carregar veículos: {error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => {
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
                    {/* Botão de Chat */}
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
                          const conversation = await getOrCreateConversation(
                            vehicle.id,
                            buyerId,
                            sellerId
                          );
                          router.push(`/chat/${conversation.id}`);
                        } catch (err) {
                          console.error("Erro ao iniciar o chat:", err);
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

                    {/* Data de cadastro */}
                    {formattedDate && (
                      <span className="text-xs text-gray-500">
                        {formattedDate}
                      </span>
                    )}
                  </div>
                }
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
