// components/Gallery.tsx
"use client";

import { VehicleImage } from "@/types";

interface Props {
  images: VehicleImage[];
}

export default function Gallery({ images }: Props) {
  return (
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Galeria</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            alt="Imagem do veículo"
            className="w-full h-48 object-cover rounded shadow"
          />
        ))}
      </div>
    </section>
  );
}
