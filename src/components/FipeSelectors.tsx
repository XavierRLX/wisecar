import React from "react";

interface FipeSelectorsProps {
  category: string;
  marca: string;
  modelo: string;
  ano: string;
  marcas: any[];
  modelos: any[];
  anos: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
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
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Categoria</label>
        <select name="category_id" value={category} onChange={onChange} className="w-full p-2 border rounded">
          <option value="carros">Carro</option>
          <option value="motos">Moto</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Marca (FIPE)</label>
        <select name="marca" value={marca} onChange={onChange} className="w-full p-2 border rounded">
          <option value="">Selecione a marca</option>
          {marcas.map((m) => (
            <option key={m.codigo} value={m.codigo}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Modelo (FIPE)</label>
        <select name="modelo" value={modelo} onChange={onChange} className="w-full p-2 border rounded">
          <option value="">Selecione o modelo</option>
          {modelos.map((mod) => (
            <option key={mod.codigo} value={mod.codigo}>
              {mod.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Ano (FIPE)</label>
        <select name="ano" value={ano} onChange={onChange} className="w-full p-2 border rounded">
          <option value="">Selecione o ano</option>
          {anos.map((a) => (
            <option key={a.codigo} value={a.codigo}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end">
        <button type="button" onClick={onFetchFipe} className="text-sm text-blue-500 underline">
          Buscar detalhes FIPE
        </button>
      </div>
    </div>
  );
}
