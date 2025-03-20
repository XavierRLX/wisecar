"use client";

import React from "react";
import { Heart, Trash2, Calendar, DollarSign, Activity } from "lucide-react";
import { Vehicle } from "@/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorited?: boolean;
  onToggleFavorite?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onRemoveFavorite?: (vehicleId: string) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  isFavorited,
  onToggleFavorite,
  onDelete,
  onRemoveFavorite,
}) => {
  return (
    <li className="relative bg-white shadow rounded-lg overflow-hidden">
      {/* Imagem Principal */}
      {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
        <img
          src={vehicle.vehicle_images[0].image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Sem imagem</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Título e Botão de Favoritar */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">
            {vehicle.brand} {vehicle.model}
          </h2>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(vehicle.id);
              }}
              className="p-1 focus:outline-none"
              aria-label={
                isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
              }
            >
              {isFavorited ? (
                <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
              ) : (
                <Heart className="w-6 h-6 text-gray-400" />
              )}
            </button>
          )}
        </div>
        {/* Detalhes com Ícones */}
        <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            <span>R$ {vehicle.price}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span>{vehicle.mileage} km</span>
          </div>
        </div>
        {/* Botão de Exclusão */}
        <div className="flex justify-end">
          {onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle.id);
              }}
              className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none"
              aria-label="Excluir veículo"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : onRemoveFavorite ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(vehicle.id);
              }}
              className="text-gray-600 hover:text-red-600 transition-colors focus:outline-none"
              aria-label="Remover dos favoritos"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>
    </li>
  );
};

export default VehicleCard;
