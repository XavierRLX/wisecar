// components/MaintenanceForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

export interface PartForm {
  id?: string;
  name: string;
  brand: string;
  purchase_place: string;
  quantity: number;
  price: number;
}

export interface MaintenanceValues {
  vehicleId?: string;
  maintenanceName: string;
  status: "A fazer" | "Feito" | "Cancelado";
  maintenanceType: string;
  scheduledDate: string;
  scheduledKm: string;
  completedDate: string;
  completedKm: string;
  provider: string;
  notes: string;
  laborCost: string;
  parts: PartForm[];
}

interface MaintenanceFormProps {
  /** initial values (for “edit”) or blanks (for “new”) */
  initial: MaintenanceValues;
  /** whether to show the vehicle selector (only on “new”) */
  vehicles?: { id: string; brand: string; model: string }[];
  selectedVehicle?: string;
  onVehicleChange?: (id: string) => void;
  onSubmit: (values: MaintenanceValues) => Promise<void>;
  submitting: boolean;
}

export default function MaintenanceForm({
  initial,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  onSubmit,
  submitting,
}: MaintenanceFormProps) {
  const [values, setValues] = useState(initial);
  const [parts, setParts] = useState<PartForm[]>(initial.parts);
  const [newPart, setNewPart] = useState<PartForm>({
    name: "",
    brand: "",
    purchase_place: "",
    quantity: 1,
    price: 0,
  });
  const [error, setError] = useState<string | null>(null);

  // derived totals
  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [parts]
  );
  const totalCost = useMemo(
    () => partsTotal + (parseFloat(values.laborCost) || 0),
    [partsTotal, values.laborCost]
  );

  function handleAddPart() {
    if (!newPart.name.trim()) {
      setError("Informe o nome da peça");
      return;
    }
    setError(null);
    setParts((arr) => [...arr, newPart]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: 1, price: 0 });
  }

  function handleRemovePart(i: number) {
    setParts((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ ...values, parts });
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg space-y-6">
      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Vehicle selector (optional) */}
      {vehicles && onVehicleChange && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veículo *
          </label>
          <select
            value={selectedVehicle}
            onChange={(e) => onVehicleChange(e.target.value)}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione o veículo</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          required
          value={values.maintenanceName}
          onChange={(e) => setValues(v => ({ ...v, maintenanceName: e.target.value }))}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status & Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={values.status}
            onChange={(e) => setValues(v => ({ ...v, status: e.target.value as any }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>A fazer</option>
            <option>Feito</option>
            <option>Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={values.maintenanceType}
            onChange={(e) => setValues(v => ({ ...v, maintenanceType: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="periodica">Periódica</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      {/* Dates & KMs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Agendada</label>
          <input
            type="date"
            value={values.scheduledDate}
            onChange={(e) => setValues(v => ({ ...v, scheduledDate: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Km Agendado</label>
          <input
            type="number"
            value={values.scheduledKm}
            onChange={(e) => setValues(v => ({ ...v, scheduledKm: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {values.status === "Feito" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Conclusão</label>
            <input
              type="date"
              value={values.completedDate}
              onChange={(e) => setValues(v => ({ ...v, completedDate: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Km Concluído</label>
            <input
              type="number"
              value={values.completedKm}
              onChange={(e) => setValues(v => ({ ...v, completedKm: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Provider & Notes */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Oficina / Profissional</label>
          <input
            value={values.provider}
            onChange={(e) => setValues(v => ({ ...v, provider: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea
            rows={3}
            value={values.notes}
            onChange={(e) => setValues(v => ({ ...v, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Labor cost & parts */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Custo Mão de Obra (R$)</label>
          <input
            type="number"
            step="0.01"
            value={values.laborCost}
            onChange={(e) => setValues(v => ({ ...v, laborCost: e.target.value }))}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-between items-center">
          <h2 className="font-medium">Peças</h2>
          <button
            type="button"
            onClick={handleAddPart}
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <PlusCircle className="w-5 h-5" /> Adicionar
          </button>
        </div>

        {/* new-part inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded">
          <div className="sm:col-span-2">
            <input
              value={newPart.name}
              onChange={(e) => setNewPart(p => ({ ...p, name: e.target.value }))}
              placeholder="Nome da peça"
              className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            value={newPart.brand}
            onChange={(e) => setNewPart(p => ({ ...p, brand: e.target.value }))}
            placeholder="Marca"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newPart.purchase_place}
            onChange={(e) => setNewPart(p => ({ ...p, purchase_place: e.target.value }))}
            placeholder="Onde comprou"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min={1}
            value={newPart.quantity}
            onChange={(e) => setNewPart(p => ({ ...p, quantity: +e.target.value || 1 }))}
            placeholder="Qtd"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            min={0}
            value={newPart.price}
            onChange={(e) => setNewPart(p => ({ ...p, price: +e.target.value || 0 }))}
            placeholder="Preço"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* existing parts */}
        {parts.length > 0 && (
          <ul className="space-y-2">
            {parts.map((p, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-100 p-3 rounded">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-600">
                    {p.brand && `${p.brand} • `}Qtd: {p.quantity} • R$ {p.price.toFixed(2)}
                  </p>
                </div>
                <button onClick={() => handleRemovePart(i)} className="text-red-600 hover:text-red-800">
                  <Trash2 className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="text-right font-semibold text-gray-800">
          Peças: R$ {partsTotal.toFixed(2)} — Total: R$ {totalCost.toFixed(2)}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
