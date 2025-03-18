"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

export default function VeiculosPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicles() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("vehicles")
          .select("*")
          .eq("user_id", user.id);
        if (error) {
          console.error("Erro ao buscar veículos:", error.message);
        } else {
          setVehicles(data || []);
        }
      }
      setLoading(false);
    }
    fetchVehicles();
  }, []);

  async function handleFavorite(vehicleId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        vehicle_id: vehicleId,
      });
      if (error) {
        console.error("Erro ao favoritar veículo:", error.message);
      } else {
        alert("Veículo favoritado com sucesso!");
        // Opcional: atualizar a lista ou marcar o veículo como favoritado
      }
    }
  }

  if (loading) return <p className="p-8">Carregando veículos...</p>;

  return (
    <AuthGuard>
      <div className="p-8">
        <h1 className="text-xl font-bold mb-4">Veículos</h1>
        {vehicles.length === 0 ? (
          <p>Não veículos adicionados.</p>
        ) : (
          <ul className="space-y-4">
            {vehicles.map((vehicle) => (
              <li key={vehicle.id} className="p-4 bg-white shadow rounded">
                <p className="font-semibold">
                  {vehicle.brand} {vehicle.model}
                </p>
                <p>Ano: {vehicle.year}</p>
                <p>Preço: R$ {vehicle.price}</p>
                <p>Quilometragem: {vehicle.mileage} km</p>
                <button
                  onClick={() => handleFavorite(vehicle.id)}
                  className="mt-2 py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Favoritar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
