// src/components/MaintenanceCard.tsx
"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { MaintenanceRecord, MaintenancePart } from "@/types";
import { formatDate, formatMoney } from "@/lib/formatters";

// Combina a interface principal com o array de peças
type MaintenanceWithParts = MaintenanceRecord & {
  maintenance_parts: MaintenancePart[];
};

interface Props {
  rec: MaintenanceWithParts;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export default function MaintenanceCard({ rec, onDelete, onClick }: Props) {
  // soma corretamente, já tipada
  const partsTotal = rec.maintenance_parts.reduce(
    (sum: number, p: MaintenancePart) => sum + p.price * p.quantity,
    0
  );

  return (
    <div
      className="relative bg-white shadow rounded-lg p-4 space-y-3 cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      {/* botão excluir */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(rec.id);
        }}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
        aria-label="Excluir manutenção"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{rec.maintenance_name}</h2>
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            rec.status === "Feito"
              ? "bg-green-100 text-green-800"
              : rec.status === "Cancelado"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {rec.status}
        </span>
      </div>

      {/* informações básicas */}
      <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>
          <strong>Agendada:</strong>{" "}
          {rec.scheduled_date ? formatDate(rec.scheduled_date) : "—"}
        </div>
        <div>
          <strong>Km Agendado:</strong> {rec.scheduled_km ?? "—"}
        </div>
        {rec.status === "Feito" && (
          <>
            <div>
              <strong>Concluída:</strong>{" "}
              {rec.completed_date ? formatDate(rec.completed_date) : "—"}
            </div>
            <div>
              <strong>Km Concluído:</strong> {rec.completed_km}
            </div>
          </>
        )}
      </div>

      {/* peças */}
      {rec.maintenance_parts.length > 0 && (
        <ul className="space-y-1 text-sm">
          {rec.maintenance_parts.map((p) => (
            <li
              key={p.id}
              className="flex justify-between bg-gray-50 p-2 rounded"
            >
              <div>
                <p className="font-medium">
                  {p.name} (x{p.quantity})
                </p>
                <p className="text-gray-600">
                  {p.brand && `${p.brand} •`} {p.purchase_place}
                </p>
              </div>
              <p className="font-medium">
                {formatMoney(p.price * p.quantity)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {/* total */}
      <div className="text-right font-semibold">
        Total: {formatMoney(rec.cost ?? partsTotal + 0)}
      </div>
    </div>
  );
}
