// components/OptionalList.tsx
"use client";

import { Optional } from "@/types";

interface VehicleOptional {
  optional: Optional;
}

interface Props {
  vehicleOptionals?: VehicleOptional[];
}

export default function OptionalList({ vehicleOptionals }: Props) {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Opcionais</h2>
      {vehicleOptionals && vehicleOptionals.length > 0 ? (
        <ul className="list-disc pl-5">
          {vehicleOptionals.map((vo) => (
            <li key={vo.optional.id}>{vo.optional.name}</li>
          ))}
        </ul>
      ) : (
        <p>Sem opcionais.</p>
      )}
    </section>
  );
}
