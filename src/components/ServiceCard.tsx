"use client";

import React from "react";
import type { Service } from "@/types";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      {/* Imagem do serviço */}
      {service.service_images?.[0] ? (
        <img
          src={service.service_images[0].image_url}
          alt={`Foto do serviço ${service.name}`}
          className="h-40 w-full object-cover rounded-md mb-4"
        />
      ) : (
        <div className="h-40 w-full bg-gray-100 flex items-center justify-center rounded-md mb-4">
          <span className="text-gray-400">Sem imagem</span>
        </div>
      )}

      {/* Nome e preço */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-800 truncate">
          {service.name}
        </h3>
        <span className="text-green-600 font-bold">
          {service.price?.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
      </div>

      {/* Detalhes */}
      {service.details && (
        <p className="text-gray-600 text-sm line-clamp-3">
          {service.details}
        </p>
      )}
    </div>
  );
}
