"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle } from "@/types";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fipeAtual, setFipeAtual] = useState<any>(null);

  // Função para buscar o veículo (incluindo fipe_info)
  async function fetchVehicle() {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*, vehicle_images(*)")
      .eq("id", id)
      .single();
    if (error) {
      setError(error.message);
    } else {
      setVehicle(data);
    }
    setLoading(false);
  }

  useState(() => {
    if (id) fetchVehicle();
  });

  async function handleCompararFipe() {
    if (!vehicle || !vehicle.fipe_info) return;
    try {
      // Parse o fipe_info se for string
      const fipeData =
        typeof vehicle.fipe_info === "string"
          ? JSON.parse(vehicle.fipe_info)
          : vehicle.fipe_info;
      
      // Utilize os campos salvos com os códigos da FIPE
      const marcaCodigo = fipeData.codigoMarca;  // código da marca salvo
      const modeloCodigo = fipeData.codigoModelo; // código do modelo salvo
      const anoCodigo = fipeData.codigoAno;       // código do ano salvo (ex: "2014-3")
      const categoria = vehicle.category_id === 1 ? "carros" : "motos";
      
      // Busca os dados FIPE atualizados usando os códigos
      const dadosAtualizados = await fetchFipeAtualizado(
        categoria,
        marcaCodigo,
        modeloCodigo,
        anoCodigo
      );
      setFipeAtual(dadosAtualizados);
    } catch (err) {
      console.error("Erro ao comparar com FIPE:", err);
    }
  }
  
  if (loading) return <p className="p-8">Carregando veículo...</p>;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  return (
    <AuthGuard>
      <div className="p-8 max-w-3xl mx-auto bg-white shadow rounded">
        <h1 className="text-3xl font-bold mb-4">
          {vehicle.brand} {vehicle.model}
        </h1>
        <div className="mb-4">
          <p><strong>Ano:</strong> {vehicle.year}</p>
          <p><strong>Preço:</strong> R$ {vehicle.price}</p>
          <p><strong>Quilometragem:</strong> {vehicle.mileage} km</p>
          <p><strong>Cor:</strong> {vehicle.color}</p>
          <p><strong>Combustível:</strong> {vehicle.fuel}</p>
          <p><strong>Observações:</strong> {vehicle.notes || "Sem observações"}</p>
        </div>
        <button
          onClick={handleCompararFipe}
          className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Comparar com FIPE
        </button>
        {fipeAtual && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p>
              <strong>Valor FIPE Atual:</strong> {fipeAtual.Valor}
            </p>
            <p>
              <strong>Data de Referência:</strong> {fipeAtual.MesReferencia}
            </p>
          </div>
        )}
        {/* Exiba as imagens */}
        {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {vehicle.vehicle_images.map(img => (
              <img
                key={img.id}
                src={img.image_url}
                alt={`${vehicle.brand} ${vehicle.model}`}
                className="w-full h-48 object-cover rounded"
              />
            ))}
          </div>
        ) : (
          <p>Sem imagens disponíveis.</p>
        )}
      </div>
    </AuthGuard>
  );
}
