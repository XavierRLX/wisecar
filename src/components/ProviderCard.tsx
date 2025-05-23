'use client';

import React from 'react';
import type { Provider } from '@/types';
import Carousel from './Carousel';
import { ImageIcon, MapPin } from 'lucide-react'; // use algum ícone de placeholder

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">
      {/* Logo ou Galeria */}
      <div className="h-40 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
        {provider.logo_url ? (
          <img
            src={provider.logo_url}
            alt={`Logo de ${provider.name}`}
            className="h-full object-contain"
          />
        ) : provider.provider_images?.length ? (
          <Carousel images={provider.provider_images} />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-8 h-8 mb-1" />
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold text-gray-900 truncate mb-2">
          {provider.name}
        </h3>
        {provider.address && (
          <p className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" /> {provider.address}
          </p>
        )}

        {/* Categorias */}
        <div className="mt-auto flex flex-wrap gap-2">
          {provider.provider_categories?.map((pc) => (
            <span
              key={pc.category_id}
              className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              {pc.category.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
