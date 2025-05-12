// app/veiculos/[id]/manutencoes/novo/page.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
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

interface VehicleOption {
  id: string;
  brand: string;
  model: string;
}

export default function NewMaintenancePage() {
  const { id: vehicleIdParam } = useParams();
  const router = useRouter();

  // — Lista de veículos para seleção
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleIdParam || "");

  // — Dados da manutenção
  const [maintenanceName, setMaintenanceName] = useState("");
  const [status, setStatus] = useState<"A fazer" | "Feito" | "Cancelado">("A fazer");
  const [maintenanceType, setMaintenanceType] = useState("periodica");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledKm, setScheduledKm] = useState("");

  // — Conclusão
  const [completedDate, setCompletedDate] = useState("");
  const [completedKm, setCompletedKm] = useState("");

  // — Outros detalhes
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");

  // — Custo & Peças
  const [laborCost, setLaborCost] = useState("");
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

  // totais em tempo real
  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [parts]
  );
  const totalCost = useMemo(
    () => partsTotal + (parseFloat(laborCost) || 0),
    [partsTotal, laborCost]
  );

  // Busca veículos do usuário
  useEffect(() => {
    async function fetchVehicles() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, brand, model")
        .eq("owner_id", user.id)
        .eq("is_for_sale", false)
        .order("brand", { ascending: true })
        .order("model", { ascending: true });

      if (error) {
        console.error("Erro ao carregar veículos:", error.message);
      } else if (data) {
        setVehicles(data);
        // Define valor inicial se não veio pelo parâmetro
        if (!vehicleIdParam && data.length > 0) {
          setSelectedVehicle(data[0].id);
        }
      }
    }
    fetchVehicles();
  }, [vehicleIdParam]);

  function handleAddPart() {
    if (!newPart.name.trim()) return alert("Informe o nome da peça");
    setParts((arr) => [...arr, newPart]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: 1, price: 0 });
  }

  function handleRemovePart(i: number) {
    setParts((arr) => arr.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedVehicle) {
      return alert("Selecione o veículo para esta manutenção");
    }

    setLoading(true);
    setError(null);

    // 1) insere manutenção
    const { data, error: e1 } = await supabase
      .from("maintenance_records")
      .insert({
        vehicle_id: selectedVehicle,
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

    if (e1 || !data?.id) {
      setError(e1?.message || "Erro ao criar manutenção");
      setLoading(false);
      return;
    }

    const recordId = data.id;

    // 2) insere peças
    const { error: e2 } = await supabase
      .from("maintenance_parts")
      .insert(
        parts.map((p) => ({
          maintenance_record_id: recordId,
          name: p.name,
          brand: p.brand || null,
          purchase_place: p.purchase_place || null,
          quantity: p.quantity,
          price: p.price,
        }))
      );
    if (e2) {
      setError(e2.message);
      setLoading(false);
      return;
    }

    // 3) atualiza custo total
    const { error: e3 } = await supabase
      .from("maintenance_records")
      .update({ cost: totalCost })
      .eq("id", recordId);
    if (e3) {
      setError(e3.message);
      setLoading(false);
      return;
    }

    router.push(`/veiculos/${selectedVehicle}/manutencoes`);
  }

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">Nova Manutenção</h1>

        {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* — Seção: Veículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veículo *
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
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

          {/* — Seção: Dados da Manutenção */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Manutenção *
              </label>
              <input
                value={maintenanceName}
                onChange={(e) => setMaintenanceName(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Troca de Óleo"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>A fazer</option>
                  <option>Feito</option>
                  <option>Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Manutenção
                </label>
                <select
                  value={maintenanceType}
                  onChange={(e) => setMaintenanceType(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                  <option value="periodica">Periódica</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Agendada
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Km Agendado
                </label>
                <input
                  type="number"
                  value={scheduledKm}
                  onChange={(e) => setScheduledKm(e.target.value)}
                  placeholder="Ex: 10000"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {status === "Feito" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Conclusão
                  </label>
                  <input
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Km Concluído
                  </label>
                  <input
                    type="number"
                    value={completedKm}
                    onChange={(e) => setCompletedKm(e.target.value)}
                    placeholder="Ex: 10500"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* — Seção: Outros detalhes */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oficina / Profissional
              </label>
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Auto Mecânica Central"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anotações adicionais..."
              />
            </div>
          </div>

          {/* — Seção: Custo & Peças */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custo Mão de Obra (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                required
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Repeater de Peças */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
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

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded">
                {/* Nome da Peça (ocupa 2 colunas) */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Peça *
                  </label>
                  <input
                    value={newPart.name}
                    onChange={(e) =>
                      setNewPart({ ...newPart, name: e.target.value })
                    }
                    placeholder="Ex: Filtro de Óleo"
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Marca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    value={newPart.brand}
                    onChange={(e) =>
                      setNewPart({ ...newPart, brand: e.target.value })
                    }
                    placeholder="Ex: Bosch"
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Onde Comprou (ocupa toda a linha em sm) */}
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Onde Comprou
                  </label>
                  <input
                    value={newPart.purchase_place}
                    onChange={(e) =>
                      setNewPart({
                        ...newPart,
                        purchase_place: e.target.value,
                      })
                    }
                    placeholder="Ex: AutoPeças Central"
                    className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Qtd e Preço lado a lado */}
                <div className="sm:col-span-3 flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Qtd
                    </label>
                    <input
                      type="number"
                      value={newPart.quantity}
                      onChange={(e) =>
                        setNewPart({
                          ...newPart,
                          quantity: parseInt(e.target.value) || 1,
                        })
                      }
                      min={1}
                      className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newPart.price}
                      onChange={(e) =>
                        setNewPart({
                          ...newPart,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min={0}
                      className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de peças já adicionadas */}
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
                          {p.brand && `${p.brand} • `}Qtd: {p.quantity} • R${" "}
                          {p.price.toFixed(2)}
                        </p>
                        {p.purchase_place && (
                          <p className="text-sm text-gray-600">
                            {p.purchase_place}
                          </p>
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

              <div className="text-right text-gray-800 font-semibold">
                Peças: R$ {partsTotal.toFixed(2)} — Total Geral: R${" "}
                {totalCost.toFixed(2)}
              </div>
            </div>
          </div>

          {/* — Ações finais */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {loading ? <LoadingState message="Salvando..." /> : "Salvar Manutenção"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </AuthGuard>
  );
}
