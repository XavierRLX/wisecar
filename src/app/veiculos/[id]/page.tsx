// app/veiculos/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchFipeAtualizado } from "@/lib/fipe";
import { Vehicle, VehicleStatus } from "@/types";
import BackButton from "@/components/BackButton";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import Carousel from "@/components/Carousel";
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
import CustomizeModal from "@/components/CustomizeModal";

export default function VehicleDetailsPage() {
  const rawParams = useParams();
  const idParam = rawParams.id;
  const vehicleId =
    typeof idParam === "string"
      ? idParam
      : Array.isArray(idParam)
      ? idParam[0]
      : "";

  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fipeAtual, setFipeAtual] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);

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
      .eq("id", vehicleId)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setVehicle(data);
    }
    setLoading(false);
  }, [vehicleId]);

  useEffect(() => {
    fetchVehicle();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });
  }, [fetchVehicle]);

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
    setActionLoading(true);
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      setActionLoading(false);
      return router.push("/login");
    }
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({
        status: "GARAGE" as VehicleStatus,
        owner_id: user.id,
        sale_price: null,
      })
      .eq("id", vehicle.id);
    if (updErr) {
      alert("Erro ao mover para garagem: " + updErr.message);
    } else {
      fetchVehicle();
    }
    setActionLoading(false);
  };

  const handlePutForSale = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const salePrice = vehicle.fipe_price;
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({
        status: "FOR_SALE" as VehicleStatus,
        sale_price: salePrice,
      })
      .eq("id", vehicle.id);
    if (updErr) {
      alert("Erro ao colocar à venda: " + updErr.message);
    } else {
      fetchVehicle();
    }
    setActionLoading(false);
  };

  const handleRemoveSale = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({
        status: "GARAGE" as VehicleStatus,
        sale_price: null,
      })
      .eq("id", vehicle.id);
    if (updErr) {
      alert("Erro ao retirar da venda: " + updErr.message);
    } else {
      fetchVehicle();
    }
    setActionLoading(false);
  };

  if (loading) return <LoadingState message="Carregando veículo..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  const isOwner =
    vehicle.status === "WISHLIST"
      ? currentUser?.id === vehicle.user_id
      : currentUser?.id === vehicle.owner_id;

  const renderActionButton = () => {
    if (!isOwner) return null;
    switch (vehicle.status) {
      case "WISHLIST":
        return (
          <button
            onClick={handleMoveToGarage}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? "Movendo..." : "Mover para Garagem"}
          </button>
        );
      case "GARAGE":
        return (
          <button
            onClick={handlePutForSale}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? "Processando..." : "Colocar à Venda"}
          </button>
        );
      case "FOR_SALE":
        return (
          <button
            onClick={handleRemoveSale}
            disabled={actionLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition"
          >
            <CheckCircle className="w-5 h-5" />
            {actionLoading ? "Processando..." : "Retirar da Venda"}
          </button>
        );
    }
  };

  const activeImageUrl = vehicle.vehicle_images?.[0]?.image_url || "";

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <section className="mb-4 relative">
          <BackButton className="mb-2" />

          {vehicle.vehicle_images?.length ? (
            <Carousel images={vehicle.vehicle_images} />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg shadow-lg">
              <span className="text-gray-500 text-xl">Sem imagem</span>
            </div>
          )}

          {isOwner && activeImageUrl && (
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition flex items-center gap-1 z-10"
            >
              <Palette className="w-5 h-5" />
              <span className="text-sm">Personalizar IA</span>
            </button>
          )}
        </section>

        <header className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            {vehicle.brand} {vehicle.model}
          </h1>
          {isOwner && (
            <button
              onClick={() => router.push(`/veiculos/${vehicleId}/editar`)}
              aria-label="Editar veículo"
              className="p-2 text-gray-500 hover:text-gray-800 transition"
            >
              <Edit2 className="w-6 h-6" />
            </button>
          )}
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
              {(vehicle.status === "FOR_SALE" && vehicle.sale_price) ||
                vehicle.fipe_price?.toLocaleString("pt-BR", {
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

        <p className="text-gray-700 mb-4">
          <strong>Observações:</strong> {vehicle.notes || "Sem observações"}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <button
            onClick={handleCompararFipe}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Comparar FIPE</span>
          </button>
          {renderActionButton()}
        </div>

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

        <div className="bg-white p-4 rounded shadow space-y-4">
          <SellerDetails seller={vehicle.seller_details!} />
          <OptionalList vehicleOptionals={vehicle.vehicle_optionals} />
        </div>
      </div>

      {showCustomizeModal && (
        <CustomizeModal
          imageUrl={activeImageUrl}
          vehicleId={vehicleId}
          onClose={() => setShowCustomizeModal(false)}
        />
      )}
    </AuthGuard>
  );
}
