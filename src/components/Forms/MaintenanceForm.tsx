// components/MaintenanceForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

// ---- Forms interfaces ----
export interface PartForm {
  id?: string;
  name: string;
  brand: string;
  purchase_place: string;
  quantity: string;
  price: string;
}

export interface DocForm {
  title: string;
  file: File | null;
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
  docs: DocForm[];
}

interface MaintenanceFormProps {
  initial: MaintenanceValues;
  vehicles?: { id: string; brand: string; model: string }[];
  selectedVehicle?: string;
  onVehicleChange?: (id: string) => void;
  onSubmit: (values: MaintenanceValues) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
}

// ---- Component ----
export default function MaintenanceForm({
  initial,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  onSubmit,
  onCancel,
  submitting,
}: MaintenanceFormProps) {
  const [values, setValues] = useState(initial);
  const [parts, setParts] = useState<PartForm[]>(initial.parts);
  const [docs, setDocs] = useState<DocForm[]>(initial.docs);
  const [newPart, setNewPart] = useState<PartForm>({
    name: "",
    brand: "",
    purchase_place: "",
    quantity: "",
    price: "",
  });
  const [newDoc, setNewDoc] = useState<DocForm>({ title: "", file: null });
  const [error, setError] = useState<string | null>(null);

  // calculate totals
  const partsTotal = useMemo(
    () =>
      parts.reduce(
        (sum, p) =>
          sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0),
        0
      ),
    [parts]
  );
  const totalCost = useMemo(
    () => partsTotal + (parseFloat(values.laborCost) || 0),
    [partsTotal, values.laborCost]
  );

  // handlers for parts
  function handleAddPart() {
    if (!newPart.name.trim()) {
      setError("Informe o nome da peça");
      return;
    }
    setError(null);
    setParts((arr) => [...arr, newPart]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: "", price: "" });
  }
  function handleRemovePart(i: number) {
    setParts((arr) => arr.filter((_, idx) => idx !== i));
  }

  // handlers for docs
  function handleAddDoc() {
    if (!newDoc.title.trim() || !newDoc.file) {
      setError("Informe título e selecione o arquivo");
      return;
    }
    setError(null);
    setDocs((arr) => [...arr, newDoc]);
    setNewDoc({ title: "", file: null });
  }
  function handleRemoveDoc(i: number) {
    setDocs((arr) => arr.filter((_, idx) => idx !== i));
  }

  // submit
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ ...values, parts, docs });
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg space-y-6"
    >
      {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

      {/* Veículo */}
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

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome *
        </label>
        <input
          required
          value={values.maintenanceName}
          onChange={(e) =>
            setValues((v) => ({ ...v, maintenanceName: e.target.value }))
          }
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Status & Tipo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={values.status}
            onChange={(e) =>
              setValues((v) => ({ ...v, status: e.target.value as any }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>A fazer</option>
            <option>Feito</option>
            <option>Cancelado</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo
          </label>
          <select
            value={values.maintenanceType}
            onChange={(e) =>
              setValues((v) => ({ ...v, maintenanceType: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="preventiva">Preventiva</option>
            <option value="corretiva">Corretiva</option>
            <option value="periodica">Periódica</option>
            <option value="outro">Outro</option>
          </select>
        </div>
      </div>

      {/* Datas & KMs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Agendada
          </label>
          <input
            type="date"
            value={values.scheduledDate}
            onChange={(e) =>
              setValues((v) => ({ ...v, scheduledDate: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Km Agendado
          </label>
          <input
            type="number"
            value={values.scheduledKm}
            onChange={(e) =>
              setValues((v) => ({ ...v, scheduledKm: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Conclusão */}
      {values.status === "Feito" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Conclusão
            </label>
            <input
              type="date"
              value={values.completedDate}
              onChange={(e) =>
                setValues((v) => ({ ...v, completedDate: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Km Concluído
            </label>
            <input
              type="number"
              value={values.completedKm}
              onChange={(e) =>
                setValues((v) => ({ ...v, completedKm: e.target.value }))
              }
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      {/* Oficina & Observações */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Oficina / Profissional
          </label>
          <input
            value={values.provider}
            onChange={(e) =>
              setValues((v) => ({ ...v, provider: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações
          </label>
          <textarea
            rows={3}
            value={values.notes}
            onChange={(e) =>
              setValues((v) => ({ ...v, notes: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

       {/* ==== Documentos ==== */}
       <div className="space-y-2">
        <h3 className="text-lg font-medium">Documentos</h3>

        {docs.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex-1">{d.title}</span>
            <a
              href={URL.createObjectURL(d.file!)}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Ver
            </a>
            <button
              type="button"
              onClick={() => handleRemoveDoc(i)}
              className="text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Título do documento"
            value={newDoc.title}
            onChange={(e) => setNewDoc((nd) => ({ ...nd, title: e.target.value }))}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            onChange={(e) => setNewDoc((nd) => ({ ...nd, file: e.target.files?.[0] ?? null }))}
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={handleAddDoc}
          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
        >
          <PlusCircle className="w-5 h-5" /> Adicionar Documento
        </button>
      </div>

      {/* Custo & Peças */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custo Mão de Obra (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={values.laborCost}
            onChange={(e) =>
              setValues((v) => ({ ...v, laborCost: e.target.value }))
            }
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* novoPart inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 bg-gray-50 p-3 rounded">
          <input
            value={newPart.name}
            onChange={(e) =>
              setNewPart((p) => ({ ...p, name: e.target.value }))
            }
            placeholder="Nome da peça"
            className="sm:col-span-2 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newPart.brand}
            onChange={(e) =>
              setNewPart((p) => ({ ...p, brand: e.target.value }))
            }
            placeholder="Marca"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            value={newPart.purchase_place}
            onChange={(e) =>
              setNewPart((p) => ({ ...p, purchase_place: e.target.value }))
            }
            placeholder="Onde comprou"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min={1}
            value={newPart.quantity}
            onChange={(e) =>
              setNewPart((p) => ({ ...p, quantity: e.target.value }))
            }
            placeholder="Qtd"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            step="0.01"
            min={0}
            value={newPart.price}
            onChange={(e) =>
              setNewPart((p) => ({ ...p, price: e.target.value }))
            }
            placeholder="Preço"
            className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={handleAddPart}
            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
          >
            <PlusCircle className="w-5 h-5" /> Adicionar Peça
          </button>
        </div>

        {parts.length > 0 && (
          <ul className="space-y-2">
            {parts.map((p, i) => (
              <li
                key={i}
                className="flex items-center justify-between bg-gray-100 p-3 rounded"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-600">
                    {p.brand && `${p.brand} • `}Qtd: {p.quantity} • R${" "}
                    {parseFloat(p.price).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemovePart(i)}
                  className="text-red-600 hover:text-red-800"
                >
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

     

      {/* Salvar + Cancelar */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {submitting ? "Salvando..." : "Salvar"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
