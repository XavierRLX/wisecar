"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import VehicleCard from "@/components/VehicleCard";

export default function FavoritosPage() {
  const [favoritesData, setFavoritesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("favorites")
        .select(`vehicle_id, vehicles(*)`)
        .eq("user_id", user.id);
      if (error) {
        console.error("Erro ao buscar favoritos:", error.message);
      } else {
        setFavoritesData(data || []);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchFavorites();
  }, []);

  async function removeFavorite(vehicleId: string) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("vehicle_id", vehicleId);
    if (error) {
      console.error("Erro ao remover favorito:", error.message);
    } else {
      fetchFavorites();
    }
  }

  if (loading) return <p className="p-8">Carregando favoritos...</p>;

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Favoritos</h1>
        {favoritesData.length === 0 ? (
          <p>Você não tem veículos favoritados.</p>
        ) : (
          <ul className="space-y-4">
            {favoritesData.map((favorite: any) => {
              const vehicle = favorite.vehicles;
              return (
                <VehicleCard
                  key={favorite.vehicle_id}
                  vehicle={vehicle}
                  onRemoveFavorite={removeFavorite}
                />
              );
            })}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
