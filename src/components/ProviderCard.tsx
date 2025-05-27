// components/ProviderCard.tsx
'use client';

import React from 'react';
import type { Provider, ProviderImage, ServiceItemImage } from '@/types';
import Carousel from './Carousel';
import { ImageIcon, MapPin } from 'lucide-react';

export default function ProviderCard({ provider }: { provider: Provider }) {
  // monta o endereço completo
  const { address, neighborhood, city, state } = provider;
  const fullAddress = [address, neighborhood, city, state]
    .filter(Boolean)
    .join(', ');

  // prepara todas as imagens (logo + galeria + itens de serviço)
  const carouselImages: (ProviderImage | ServiceItemImage)[] = [
    ...(provider.logo_url ? [{ id: 'logo', image_url: provider.logo_url }] as any : []),
    ...(provider.provider_images ?? []),
    ...(provider.services
      ?.flatMap(s =>
        s.service_items?.flatMap(it => it.item_images ?? [])
      ) ?? []),
  ];

  return (
    <div
      className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          window.location.href = `/lojas/${provider.id}`;
        }
      }}
      onClick={() => (window.location.href = `/lojas/${provider.id}`)}
    >
      {/* Carousel de Imagens */}
      <div className="w-full h-56 bg-gray-100">
        {carouselImages.length > 1 ? (
          <Carousel images={carouselImages} />
        ) : carouselImages.length === 1 ? (
          <img
            src={carouselImages[0].image_url}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col justify-between">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {provider.name}
        </h3>

        {fullAddress && (
          <p className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="w-5 h-5 mr-1 text-indigo-500" />
            {fullAddress}
          </p>
        )}

        {/* Categorias derivadas dos serviços */}
        {provider.services && (
          <div className="flex flex-wrap gap-2 mb-2">
            {Array.from(
              new Set(
                provider.services.map(svc => svc.category?.name).filter(Boolean)
              )
            ).map(catName => (
              <span
                key={catName}
                className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
              >
                {catName}
              </span>
            ))}
          </div>
        )}

        {/* Lista de serviços */}
        {provider.services && (
          <div className="flex flex-wrap gap-2">
            {provider.services.map(svc => (
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
