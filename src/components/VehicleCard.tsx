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
    <div className="bg-white shadow-xl rounded-xl overflow-hidden transform transition duration-300 hover:scale-105">
      <div className="relative">
        {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
          <img
            src={vehicle.vehicle_images[0].image_url}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-56 object-cover"
          />
        ) : (
          <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
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
            className="absolute top-3 right-3 bg-white bg-opacity-80 p-2 rounded-full shadow hover:bg-opacity-100 transition"
          >
            {isFavorited ? (
              <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
            ) : (
              <Heart className="w-6 h-6 text-gray-400" />
            )}
          </button>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {vehicle.brand} {vehicle.model}
        </h2>
        <div className="flex justify-between text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-5 h-5" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-5 h-5" />
            <span>R$ {vehicle.price}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-5 h-5" />
            <span>{vehicle.mileage} km</span>
          </div>
        </div>
        <div className="flex justify-end">
          {onDelete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(vehicle.id);
              }}
              aria-label="Excluir veículo"
              className="text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          ) : onRemoveFavorite ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFavorite(vehicle.id);
              }}
              aria-label="Remover dos favoritos"
              className="text-gray-600 hover:text-red-600 transition"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
