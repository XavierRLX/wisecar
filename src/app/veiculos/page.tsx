"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import { useVehicles } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

export default function VeiculosPage() {
  const { vehicles, loading, error } = useVehicles();
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
      // Adiciona aos favoritos
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
      // Remove dos favoritos
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

  if (loading) return <p className="p-8">Carregando veículos...</p>;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Veículos</h1>
        {vehicles.length === 0 ? (
          <p>Não veículos adicionados.</p>
        ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => {
              const isFavorited = favorites.includes(vehicle.id);
              return (
                <li
                  key={vehicle.id}
                  className="p-4 bg-white shadow rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p>Ano: {vehicle.year}</p>
                    <p>Preço: R$ {vehicle.price}</p>
                    <p>Quilometragem: {vehicle.mileage} km</p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(vehicle.id)}
                    className="p-2"
                    aria-label={
                      isFavorited
                        ? "Remover dos favoritos"
                        : "Adicionar aos favoritos"
                    }
                  >
                    {isFavorited ? (
                      <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
                    ) : (
                      <Heart className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
