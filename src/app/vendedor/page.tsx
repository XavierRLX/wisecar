"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import VehicleCard from "@/components/VehicleCard";
import { supabase } from "@/lib/supabase";

export default function SellerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkSellerAndFetchVehicles() {
      // Verifica se o usuário está logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Busca o perfil para ver se o usuário é vendedor
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_seller")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profile?.is_seller) {
        setIsSeller(true);
        // Busca os veículos do vendedor
        const { data: vehiclesData, error: vehiclesError } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id);
        if (vehiclesError) {
          setError(vehiclesError.message);
        } else {
          setVehicles(vehiclesData || []);
        }
      }
      setLoading(false);
    }
    checkSellerAndFetchVehicles();
  }, [router]);

  if (loading) return <LoadingState message="Carregando informações..." />;
  if (error)
    return <p className="p-4 text-red-500">Erro: {error}</p>;

  if (!isSeller) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Área Exclusiva para Vendedores</h1>
        <p className="text-gray-700">
          Você não tem permissão para acessar essa área. Essa página é exclusiva para vendedores.
        </p>
        <p className="mt-2 text-gray-600">
          Se você deseja se tornar um vendedor, entre em contato com o suporte ou atualize seu perfil.
        </p>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <header className="mb-4">
          <h1 className="text-3xl font-bold">Meus Veículos</h1>
          <p className="text-gray-600">
            Aqui você pode gerenciar os veículos que adicionou e visualizar informações de cada um.
          </p>
        </header>

        {vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo cadastrado"
            description="Você ainda não adicionou nenhum veículo. Clique no botão abaixo para adicionar."
            buttonText="Adicionar Veículo"
            redirectTo="/adicionar"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
