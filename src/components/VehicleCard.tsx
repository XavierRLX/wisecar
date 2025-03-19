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
  // Log para depuração
  console.log("VehicleCard", vehicle);

  return (
    <li className="relative p-4 bg-white shadow rounded flex flex-col">
      {/* Exibe a imagem do veículo se houver; caso contrário, mostra um placeholder */}
      {vehicle.vehicle_images && vehicle.vehicle_images.length > 0 ? (
        <img
          src={vehicle.vehicle_images[0].image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="w-full h-48 object-cover rounded mb-4"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded mb-4 flex items-center justify-center">
          <span className="text-gray-500">Sem imagem</span>
        </div>
      )}

      {/* Cabeçalho: nome do veículo e botão de favoritar */}
      <div className="flex justify-between items-center">
        <p className="font-semibold text-lg">
          {vehicle.brand} {vehicle.model}
        </p>
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(vehicle.id);
            }}
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

      {/* Detalhes adicionais */}
      <div className="mt-2">
        <p className="text-sm text-gray-700">Ano: {vehicle.year}</p>
        <p className="text-sm text-gray-700">Preço: R$ {vehicle.price}</p>
        <p className="text-sm text-gray-700">
          Quilometragem: {vehicle.mileage} km
        </p>
      </div>

      {/* Rodapé: botão de lixeira */}
      <div className="flex justify-end p-4">
        {onDelete ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle.id);
            }}
            className="text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Excluir veículo"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        ) : onRemoveFavorite ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFavorite(vehicle.id);
            }}
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
