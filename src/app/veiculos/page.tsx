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

export default function VeiculosPage() {
  const router = useRouter();
  // ← aqui: passo o modo "desire"
  const { vehicles, loading, error, refetch } = useVehicles("desire");
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

  async function handleDelete(vehicleId: string) {
    if (!userId) return;
    const { data: images } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId);
    for (const image of images || []) {
      const bucket = "vehicle-images";
      const marker = `/public/${bucket}/`;
      const index = image.image_url.indexOf(marker);
      if (index !== -1) {
        const relativePath = image.image_url.substring(index + marker.length);
        await supabase.storage.from(bucket).remove([relativePath]);
      }
    }
    // mantém a mesma condição de delete que você tinha
    await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicleId)
      .eq("user_id", userId);
    refetch();
  }

  if (loading) return <LoadingState message="Carregando veículos..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4">
        {vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo adicionado"
            description="Parece que você ainda não adicionou nenhum veículo. Clique no botão abaixo para começar."
            buttonText="Adicionar Veículo"
            redirectTo="/adicionar"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <h2 className="text-lg font-bold mb-4">Veículos Desejados</h2>
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => router.push(`/veiculos/${vehicle.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard
                  vehicle={vehicle}
                  isFavorited={favorites.includes(vehicle.id)}
                  onToggleFavorite={toggleFavorite}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
