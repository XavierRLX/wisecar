// app/manutencoes/[id]/editar/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";

interface PartForm {
  id?: string;
  name: string;
  brand: string;
  purchase_place: string;
  quantity: number;
  price: number;
}

export default function EditMaintenancePage() {
  const router = useRouter();
  const { id } = useParams();

  // Form state
  const [maintenanceName, setMaintenanceName] = useState("");
  const [status, setStatus] = useState<"A fazer" | "Feito" | "Cancelado">(
    "A fazer"
  );
  const [maintenanceType, setMaintenanceType] = useState("preventiva");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledKm, setScheduledKm] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [completedKm, setCompletedKm] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [parts, setParts] = useState<PartForm[]>([]);
  const [newPart, setNewPart] = useState<PartForm>({
    name: "",
    brand: "",
    purchase_place: "",
    quantity: 1,
    price: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // totals
  const partsTotal = useMemo(
    () => parts.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [parts]
  );
  const totalCost = useMemo(
    () => partsTotal + (parseFloat(laborCost) || 0),
    [partsTotal, laborCost]
  );

  // Load existing record + parts
  useEffect(() => {
    async function load() {
      setLoading(true);
      // 1) fetch maintenance record
      const { data: rec, error: e1 } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("id", id)
        .single();
      if (e1 || !rec) {
        setError("Não foi possível carregar a manutenção.");
        setLoading(false);
        return;
      }

      // populate form
      setMaintenanceName(rec.maintenance_name);
      setStatus(rec.status);
      setMaintenanceType(rec.maintenance_type);
      setScheduledDate(rec.scheduled_date ?? "");
      setScheduledKm(rec.scheduled_km?.toString() ?? "");
      setCompletedDate(rec.completed_date ?? "");
      setCompletedKm(rec.completed_km?.toString() ?? "");
      setProvider(rec.provider ?? "");
      setNotes(rec.notes ?? "");
      setLaborCost((rec.cost ?? 0).toString());

      // 2) fetch parts
      const { data: ps, error: e2 } = await supabase
        .from("maintenance_parts")
        .select("*")
        .eq("maintenance_record_id", id);
      if (!e2 && ps) {
        setParts(
          ps.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand ?? "",
            purchase_place: p.purchase_place ?? "",
            quantity: p.quantity,
            price: p.price,
          }))
        );
      }
      setLoading(false);
    }
    load();
  }, [id]);

  function handleAddPart() {
    if (!newPart.name.trim()) {
      alert("Informe o nome da peça");
      return;
    }
    setParts((arr) => [...arr, newPart]);
    setNewPart({ name: "", brand: "", purchase_place: "", quantity: 1, price: 0 });
  }

  function handleRemovePart(idx: number) {
    setParts((arr) => arr.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // 1) update maintenance_records
    const { error: e1 } = await supabase
      .from("maintenance_records")
      .update({
        maintenance_name: maintenanceName,
        status,
        maintenance_type: maintenanceType,
        scheduled_date: scheduledDate || null,
        scheduled_km: scheduledKm ? parseInt(scheduledKm) : null,
        completed_date: completedDate || null,
        completed_km: completedKm ? parseInt(completedKm) : null,
        provider: provider || null,
        notes: notes || null,
        cost: totalCost,
      })
      .eq("id", id);

    if (e1) {
      setError(e1.message);
      setSaving(false);
      return;
    }

    // 2) delete old parts, then re-insert
    const { error: e2 } = await supabase
      .from("maintenance_parts")
      .delete()
      .eq("maintenance_record_id", id);
    if (e2) {
      setError(e2.message);
      setSaving(false);
      return;
    }

    const { error: e3 } = await supabase
      .from("maintenance_parts")
      .insert(
        parts.map((p) => ({
          maintenance_record_id: id,
          name: p.name,
          brand: p.brand || null,
          purchase_place: p.purchase_place || null,
          quantity: p.quantity,
          price: p.price,
        }))
      );
    if (e3) {
      setError(e3.message);
      setSaving(false);
      return;
    }

    router.push("/manutencoes");
  }

  if (loading) return <LoadingState message="Carregando dados…" />;

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center">Editar Manutenção</h1>
        {error && (
          <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome da manutenção */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              value={maintenanceName}
              onChange={(e) => setMaintenanceName(e.target.value)}
              required
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
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "A fazer" | "Feito" | "Cancelado")
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

          {/* Datas e KMs */}
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
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {status === "Feito" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Conclusão
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
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Oficina e Observações */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oficina / Profissional
              </label>
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              />
            </div>
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
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Adicionar peça */}
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

            {/* Formulário de nova peça */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-gray-50 p-3 rounded">
              <div className="sm:col-span-2">
                <input
                  value={newPart.name}
                  onChange={(e) =>
                    setNewPart({ ...newPart, name: e.target.value })
                  }
                  placeholder="Nome da peça"
                  className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <input
                value={newPart.brand}
                onChange={(e) =>
                  setNewPart({ ...newPart, brand: e.target.value })
                }
                placeholder="Marca"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={newPart.purchase_place}
                onChange={(e) =>
                  setNewPart({ ...newPart, purchase_place: e.target.value })
                }
                placeholder="Onde comprou"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                min={1}
                value={newPart.quantity}
                onChange={(e) =>
                  setNewPart({
                    ...newPart,
                    quantity: parseInt(e.target.value) || 1,
                  })
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
                  setNewPart({
                    ...newPart,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Preço"
                className="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Lista de peças */}
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
                        {p.brand && `${p.brand} • `}
                        Qtd: {p.quantity} • R$ {p.price.toFixed(2)}
                      </p>
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

            {/* Totais */}
            <div className="text-right font-semibold text-gray-800">
              Peças: R$ {partsTotal.toFixed(2)} — Total: R${" "}
              {totalCost.toFixed(2)}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              {saving ? "Salvando..." : "Atualizar Manutenção"}
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
