"use client";

import React from "react";
import {
  Heart,
  Trash2,
  Calendar,
  DollarSign,
  Activity,
} from "lucide-react";
import { Vehicle } from "@/types";
import Carousel from "@/components/Carousel";

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorited?: boolean;
  onToggleFavorite?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onRemoveFavorite?: (vehicleId: string) => void;
  extraActions?: React.ReactNode;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isFavorited,
  onToggleFavorite,
  onDelete,
  onRemoveFavorite,
  extraActions,
}) => {
  // Usar fipe_price para valor padrão; se estiver à venda, mostrar sale_price
  const displayPrice =
    vehicle.status === "FOR_SALE" && vehicle.sale_price != null
      ? vehicle.sale_price
      : vehicle.fipe_price;

  return (
    <div className="bg-white shadow-xl rounded-lg overflow-hidden transform transition duration-100 hover:scale-102">
      <div>
        {vehicle.vehicle_images && vehicle.vehicle_images.length > 1 ? (
          <Carousel images={vehicle.vehicle_images} />
        ) : vehicle.vehicle_images && vehicle.vehicle_images.length === 1 ? (
          <img
            src={vehicle.vehicle_images[0].image_url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-56 object-contain rounded-t-lg"
          />
        ) : (
          <div className="w-full h-56 flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}

        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(vehicle.id);
            }}
            aria-label={
              isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
            className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 transition"
          >
            {isFavorited ? (
              <Heart className="w-5 h-5 text-red-500" fill="currentColor" />
            ) : (
              <Heart className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-base font-semibold mb-2">
          {vehicle.brand} {vehicle.model}
        </h2>
        <div className="flex mb-4 justify-between">
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            <span>R$ {displayPrice.toLocaleString("pt-BR")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>{vehicle.mileage} km</span>
          </div>
        </div>

        <div className="flex justify-end items-center">
          {onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle.id);
              }}
              aria-label="Excluir veículo"
              className="text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : onRemoveFavorite ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(vehicle.id);
              }}
              aria-label="Remover dos favoritos"
            >
              <Trash2 className="w-6 h-6 text-gray-600 hover:text-red-600 transition" />
            </button>
          ) : null}
        </div>

        {/* Botão de Manutenções (quando extraActions vier) */}
        {extraActions && <div className="mt-2">{extraActions}</div>}
      </div>
    </div>
  );
};

export default VehicleCard;
