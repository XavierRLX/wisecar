// components/ServiceSearchCard.tsx
'use client';

import React from 'react';
import type { ServiceItemImage } from '@/types';

export interface ServiceSearchCardProps {
  id: string;
  name: string;
  service_items?: {
    id: string;
    item_images?: ServiceItemImage[];
  }[];
  providerName: string;
  providerId: string;
  providerLogoUrl?: string;
}

export default function ServiceSearchCard({
  name,
  service_items,
  providerName,
  providerLogoUrl,
}: ServiceSearchCardProps) {
  const serviceImgUrl =
    service_items?.[0]?.item_images?.[0]?.image_url;

  const imgUrl = serviceImgUrl ?? providerLogoUrl;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col hover:shadow-lg transition-shadow duration-300">
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
      <p className="text-sm text-gray-600 truncate">{providerName}</p>
    </div>
  );
}
