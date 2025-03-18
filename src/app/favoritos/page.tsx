"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

export default function FavoritosPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      // Obtém o usuário logado
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
          setFavorites(data || []);
        }
      }
      setLoading(false);
    }
    fetchFavorites();
  }, []);

  if (loading) return <p className="p-8">Carregando favoritos...</p>;

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Favoritos</h1>
        {favorites.length === 0 ? (
          <p>Você não tem veículos favoritados.</p>
        ) : (
          <ul className="space-y-4">
            {favorites.map((favorite: any) => {
              const vehicle = favorite.vehicles;
              return (
                <li key={favorite.vehicle_id} className="p-4 bg-white shadow rounded">
                  <p className="font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p>Ano: {vehicle.year}</p>
                  <p>Preço: R$ {vehicle.price}</p>
                  <p>Quilometragem: {vehicle.mileage} km</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
