// components/ProviderCard.tsx
import React from "react";
import type { Provider } from "@/types";
import Carousel from "./Carousel";

export default function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition">
      {provider.provider_images?.length ? (
        <Carousel images={provider.provider_images} />
      ) : (
        <div className="h-48 bg-gray-200 flex items-center justify-center">Sem imagem</div>
      )}
      <h3 className="mt-2 text-lg font-semibold">{provider.name}</h3>
      <p className="text-sm text-gray-600">{provider.address}</p>
    </div>
  );
}