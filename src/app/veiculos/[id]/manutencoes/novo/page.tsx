// app/veiculos/[id]/manutencoes/novo/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";

interface PartForm {
  name: string;
  brand: string;
  purchase_place: string;
  quantity: number;
  price: number;
}

export default function NewMaintenancePage() {
  const { id: vehicleId } = useParams();
  const router = useRouter();

  // campos existentes
  const [status, setStatus] = useState<"A fazer" | "Feito" | "Cancelado">("A fazer");
  const [maintenanceType, setMaintenanceType] = useState("periodica");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledKm, setScheduledKm] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [completedKm, setCompletedKm] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  // novos campos
  const [maintenanceName, setMaintenanceName] = useState(""); // título da manutenção
  const [laborCost, setLaborCost] = useState("");             // custo mão de obra

  // repeater de peças
  const [parts, setParts] = useState<PartForm[]>([]);
  const [newPart, setNewPart] = useState<PartForm>({
    name: "",
    brand: "",
    purchase_place: "",
    quantity: 1,
    price: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAddPart() {
    if (!newPart.name.trim()) {
      alert("Informe o nome da peça");
      return;
    }
    setParts((p) => [...p, newPart]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: 1, price: 0 });
  }

  function handleRemovePart(index: number) {
    setParts((p) => p.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1) cria record sem custo final
    const { data, error: err1 } = await supabase
      .from("maintenance_records")
      .insert({
        vehicle_id: vehicleId,
        maintenance_name: maintenanceName,
        status,
        maintenance_type: maintenanceType,
        scheduled_date: scheduledDate || null,
        scheduled_km: scheduledKm ? parseInt(scheduledKm) : null,
        completed_date: completedDate || null,
        completed_km: completedKm ? parseInt(completedKm) : null,
        provider: provider || null,
        notes: notes || null,
        cost: 0,
      })
      .select("id")
      .single();

    if (err1 || !data?.id) {
      setError(err1?.message || "Erro ao criar manutenção");
      setLoading(false);
      return;
    }
    const recordId = data.id;

    // 2) insere peças
    const partsPayload = parts.map((p) => ({
      maintenance_record_id: recordId,
      name: p.name,
      brand: p.brand || null,
      purchase_place: p.purchase_place || null,
      quantity: p.quantity,
      price: p.price,
    }));
    const { error: err2 } = await supabase.from("maintenance_parts").insert(partsPayload);
    if (err2) {
      setError(err2.message);
      setLoading(false);
      return;
    }

    // 3) calcula custo total
    const partsTotal = parts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const labor = parseFloat(laborCost) || 0;
    const totalCost = partsTotal + labor;

    // 4) atualiza cost final
    const { error: err3 } = await supabase
      .from("maintenance_records")
      .update({ cost: totalCost })
      .eq("id", recordId);
    if (err3) {
      setError(err3.message);
      setLoading(false);
      return;
    }

    router.push(`/veiculos/${vehicleId}/manutencoes`);
  }

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Nova Manutenção</h1>
        {error && <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Manutenção */}
          <div>
            <label className="block mb-1 font-medium">Nome da Manutenção</label>
            <input
              value={maintenanceName}
              onChange={(e) => setMaintenanceName(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              placeholder="Ex: Mão de Obra"
              required
            />
          </div>

          {/* Campos existentes */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            >
              <option>A fazer</option>
              <option>Feito</option>
              <option>Cancelado</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Tipo de Manutenção</label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            >
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="periodica">Periódica</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Km Agendado</label>
              <input
                type="number"
                value={scheduledKm}
                onChange={(e) => setScheduledKm(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              />
            </div>
          </div>

          {status === "Feito" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Data Conclusão</label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Km Concluído</label>
                <input
                  type="number"
                  value={completedKm}
                  onChange={(e) => setCompletedKm(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">Oficina / Profissional</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              rows={3}
            />
          </div>

          {/* Custo Mão de Obra */}
          <div>
            <label className="block mb-1 font-medium">Custo Mão de Obra (R$)</label>
            <input
              type="number"
              step="0.01"
              value={laborCost}
              onChange={(e) => setLaborCost(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
              required
            />
          </div>

          {/* Repeater de Peças */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-medium">Peças</h2>
              <button
                type="button"
                onClick={handleAddPart}
                className="inline-flex items-center gap-1 text-green-600 hover:text-green-800"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="text-sm">Salvar Peça</span>
              </button>
            </div>

            {/* Formulário de nova peça */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded">
              <input
                placeholder="Nome"
                value={newPart.name}
                onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                className="border rounded px-2 py-1 focus:outline-none focus:ring"
                required
              />
              <input
                placeholder="Marca"
                value={newPart.brand}
                onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                className="border rounded px-2 py-1 focus:outline-none focus:ring"
              />
              <input
                placeholder="Onde Comprou"
                value={newPart.purchase_place}
                onChange={(e) => setNewPart({ ...newPart, purchase_place: e.target.value })}
                className="border rounded px-2 py-1 focus:outline-none focus:ring"
              />
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Qtd"
                  value={newPart.quantity}
                  onChange={(e) =>
                    setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })
                  }
                  className="w-1/2 border rounded px-2 py-1 focus:outline-none focus:ring"
                  min={1}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Preço"
                  value={newPart.price}
                  onChange={(e) =>
                    setNewPart({ ...newPart, price: parseFloat(e.target.value) || 0 })
                  }
                  className="w-1/2 border rounded px-2 py-1 focus:outline-none focus:ring"
                  min={0}
                />
              </div>
            </div>

            {/* Lista de peças adicionadas */}
            {parts.length > 0 && (
              <ul className="space-y-2 mt-2">
                {parts.map((p, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-gray-600">
                        {p.brand && `${p.brand} • `}Qtd: {p.quantity} • R$ {p.price.toFixed(2)}
                      </p>
                      {p.purchase_place && (
                        <p className="text-sm text-gray-600">{p.purchase_place}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePart(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {loading ? <LoadingState message="Salvando..." /> : "Salvar Manutenção"}
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
