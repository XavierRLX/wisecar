"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";
import { getOrCreateConversation } from "@/lib/chatService";

export default function SellerPage() {
  const router = useRouter();
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verifica se o usuário logado é vendedor
  useEffect(() => {
    async function checkSeller() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_seller")
        .eq("id", user.id)
        .single();
      if (error || !profile || !profile.is_seller) {
        setIsSeller(false);
      } else {
        setIsSeller(true);
      }
    }
    checkSeller();
  }, [router]);

  // Busca os veículos adicionados por usuários não vendedores
  useEffect(() => {
    async function fetchVehicles() {
      // Supondo que você tenha configurado o relacionamento entre vehicles e profiles
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, profiles(is_seller, username), favorites(*)")
        // Filtra apenas os veículos cujo proprietário não é vendedor
        .eq("profiles.is_seller", false);
      if (!error && data) {
        setVehicles(data);
      }
      setLoading(false);
    }
    if (isSeller) {
      fetchVehicles();
    } else {
      setLoading(false);
    }
  }, [isSeller]);

  if (loading) return <LoadingState message="Carregando..." />;

  if (isSeller === false) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p>
          Esta área é exclusiva para vendedores. Se você deseja se tornar um vendedor, entre em contato ou atualize seu perfil.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Área do Vendedor</h1>
      <p className="mb-6 text-gray-600">
        Veja os veículos adicionados por usuários comuns e entre em contato com os interessados.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="cursor-pointer">
            <VehicleCard
              vehicle={vehicle}
              // Para área do vendedor, omitimos ações de favorito/exclusão e adicionamos o botão de chat
              extraActions={
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Neste exemplo, usamos o user_id do veículo como o comprador interessado.
                    // Normalmente, essa lógica será mais elaborada (por exemplo, buscar os interessados a partir dos "favorites").
                    const buyerId = vehicle.user_id;
                    // O vendedor é o usuário logado; obtenha seu ID:
                    const { data: { user } } = await supabase.auth.getUser();
                    const sellerId = user?.id;
                    if (!buyerId || !sellerId) {
                      alert("Dados insuficientes para iniciar o chat.");
                      return;
                    }
                    try {
                      // Obtém (ou cria) a conversa entre vendedor e comprador para este veículo
                      const conversation = await getOrCreateConversation(vehicle.id, buyerId, sellerId);
                      router.push(`/chat/${conversation.id}`);
                    } catch (error) {
                      console.error("Erro ao iniciar o chat:", error);
                    }
                  }}
                  className="flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Chat
                </button>
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
