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
import Link from "next/link";
import { type } from "os";

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
        vehicle_optionals!inner(optional:optionals(*))
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
      const fipeData = typeof vehicle.fipe_info === "string" ? JSON.parse(vehicle.fipe_info) : vehicle.fipe_info;
      const { codigoMarca, codigoModelo, codigoAno } = fipeData;
      const categoria = vehicle.category_id === 1 ? "carros" : "motos";
      const dadosAtualizados = await fetchFipeAtualizado(categoria, codigoMarca, codigoModelo, codigoAno);
      setFipeAtual(dadosAtualizados);
    } catch (err) {
      console.error("Erro ao comparar com FIPE:", err);
    }
  };

  if (loading) return <p className="p-8">Carregando veículo...</p>;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-2 space-y-6">
        {/* Seção de Informações do Veículo */}
        <section className="bg-white p-2 rounded-lg shadow-md space-y-4">
          {/* Seção de Imagem Principal */}
          <section className="mb-6">
          {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
            <Carousel images={vehicle.vehicle_images} />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-gray-500 text-xl">Sem imagem</span>
            </div>
          )}
        </section>

          <header>
            <h1 className="text-lg font-bold flex items-center gap-2">
              {vehicle.brand} {vehicle.model}
            </h1>
          </header>
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
                <strong>Preço:</strong> {vehicle.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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
          <p className="text-gray-700">
            <strong>Observações:</strong> {vehicle.notes || "Sem observações"}
          </p>
          <div>
            <button
              onClick={handleCompararFipe}
              className="flex items-center gap-2 w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              <Check className="w-5 h-5" />
              Comparar com FIPE
            </button>
            <Link href={`/veiculos/${vehicle.id}/editar`} className="px-4 py-2 bg-yellow-500 text-white rounded">
                      Editar Veículo
                    </Link>
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
        </section>

        {/* Seção de Detalhes do Vendedor */}
        <SellerDetails seller={vehicle.seller_details ?? null} />

        {/* Seção de Opcionais */}
        <OptionalList vehicleOptionals={vehicle.vehicle_optionals} />

        {/* Seção de Galeria de Imagens */}
        
      </div>
    </AuthGuard>
  );
}
