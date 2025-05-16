// components/FipeSelectors.tsx
"use client";

import React from "react";
import Select, { SingleValue } from "react-select";

interface Option {
  value: string;
  label: string;
}

interface FipeSelectorsProps {
  category: string;
  marca: string;
  modelo: string;
  ano: string;
  marcas: { codigo: string; nome: string }[];
  modelos: { codigo: string; nome: string }[];
  anos: { codigo: string; nome: string }[];
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
  // Opções para cada select
  const categoryOptions: Option[] = [
    { value: "carros", label: "Carro" },
    { value: "motos", label: "Moto" },
  ];
  const marcaOptions: Option[] = marcas.map((m) => ({
    value: m.codigo,
    label: m.nome,
  }));
  const modeloOptions: Option[] = modelos.map((m) => ({
    value: m.codigo,
    label: m.nome,
  }));
  const anoOptions: Option[] = anos.map((a) => ({
    value: a.codigo,
    label: a.nome,
  }));

  return (
    <div className="space-y-6">
      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoria
        </label>
        <Select<Option>
          options={categoryOptions}
          value={categoryOptions.find((o) => o.value === category) ?? null}
          onChange={(opt: SingleValue<Option>) =>
            onChange({ target: { name: "category_id", value: opt?.value ?? "" } } as any)
          }
          placeholder="Selecione categoria..."
          className="react-select-container"
          classNamePrefix="react-select"
          isClearable={false}
        />
      </div>

      {/* Marca */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marca (FIPE)
        </label>
        <Select<Option>
          options={marcaOptions}
          value={marcaOptions.find((o) => o.value === marca) ?? null}
          onChange={(opt: SingleValue<Option>) =>
            onChange({ target: { name: "marca", value: opt?.value ?? "" } } as any)
          }
          placeholder="Digite para buscar marca..."
          isClearable
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Modelo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modelo (FIPE)
        </label>
        <Select<Option>
          options={modeloOptions}
          value={modeloOptions.find((o) => o.value === modelo) ?? null}
          onChange={(opt: SingleValue<Option>) =>
            onChange({ target: { name: "modelo", value: opt?.value ?? "" } } as any)
          }
          placeholder="Digite para buscar modelo..."
          isClearable
          isDisabled={!marca}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Ano */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ano (FIPE)
        </label>
        <Select<Option>
          options={anoOptions}
          value={anoOptions.find((o) => o.value === ano) ?? null}
          onChange={(opt: SingleValue<Option>) =>
            onChange({ target: { name: "ano", value: opt?.value ?? "" } } as any)
          }
          placeholder="Selecione o ano..."
          isClearable={false}
          isDisabled={!modelo}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>

      {/* Botão de buscar detalhes FIPE */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onFetchFipe}
          className="text-sm text-blue-500 hover:underline disabled:text-gray-400"
          disabled={!marca || !modelo || !ano}
        >
          Buscar detalhes FIPE
        </button>
      </div>
    </div>
  );
}
