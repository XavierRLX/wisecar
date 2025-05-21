// src/components/ProviderCard.tsx
"use client";

import Image from "next/image";
import { ServiceProvider } from "@/types";

interface ProviderCardProps {
  provider: ServiceProvider;
  onClick?: () => void;
}

export default function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-md transition p-4 cursor-pointer"
    >
      {provider.images?.[0] ? (
        <div className="w-full h-40 relative mb-3">
          <Image
            src={provider.images[0].image_url}
            alt={provider.name}
            fill
            unoptimized
            className="object-cover rounded-lg"
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-gray-200 mb-3 rounded-lg" />
      )}

      <h2 className="text-lg font-semibold">{provider.name}</h2>
      {provider.description && (
        <p className="text-sm text-gray-600 truncate my-1">
          {provider.description}
        </p>
      )}
      <p className="text-sm text-gray-500">{provider.address}</p>
    </div>
  );
}
