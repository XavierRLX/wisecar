"use client";

import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles } from "@/hooks/useVehicles";
import LoadingState from "@/components/LoadingState";
import VehicleCard from "@/components/VehicleCard";

export default function MinhaGaragemPage() {
  const router = useRouter();
  const { vehicles, loading, error, refetch } = useVehicles("garage");

  if (loading) return <LoadingState message="Carregando minha garagem..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4">
        {vehicles.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum carro na sua garagem.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => router.push(`/veiculos/${v.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
