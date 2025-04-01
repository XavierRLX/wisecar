"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard"; // ou um componente customizado para o vendedor
import { useVehicles } from "@/hooks/useVehicles";

export default function SellerPage() {
  const router = useRouter();
  const [isSeller, setIsSeller] = useState<boolean | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSeller() {
      // Obter o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Buscar o profile e verificar is_seller (supondo que sua tabela de profiles tenha essa coluna)
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

  useEffect(() => {
    async function fetchAllVehicles() {
      // Aqui você busca todos os veículos cadastrados (de todos os usuários)
      const { data, error } = await supabase.from("vehicles").select(`
        *,
        vehicle_images(*),
        seller_details(*),
        vehicle_optionals(optional:optionals(*)),
        favorites(*)
      `);
      if (!error && data) {
        setVehicles(data);
      }
      setLoading(false);
    }
    // Só busque os veículos se o usuário for vendedor
    if (isSeller) {
      fetchAllVehicles();
    }
  }, [isSeller]);

  if (loading) return <LoadingState message="Carregando..." />;

  if (isSeller === false) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
        <p>Esta página é exclusiva para vendedores. Se você deseja se tornar um vendedor, entre em contato conosco ou altere seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Área do Vendedor</h1>
      <p className="mb-6 text-gray-600">
        Aqui você pode ver todos os veículos cadastrados e iniciar conversas com os compradores interessados.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="cursor-pointer">
            {/* Utilize um componente customizado ou adapte o VehicleCard */}
            <VehicleCard
              vehicle={vehicle}
              // Aqui vamos adicionar um botão de "chat"
              extraActions={
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Obtenha os dados do comprador interessado a partir dos favoritos
                    // Supondo que favorites seja um array com registros que incluem user_id
                    if (vehicle.favorites && vehicle.favorites.length > 0) {
                      // Por exemplo, pegue o primeiro interessado (você pode aprimorar para listar todos)
                      const buyerId = vehicle.favorites[0].user_id;
                      // Redirecione para uma rota de chat (por exemplo, /chat?vehicleId=...&buyerId=...)
                      router.push(`/chat?vehicleId=${vehicle.id}&buyerId=${buyerId}`);
                    } else {
                      alert("Nenhum comprador demonstrou interesse ainda.");
                    }
                  }}
                  className="mt-2 flex items-center gap-1 text-blue-600 hover:underline"
                >
                  {/* Ícone de chat */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
