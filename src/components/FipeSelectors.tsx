import React from "react";

interface FipeSelectorsProps {
  category: string;
  marca: string;
  modelo: string;
  ano: string;
  marcas: any[];
  modelos: any[];
  anos: any[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  onFetchFipe: () => void;
}

export default function FipeSelectors({
  category,
  marca,
  modelo,
  ano,
  marcas,
  modelos,
  anos,
  onChange,
  onFetchFipe,
}: FipeSelectorsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <select
          name="category_id"
          value={category}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="carros">Carro</option>
          <option value="motos">Moto</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marca (FIPE)
        </label>
        <select
          name="marca"
          value={marca}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione a marca</option>
          {marcas.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modelo (FIPE)
        </label>
        <select
          name="modelo"
          value={modelo}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione o modelo</option>
          {modelos.map((mod) => (
            <option key={mod.codigo} value={mod.codigo}>
              {mod.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ano (FIPE)
        </label>
        <select
          name="ano"
          value={ano}
          onChange={onChange}
          className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione o ano</option>
          {anos.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFetchFipe}
          className="text-sm text-blue-500 hover:underline focus:outline-none"
        >
          Buscar detalhes FIPE
        </button>
      </div>
    </div>
  );
}
