'use client';

import React from 'react';
import type { ServiceItem } from '@/types';
import { Tag, Info } from 'lucide-react';

export default function ServiceCard({ item }: { item: ServiceItem }) {
  const imgUrl = item.item_images?.[0]?.image_url;

  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4 items-start hover:shadow-lg transition-shadow duration-300">
      {/* Imagem */}
      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={item.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="text-gray-400 text-sm">Sem imagem</div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col flex-grow">
        <h4 className="text-lg font-semibold text-gray-900">{item.name}</h4>
        <div className="flex items-center gap-2 text-blue-600 font-semibold mt-1">
          <span>
            {item.price?.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
        </div>
        {item.details && (
          <p className="flex items-start gap-2 text-gray-600 mt-2 text-sm">
            <Info className="w-4 h-4 mt-[3px] text-blue-600 flex-shrink-0" />
            {item.details}
          </p>
        )}
      </div>
    </div>
  );
}
