"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import VehicleCard from "@/components/VehicleCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";

export default function FavoritosPage() {
  const router = useRouter();
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
        const { data } = await supabase
          .from("favorites")
          .select("vehicle_id")
          .eq("user_id", user.id);
        if (data) setFavorites(data.map((item: any) => item.vehicle_id));
      }
    }
    fetchFavorites();
  }, []);

  const favoriteVehicles = vehicles.filter((v) => favorites.includes(v.id));

  async function toggleFavorite(vehicleId: string) {
    if (!userId) return;
    const isFavorited = favorites.includes(vehicleId);
    if (!isFavorited) {
      const { error } = await supabase.from("favorites").insert({
        user_id: userId,
        vehicle_id: vehicleId,
      });
      if (!error) setFavorites((prev) => [...prev, vehicleId]);
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", vehicleId);
      if (!error) setFavorites((prev) => prev.filter((id) => id !== vehicleId));
    }
  }

  if (loading) return <LoadingState message="Carregando veículos..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Favoritos</h1>
        {favoriteVehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo favoritado"
            description="Você ainda não favoritou nenhum veículo. Explore a lista e marque seus favoritos."
            buttonText="Ver Veículos"
            redirectTo="/veiculos"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {favoriteVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard
                  vehicle={vehicle}
                  isFavorited={true}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
