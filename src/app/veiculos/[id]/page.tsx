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
import ShareVehicleModal from "@/components/ShareVehicleModal";
import TransferVehicleModal from "@/components/TransferVehicleModal";
import CustomizeModal from "@/components/CustomizeModal";
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
import SellerDetails from "@/components/formsInpt/SellerDetails";
import OptionalList from "@/components/formsInpt/OptionalList";

export default function VehicleDetailsPage() {
  // mantém [id] na rota
  const { id } = useParams() as { id?: string };
  const vehicleId = Array.isArray(id) ? id[0] : id ?? "";

  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fipeAtual, setFipeAtual] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // controla abertura dos modais
  const [showShareModal, setShowShareModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
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
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUser(user));
  }, [fetchVehicle]);

  /** ações originais **/
  const handleCompararFipe = async () => {
    if (!vehicle?.fipe_info) return;
    try {
      const fipeData = typeof vehicle.fipe_info === "string"
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
    } catch {
      console.error("Erro ao comparar com FIPE");
    }
  };

  const handleMoveToGarage = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      setActionLoading(false);
      return router.push("/login");
    }
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({ status: "GARAGE" as VehicleStatus, owner_id: user.id, sale_price: null })
      .eq("id", vehicle.id);
    if (!updErr) await fetchVehicle();
    setActionLoading(false);
  };

  const handlePutForSale = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const salePrice = vehicle.fipe_price;
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({ status: "FOR_SALE" as VehicleStatus, sale_price: salePrice })
      .eq("id", vehicle.id);
    if (!updErr) await fetchVehicle();
    setActionLoading(false);
  };

  const handleRemoveSale = async () => {
    if (!vehicle) return;
    setActionLoading(true);
    const { error: updErr } = await supabase
      .from("vehicles")
      .update({ status: "GARAGE" as VehicleStatus, sale_price: null })
      .eq("id", vehicle.id);
    if (!updErr) await fetchVehicle();
    setActionLoading(false);
  };

  if (loading) return <LoadingState message="Carregando veículo..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  const isOwner = vehicle.status === "WISHLIST"
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
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading ? "Movendo..." : "Mover para Garagem"}
          </button>
        );
      case "GARAGE":
        return (
          <button
            onClick={handlePutForSale}
            disabled={actionLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? "Processando..." : "Colocar à Venda"}
          </button>
        );
      case "FOR_SALE":
        return (
          <button
            onClick={handleRemoveSale}
            disabled={actionLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading ? "Processando..." : "Retirar da Venda"}
          </button>
        );
    }
  };

  const activeImageUrl = vehicle.vehicle_images?.[0]?.image_url || "";

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* IMAGEM E PERSONALIZAÇÃO */}
        <section className="relative mb-4">
          <BackButton className="mb-2" />
          {vehicle.vehicle_images?.length
            ? <Carousel images={vehicle.vehicle_images} />
            : (
              <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                <span className="text-gray-500">Sem imagem</span>
              </div>
            )}
          {isOwner && activeImageUrl && (
            <button
              onClick={() => setShowCustomizeModal(true)}
              className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded"
            >
              <Palette className="w-5 h-5" /> IA
            </button>
          )}
        </section>

        {/* TÍTULO E EDIT */}
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{vehicle.brand} {vehicle.model}</h1>
          {isOwner && (
            <button
              onClick={() => router.push(`/veiculos/${vehicleId}/editar`)}
              className="p-2 text-gray-500 hover:text-gray-800"
            >
              <Edit2 className="w-6 h-6" />
            </button>
          )}
        </header>

        {/* DETALHES */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Info icon={<Calendar />} label="Ano" value={vehicle.year} />
          <Info
            icon={<DollarSign />}
            label="Preço"
            value={
              vehicle.status === "FOR_SALE" && vehicle.sale_price != null
                ? vehicle.sale_price
                : vehicle.fipe_price
            }
            isCurrency
          />
          <Info icon={<Activity />} label="Quilometragem" value={`${vehicle.mileage} km`} />
          <Info icon={<Palette />} label="Cor" value={vehicle.color} />
          <Info icon={<Droplet />} label="Combustível" value={vehicle.fuel} />
        </div>

        <p className="mb-4">
          <strong>Observações:</strong> {vehicle.notes || "Nenhuma"}
        </p>

        {/* BOTOES DE AÇÃO */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <button
            onClick={handleCompararFipe}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded"
          >
            <RefreshCw className="w-5 h-5 inline-block" /> FIPE
          </button>

          {isOwner && (vehicle.status === "GARAGE" || vehicle.status === "FOR_SALE") && (
            <>
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded"
              >
                Compartilhar
              </button>
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Enviar
              </button>
            </>
          )}

          {renderActionButton()}
        </div>

        {/* FIPE ATUAL */}
        {fipeAtual && (
          <div className="p-4 bg-gray-100 rounded mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" /><span><strong>FIPE:</strong> {fipeAtual.Valor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" /><span><strong>Ref:</strong> {fipeAtual.MesReferencia}</span>
            </div>
          </div>
        )}

        {/* DETALHES E OPCIONAIS */}
        <div className="bg-white p-4 rounded shadow space-y-4">
          <SellerDetails seller={vehicle.seller_details!} />
          <OptionalList vehicleOptionals={vehicle.vehicle_optionals} />
        </div>
      </div>

      {/* MODAIS */}
      {showShareModal && (
        <ShareVehicleModal
          vehicleId={vehicleId}
          onClose={() => {
            setShowShareModal(false);
            fetchVehicle();
          }}
        />
      )}
      {showTransferModal && (
        <TransferVehicleModal
          vehicleId={vehicleId}
          onClose={() => {
            setShowTransferModal(false);
            router.push("/meus-veiculos");
          }}
        />
      )}
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

// componente auxiliar para exibir ícone + label + valor
function Info({
  icon,
  label,
  value,
  isCurrency,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isCurrency?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>
        <strong>{label}:</strong>{" "}
        {isCurrency && typeof value === "number"
          ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
          : value}
      </span>
    </div>
  );
}
