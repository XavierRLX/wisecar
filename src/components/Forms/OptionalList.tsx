"use client";

import { Optional } from "@/types";
import { CheckCircle } from "lucide-react";

interface VehicleOptional {
  optional: Optional;
vehicleOptionals?: VehicleOptional[];
}

export default function OptionalList({ vehicleOptionals }: { vehicleOptionals?: { optional: { id: number; name: string } }[] }) {
  return (
    <section className="my-4">
      <h2 className="text-lg font-bold mb-4">Opcionais</h2>
      {vehicleOptionals && vehicleOptionals.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {vehicleOptionals.map((vo) => (
            <div key={vo.optional.id} className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">{vo.optional.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Sem opcionais.</p>
      )}
    </section>
  );

    }