"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import VehicleCard from "@/components/VehicleCard";

export default function VeiculosPage() {
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

    // Busca e remove as imagens associadas
    const { data: images, error: imagesError } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("vehicle_id", vehicleId);
    if (imagesError) {
      console.error("Erro ao buscar imagens para exclusão:", imagesError.message);
    } else if (images && images.length > 0) {
      for (const image of images) {
        const publicUrl = image.image_url;
        const bucket = "vehicle-images";
        const marker = `/public/${bucket}/`;
        const markerIndex = publicUrl.indexOf(marker);
        if (markerIndex === -1) {
          console.error("Formato de URL inesperado:", publicUrl);
          continue;
        }
        const relativePath = publicUrl.substring(markerIndex + marker.length);
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([relativePath]);
        if (removeError) {
          console.error("Erro ao remover imagem do bucket:", removeError.message);
        } else {
          console.log("Imagem removida:", relativePath);
        }
      }
    }

    // Exclui o veículo (a exclusão em cascata remove registros relacionados)
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
      <EnsureProfile />
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
          <div className="grid grid-cols-1 gap-4">
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
