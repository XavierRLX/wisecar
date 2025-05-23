'use client';

import React from 'react';
import type { ServiceItem } from '@/types';
import { Tag, Info } from 'lucide-react';

export default function ServiceCard({ item }: { item: ServiceItem }) {
  const imgUrl = item.item_images?.[0]?.image_url;

  return (
    <div className="flex flex-col bg-white rounded-xl shadow hover:shadow-xl transition p-5">
      {/* Imagem */}
      <div className="h-48 w-full overflow-hidden rounded-lg mb-4">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Sem imagem</span>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">
        <h4 className="text-lg font-semibold text-gray-900 mb-2 truncate">
          {item.name}
        </h4>
        <div className="flex items-center text-gray-700 mb-3">
          <Tag className="w-5 h-5 mr-2 text-green-600" />
          <span className="font-bold text-green-600">
            {item.price?.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
        {item.details && (
          <p className="flex items-start text-gray-700 text-sm leading-relaxed line-clamp-3">
            <Info className="w-4 h-4 mr-1 mt-1 text-blue-500" />
            {item.details}
          </p>
        )}
      </div>
    </div>
  );
}
