import React from "react";

interface SellerFormProps {
  sellerType: string;
  sellerName: string;
  phone: string;
  company: string;
  socialMedia: string;
  address: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
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
    <div className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Tipo de Vendedor</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            {/* Use "vendedorTipo" em vez de "seller_type" */}
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
      {sellerType === "particular" ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Nome</label>
            <input
              type="text"
              name="nome_vendedor"
              value={sellerName}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: João da Silva"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Telefone</label>
            <input
              type="text"
              name="telefone"
              value={phone}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: (11) 99999-8888"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={company}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: AutoCenter"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Vendedor</label>
            <input
              type="text"
              name="nome_vendedor"
              value={sellerName}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: João da Silva"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Telefone</label>
            <input
              type="text"
              name="telefone"
              value={phone}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: (11) 99999-8888"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Redes Sociais</label>
            <input
              type="text"
              name="redes_sociais"
              value={socialMedia}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: @autocenter"
            />
          </div>
          <div className="col-span-2">
            <label className="block mb-1 font-medium">Endereço</label>
            <input
              type="text"
              name="endereco"
              value={address}
              onChange={onChange}
              className="w-full p-2 border rounded"
              placeholder="Ex: Rua Principal, 123, Cidade, País"
            />
          </div>
        </div>
      )}
    </div>
  );
}
