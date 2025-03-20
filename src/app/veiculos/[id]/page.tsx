"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle } from "@/types";
import {
  Car,
  Calendar,
  DollarSign,
  Activity,
  Palette,
  Droplet,
  Check,
} from "lucide-react";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fipeAtual, setFipeAtual] = useState<any>(null);

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

  useEffect(() => {
    if (id) fetchVehicle();
  }, [id]);

  async function handleCompararFipe() {
    if (!vehicle || !vehicle.fipe_info) return;
    try {
      // Parse o fipe_info se for string
      const fipeData =
        typeof vehicle.fipe_info === "string"
          ? JSON.parse(vehicle.fipe_info)
          : vehicle.fipe_info;
      // Utilize os códigos salvos (certifique-se de que eles foram armazenados ao adicionar o veículo)
      const marcaCodigo = fipeData.codigoMarca;
      const modeloCodigo = fipeData.codigoModelo;
      const anoCodigo = fipeData.codigoAno; // ex: "2014-3"
      const categoria = vehicle.category_id === 1 ? "carros" : "motos";
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
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        {/* Imagem Principal */}
        <div className="mb-6">
          {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
            <img
              src={vehicle.vehicle_images[0].image_url}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-gray-500 text-xl">Sem imagem</span>
            </div>
          )}
        </div>

        {/* Card de Detalhes */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {vehicle.brand} {vehicle.model}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700">
                <strong>Ano:</strong> {vehicle.year}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700">
                <strong>Preço:</strong> R$ {vehicle.price}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700">
                <strong>Quilometragem:</strong> {vehicle.mileage} km
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700">
                <strong>Cor:</strong> {vehicle.color}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-gray-500" />
              <p className="text-gray-700">
                <strong>Combustível:</strong> {vehicle.fuel}
              </p>
            </div>
          </div>
          <div>
            <p className="text-gray-700">
              <strong>Observações:</strong> {vehicle.notes || "Sem observações"}
            </p>
          </div>
          <div>
            <button
              onClick={handleCompararFipe}
              className="flex items-center gap-2 w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Comparar com FIPE
            </button>
          </div>
          {fipeAtual && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <p className="text-gray-800">
                  <strong>Valor FIPE Atual:</strong> {fipeAtual.Valor}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-5 h-5 text-gray-700" />
                <p className="text-gray-800">
                  <strong>Data de Referência:</strong> {fipeAtual.MesReferencia}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Galeria de Imagens (se houver mais de uma) */}
        {vehicle.vehicle_images && vehicle.vehicle_images.length > 1 && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Galeria</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {vehicle.vehicle_images.slice(1).map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt={`${vehicle.brand} ${vehicle.model}`}
                  className="w-full h-48 object-cover rounded shadow"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
