'use client';

import React from 'react';
import type { Provider } from '@/types';
import Carousel from './Carousel';
import { ImageIcon, MapPin } from 'lucide-react';

export default function ProviderCard({ provider }: { provider: Provider }) {
  // monta o endereço completo
  const { address, neighborhood, city, state } = provider;
  const fullAddress = [address, neighborhood, city, state]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row gap-4 p-4"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          window.location.href = `/lojas/${provider.id}`;
        }
      }}
      onClick={() => (window.location.href = `/lojas/${provider.id}`)}
    >
      {/* Imagem ou Galeria */}
      <div className="flex-shrink-0 w-full md:w-48 h-48 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {provider.logo_url ? (
          <img
            src={provider.logo_url}
            alt={`Logo de ${provider.name}`}
            className="object-contain w-full h-full"
          />
        ) : provider.provider_images?.length ? (
          <Carousel images={provider.provider_images} />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col justify-between flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {provider.name}
        </h3>

        {fullAddress && (
          <p className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-5 h-5 mr-1 text-indigo-500" />
            {fullAddress}
          </p>
        )}

        {/* Categorias */}
        <div className="flex flex-wrap gap-2 mb-2">
          {provider.provider_categories?.map((pc) => (
            <span
              key={pc.category_id}
              className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
            >
              {pc.category.name}
            </span>
          ))}
        </div>

        {/* Lista de serviços (sem título) */}
        {provider.services && provider.services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {provider.services.map((svc) => (
              <span
                key={svc.id}
                className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded-full"
              >
                {svc.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
);
}
