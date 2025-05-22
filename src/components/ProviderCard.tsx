"use client";

import React from "react";
import type { Provider } from "@/types";
import Carousel from "./Carousel";

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow p-4 hover:shadow-lg transition">
      {/* Imagem/Carrossel */}
      <div className="h-48 w-full overflow-hidden rounded-lg">
        {provider.provider_images?.length ? (
          <Carousel images={provider.provider_images} />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="mt-4 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 truncate">
          {provider.name}
        </h3>
        {provider.address && (
          <p className="text-gray-600 text-sm mt-1 truncate">
            📍 {provider.address}
          </p>
        )}
        {provider.phone && (
          <p className="text-gray-600 text-sm mt-1 truncate">
            📞 {provider.phone}
          </p>
        )}

        {/* Categorias */}
        <div className="mt-3 flex flex-wrap gap-2">
          {provider.provider_categories?.map((pc) => (
            <span
              key={pc.category_id}
              className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full"
            >
              {pc.category.name}
            </span>
          ))}
        </div>
      </div>

      {/* Ação */}
      <button
        className="mt-4 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
      >
        Ver detalhes
      </button>
    </div>
  );
}
