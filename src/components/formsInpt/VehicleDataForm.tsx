"use client";

import React from "react";

interface VehicleDataFormProps {
  preco: string;
  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
  priceLabel?: string;
}

export default function VehicleDataForm({
  preco,
  quilometragem,
  cor,
  combustivel,
  observacoes,
  onChange,
  priceLabel = "Preço",
}: VehicleDataFormProps) {
  return (
    <div className="space-y-6">
      {/* Linha 1: Preço (dinâmico) e Quilometragem */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {priceLabel}
          </label>
          <input
            type="number"
            step="0.01"
            name="preco"
            value={preco}
            onChange={onChange}
            className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 50000.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quilometragem
          </label>
          <input
            type="number"
            name="quilometragem"
            value={quilometragem}
            onChange={onChange}
            className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 30000"
          />
        </div>
      </div>

      {/* Linha 2: Cor e Combustível */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cor
          </label>
          <input
            type="text"
            name="cor"
            value={cor}
            onChange={onChange}
            className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Prata"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Combustível
          </label>
          <input
            type="text"
            name="combustivel"
            value={combustivel}
            onChange={onChange}
            className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Gasolina"
          />
        </div>
      </div>
      {/* Linha 3: Observações */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observações
        </label>
        <textarea
          name="observacoes"
          value={observacoes}
          onChange={onChange}
          rows={3}
          className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Informações adicionais..."
        />
      </div>
    </div>
  );
}
