// app/veiculos/[id]/manutencoes/novo/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";

export default function NewMaintenancePage() {
  const { id: vehicleId } = useParams();
  const router = useRouter();

  // --- estados iniciais ---
  const [status, setStatus] = useState<"A fazer" | "Feito" | "Cancelado">("A fazer");
  const [maintenanceType, setMaintenanceType] = useState<
    "preventiva" | "corretiva" | "periodica" | "outro"
  >("periodica");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledKm, setScheduledKm] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [completedKm, setCompletedKm] = useState("");
  const [provider, setProvider] = useState("");
  const [cost, setCost] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- função de submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      vehicle_id: vehicleId,
      status,                                // “A fazer” | “Feito” | “Cancelado”
      maintenance_type: maintenanceType,    // preventiva | corretiva | periodica | outro
      scheduled_date: scheduledDate || null,
      scheduled_km: scheduledKm ? parseInt(scheduledKm, 10) : null,
      completed_date: completedDate || null,
      completed_km: completedKm ? parseInt(completedKm, 10) : null,
      provider: provider || null,
      cost: cost ? parseFloat(cost) : null,
      notes: notes || null,
    };

    const { error: insertError } = await supabase
      .from("maintenance_records")
      .insert(payload);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      // volta para a listagem depois de criar
      router.push(`/veiculos/${vehicleId}/manutencoes`);
    }
  }

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-6">Nova Manutenção</h1>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            Erro: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="A fazer">A fazer</option>
              <option value="Feito">Feito</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block mb-1 font-medium">Tipo de Manutenção</label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value as any)}
              className="w-full border rounded px-2 py-1"
            >
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
              <option value="periodica">Periódica</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          {/* Agendamento */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Data Agendada</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Km Agendado</label>
              <input
                type="number"
                value={scheduledKm}
                onChange={(e) => setScheduledKm(e.target.value)}
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>

          {/* Conclusão (apenas se já foi marcado como “Feito”) */}
          {status === "Feito" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Data de Conclusão</label>
                <input
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Km de Conclusão</label>
                <input
                  type="number"
                  value={completedKm}
                  onChange={(e) => setCompletedKm(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
            </div>
          )}

          {/* Detalhes extras */}
          <div>
            <label className="block mb-1 font-medium">Oficina / Profissional</label>
            <input
              type="text"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Custo (R$)</label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded px-2 py-1"
            />
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
