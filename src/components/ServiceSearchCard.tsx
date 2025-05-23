'use client';

import React from 'react';
import type { Service } from '@/types';

export interface ServiceSearchCardProps extends Service {
  providerName: string;
  providerId: string;
  providerLogoUrl?: string;
}

export default function ServiceSearchCard({
  id,
  name,
  service_items,
  providerName,
  providerLogoUrl,
}: ServiceSearchCardProps) {
  // tenta pegar a primeira imagem do primeiro item
  const imgUrl =
    service_items?.[0]?.item_images?.[0]?.image_url ?? providerLogoUrl;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Imagem */}
      <div className="h-40 bg-gray-100 rounded-md overflow-hidden mb-4 flex items-center justify-center">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-400">Sem imagem</div>
        )}
      </div>

      {/* Conteúdo */}
      <h4 className="text-lg font-semibold text-gray-900 mb-1 truncate">
        {name}
      </h4>
      <p className="text-sm text-gray-600 truncate">
        {providerName}
      </p>
    </div>
  );
}
