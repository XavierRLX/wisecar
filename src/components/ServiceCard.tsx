// components/ServiceCard.tsx
import React from "react";
import type { Service } from "@/types";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h4 className="font-semibold">{service.name}</h4>
      <p className="text-sm mb-2">{service.details}</p>
      <p className="font-medium">R$ {service.price?.toFixed(2)}</p>
      {service.service_images?.[0] && (
        <img src={service.service_images[0].image_url} className="mt-2 rounded" />
      )}
    </div>
  );
}