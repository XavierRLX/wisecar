"use client";

import { Heart, Trash2 } from "lucide-react";
import { Vehicle } from "@/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  isFavorited?: boolean;
  onToggleFavorite?: (vehicleId: string) => void;
  onDelete?: (vehicleId: string) => void;
  onRemoveFavorite?: (vehicleId: string) => void;
}

export default function VehicleCard({
  vehicle,
  isFavorited,
  onToggleFavorite,
  onDelete,
  onRemoveFavorite,
}: VehicleCardProps) {
  return (
    <li className="relative p-4 bg-white shadow rounded flex flex-col">
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">
          {vehicle.brand} {vehicle.model}
        </p>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(vehicle.id)}
            className="p-2"
            aria-label={
              isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"
            }
          >
            {isFavorited ? (
              <Heart className="h-6 w-6 text-red-500" fill="currentColor" />
            ) : (
              <Heart className="h-6 w-6 text-gray-400" />
            )}
          </button>
        )}
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-700">Ano: {vehicle.year}</p>
        <p className="text-sm text-gray-700">Preço: R$ {vehicle.price}</p>
        <p className="text-sm text-gray-700">
          Quilometragem: {vehicle.mileage} km
        </p>
      </div>
      <div className="flex justify-end p-4">
        {onDelete ? (
          <button
            onClick={() => onDelete(vehicle.id)}
            className="text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Excluir veículo"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : onRemoveFavorite ? (
          <button
            onClick={() => onRemoveFavorite(vehicle.id)}
            className="text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Remover dos favoritos"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : null}
      </div>
    </li>
  );
}
