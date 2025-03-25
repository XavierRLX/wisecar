import React from "react";

interface SellerFormProps {
  sellerType: string;
  sellerName: string;
  phone: string;
  company: string;
  socialMedia: string;
  address: string;
  onChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >;
}

export default function SellerForm({
  sellerType,
  sellerName,
  phone,
  company,
  socialMedia,
  address,
  onChange,
}: SellerFormProps) {
  return (
    <div className="space-y-6">
      {/* Tipo de Vendedor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Vendedor
        </label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              name="vendedorTipo"
              value="particular"
              checked={sellerType === "particular"}
              onChange={onChange}
              className="mr-2"
            />
            Individual
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="vendedorTipo"
              value="profissional"
              checked={sellerType === "profissional"}
              onChange={onChange}
              className="mr-2"
            />
            Profissional
          </label>
        </div>
      </div>

      {/* Campos específicos */}
      {sellerType === "particular" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              name="nome_vendedor"
              value={sellerName}
              onChange={onChange}
              placeholder="Ex: João da Silva"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={phone}
              onChange={onChange}
              placeholder="Ex: (11) 99999-8888"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Endereço também para vendedores individuais */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={address}
              onChange={onChange}
              placeholder="Ex: Rua Principal, 123, Cidade, País"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              name="empresa"
              value={company}
              onChange={onChange}
              placeholder="Ex: AutoCenter"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vendedor
            </label>
            <input
              type="text"
              name="nome_vendedor"
              value={sellerName}
              onChange={onChange}
              placeholder="Ex: João da Silva"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={phone}
              onChange={onChange}
              placeholder="Ex: (11) 99999-8888"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Redes Sociais
            </label>
            <input
              type="text"
              name="redes_sociais"
              value={socialMedia}
              onChange={onChange}
              placeholder="Ex: @autocenter"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              name="endereco"
              value={address}
              onChange={onChange}
              placeholder="Ex: Rua Principal, 123, Cidade, País"
              className="block w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
