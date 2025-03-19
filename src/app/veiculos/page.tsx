"use client";

import AuthGuard from "@/components/AuthGuard";
import { useVehicles } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import VehicleCard from "@/components/VehicleCard";

export default function VeiculosPage() {
  const { vehicles, loading, error, refetch } = useVehicles();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data, error } = await supabase
          .from("favorites")
          .select("vehicle_id")
          .eq("user_id", user.id);
        if (!error && data) {
          setFavorites(data.map((item: any) => item.vehicle_id));
        }
      }
    }
    fetchFavorites();
  }, []);

  async function toggleFavorite(vehicleId: string) {
    if (!userId) return;
    const isFavorited = favorites.includes(vehicleId);
    if (!isFavorited) {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        vehicle_id: vehicleId,
      });
      if (error) {
        console.error("Erro ao favoritar veículo:", error.message);
      } else {
        setFavorites((prev) => [...prev, vehicleId]);
      }
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId);
      if (error) {
        console.error("Erro ao remover favorito:", error.message);
      } else {
        setFavorites((prev) => prev.filter((id) => id !== vehicleId));
      }
    }
  }

  async function handleDelete(vehicleId: string) {
    if (!userId) return;
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId)
      .eq("user_id", userId);
    if (error) {
      console.error("Erro ao excluir veículo:", error.message);
    } else {
      alert("Veículo excluído com sucesso!");
      refetch();
    }
  }

  if (loading) return <p className="p-8">Carregando veículos...</p>;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Veículos</h1>
        {vehicles.length === 0 ? (
            <>
                <p>Não há veículos para visualizar.</p>
                <p>
                <a href="/adicionar" className="text-blue-500 underline">
                    Clique aqui
                </a>{" "}
                para adicionar.
                </p>
            </>
            ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isFavorited={favorites.includes(vehicle.id)}
                onToggleFavorite={toggleFavorite}
                onDelete={handleDelete}
              />
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
