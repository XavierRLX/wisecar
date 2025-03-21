"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import VehicleCard from "@/components/VehicleCard";

export default function FavoritosPage() {
  const router = useRouter();
  const [favoritesData, setFavoritesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from("favorites")
        .select(`vehicle_id, vehicles(*, vehicle_images(*))`)
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
          <>
            <p>Você não tem veículos favoritados.</p>
            <p>
              <a href="/veiculos" className="text-blue-500 underline">
                Clique aqui
              </a>{" "}
              para visualizar veículos.
            </p>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoritesData.map((favorite: any) => {
              const vehicle = favorite.vehicles;
              return (
                <div
                  key={favorite.vehicle_id}
                  onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                  className="cursor-pointer"
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onRemoveFavorite={(vehicleId) => {
                      // O VehicleCard já interrompe a propagação do clique
                      removeFavorite(vehicleId);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
