// app/veiculos/id/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle } from "@/types";
import { Calendar, DollarSign, Activity, Palette, Droplet, Check } from "lucide-react";
import SellerDetails from "@/components/SellerDetails";
import OptionalList from "@/components/OptionalList";
import Carousel from "@/components/Carousel";
import LoadingState from "@/components/LoadingState";
import Link from "next/link";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fipeAtual, setFipeAtual] = useState<any>(null);

  const fetchVehicle = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select(`
        *,
        vehicle_images(*),
        seller_details(*),
        vehicle_optionals(optional:optionals(*))
      `)
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setVehicle(data);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchVehicle();
  }, [id, fetchVehicle]);

  const handleCompararFipe = async () => {
    if (!vehicle || !vehicle.fipe_info) return;
    try {
      const fipeData =
        typeof vehicle.fipe_info === "string"
          ? JSON.parse(vehicle.fipe_info)
          : vehicle.fipe_info;
      const { codigoMarca, codigoModelo, codigoAno } = fipeData;
      const categoria = vehicle.category_id === 1 ? "carros" : "motos";
      // Use o código completo do ano, sem separar o hífen
      const dadosAtualizados = await fetchFipeAtualizado(
        categoria,
        codigoMarca,
        codigoModelo,
        codigoAno
      );
      setFipeAtual(dadosAtualizados);
    } catch (err) {
      console.error("Erro ao comparar com FIPE:", err);
    }
  };
  
  if (loading) return <LoadingState message="Carregando veículos..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  return (
    <AuthGuard>
          <div className="max-w-4xl mx-auto space-y-6">
        {/* Card do veículo */}
        <section className="bg-white p-3 rounded-lg">
          {/* Imagem */}
          <section className="mb-4">
            {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
              <Carousel images={vehicle.vehicle_images} />
            ) : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
                <span className="text-gray-500 text-xl">Sem imagem</span>
              </div>
            )}
          </section>

          {/* Título */}
          <header className="my-4">
            <h1 className="text-lg font-bold mb-4">{vehicle.brand} {vehicle.model}</h1>
          </header>

          {/* Informações organizadas em duas colunas */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong>Ano:</strong> {vehicle.year}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong>Preço:</strong>{" "}
                {vehicle.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong>Quilometragem:</strong> {vehicle.mileage} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong>Cor:</strong> {vehicle.color}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-gray-500" />
              <span className="text-gray-700">
                <strong>Combustível:</strong> {vehicle.fuel}
              </span>
            </div>
          </div>

          {/* Observações */}
          <p className="text-gray-700 mb-4">
            <strong>Observações:</strong> {vehicle.notes || "Sem observações"}
          </p>

          {/* Botões de ação simplificados */}
          <div className="flex gap-2">
            <button
              onClick={handleCompararFipe}
              className="flex-1 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
            >
              Comparar FIPE
            </button>
            <Link
              href={`/veiculos/${vehicle.id}/editar`}
              className="flex-1 py-2 text-center border border-gray-400 text-gray-600 rounded hover:bg-gray-50 transition-colors"
            >
              Editar
            </Link>
          </div>

          {/* Exibição dos dados FIPE, se disponíveis */}
          {fipeAtual && (
            <div className="mt-4 p-2 bg-gray-100 rounded">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800">
                  <strong>Valor FIPE:</strong> {fipeAtual.Valor}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-5 h-5 text-gray-700" />
                <span className="text-gray-800">
                  <strong>Data de Referência:</strong> {fipeAtual.MesReferencia}
                </span>
              </div>
            </div>
          )}
         <div className=" mt-2 bg-white p-2 rounded-lg">
        <SellerDetails seller={vehicle.seller_details ?? null} />
        <OptionalList vehicleOptionals={vehicle.vehicle_optionals} />
        </div>
        </section>
      </div>
    </AuthGuard>
  );
}
