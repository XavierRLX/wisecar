// app/veiculos/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle } from "@/types";
import {
  Calendar,
  DollarSign,
  Activity,
  Palette,
  Droplet,
  RefreshCw,
  Edit2,
  CheckCircle,
} from "lucide-react";
import SellerDetails from "@/components/SellerDetails";
import OptionalList from "@/components/OptionalList";
import Carousel from "@/components/Carousel";
import LoadingState from "@/components/LoadingState";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
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

    if (error) setError(error.message);
    else setVehicle(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (id) fetchVehicle();
  }, [id, fetchVehicle]);

  const handleCompararFipe = async () => {
    if (!vehicle?.fipe_info) return;
    try {
      const fipeData =
        typeof vehicle.fipe_info === "string"
          ? JSON.parse(vehicle.fipe_info)
          : vehicle.fipe_info;
      const categoria = vehicle.category_id === 1 ? "carros" : "motos";
      const atual = await fetchFipeAtualizado(
        categoria,
        fipeData.codigoMarca,
        fipeData.codigoModelo,
        fipeData.codigoAno
      );
      setFipeAtual(atual);
    } catch (err) {
      console.error("Erro ao comparar com FIPE:", err);
    }
  };

  const handleMoveToGarage = async () => {
    if (!vehicle) return;
    setMoving(true);
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      setMoving(false);
      return router.push("/login");
    }
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({
        is_for_sale: false,
        owner_id: user.id,
      })
      .eq("id", vehicle.id);
    setMoving(false);
    if (updErr) {
      alert("Não foi possível mover para a garagem: " + updErr.message);
      return;
    }
    router.push("/minhaGaragem");
  };

  if (loading) return <LoadingState message="Carregando veículo..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Imagens */}
        <section className="mb-4">
          {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
            <Carousel images={vehicle.vehicle_images} />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-gray-500 text-xl">Sem imagem</span>
            </div>
          )}
        </section>

        {/* Título com botão de editar no canto direito */}
        <header className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          <button
            onClick={() => router.push(`/veiculos/${vehicle.id}/editar`)}
            aria-label="Editar veículo"
            className="p-2 text-gray-500 hover:text-gray-800 transition"
          >
            <Edit2 className="w-6 h-6" />
          </button>
        </header>


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

        {/* Botões de Ação Modernos */}
        <div className="flex justify-around flex-wrap gap-4 mb-4">
            <button
              onClick={handleCompararFipe}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Comparar FIPE</span>
            </button>
            {vehicle.is_for_sale && (
              <button
                onClick={handleMoveToGarage}
                disabled={moving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{moving ? "Movendo..." : "Mover para Garagem"}</span>
              </button>
            )}
          </div>

        {/* FIPE Atualizado */}
        {fipeAtual && (
          <div className="mt-4 p-4 bg-gray-100 rounded space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-700" />
              <span className="text-gray-800">
                <strong>Valor FIPE:</strong> {fipeAtual.Valor}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-700" />
              <span className="text-gray-800">
                <strong>Data de Referência:</strong> {fipeAtual.MesReferencia}
              </span>
            </div>
          </div>
        )}

        {/* Detalhes do Vendedor e Opcionais */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <SellerDetails seller={vehicle.seller_details!} />
          <OptionalList vehicleOptionals={vehicle.vehicle_optionals} />
        </div>
      </div>
    </AuthGuard>
  );
}
