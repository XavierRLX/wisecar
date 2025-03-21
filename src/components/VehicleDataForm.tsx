import React from "react";

interface VehicleDataFormProps {
  preco: string;
  quilometragem: string;
  cor: string;
  combustivel: string;
  observacoes: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
}

export default function VehicleDataForm({ preco, quilometragem, cor, combustivel, observacoes, onChange }: VehicleDataFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1 font-medium">Preço</label>
          <input type="number" step="0.01" name="preco" value={preco} onChange={onChange} className="w-full p-2 border rounded" placeholder="Ex: 50000.00" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Quilometragem</label>
          <input type="number" name="quilometragem" value={quilometragem} onChange={onChange} className="w-full p-2 border rounded" placeholder="Ex: 30000" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Cor</label>
          <input type="text" name="cor" value={cor} onChange={onChange} className="w-full p-2 border rounded" placeholder="Ex: Prata" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Combustível</label>
          <input type="text" name="combustivel" value={combustivel} onChange={onChange} className="w-full p-2 border rounded" placeholder="Ex: Gasolina" />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Observações</label>
        <textarea name="observacoes" value={observacoes} onChange={onChange} className="w-full p-2 border rounded" rows={3} placeholder="Informações adicionais..." />
      </div>
    </div>
  );
}
