"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { MaintenanceRecord, MaintenancePart } from "@/types";

// tipo auxiliar
type MaintenanceWithParts = MaintenanceRecord & {
  maintenance_parts: MaintenancePart[];
};

export default function MaintenancePage() {
  const { id: vehicleId } = useParams();
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceWithParts[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return router.push("/login");

    const { data, error } = await supabase
      .from("maintenance_records")
      .select("*, maintenance_parts(*)")
      .eq("vehicle_id", vehicleId)
      .order("scheduled_date", { ascending: true });

    if (!error && data) {
      setRecords(data as MaintenanceWithParts[]);
    }
    setLoading(false);
  }, [vehicleId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (recordId: string) => {
    if (!confirm("Deseja realmente excluir esta manutenção?")) return;
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", recordId);

    if (!error) {
      setRecords((prev) => prev.filter((r) => r.id !== recordId));
    } else {
      alert("Erro ao excluir: " + error.message);
    }
  };

  const totalGasto = useMemo(
    () => records.reduce((sum, r) => sum + (r.cost ?? 0), 0),
    [records]
  );

  if (loading) return <LoadingState message="Carregando manutenções..." />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manutenções do Veículo</h1>
          <button
            onClick={() => router.push(`/veiculos/${vehicleId}/manutencoes/novo`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Adicionar Manutenção
          </button>
        </div>

        {records.length > 0 && (
          <div className="flex justify-between bg-blue-50 p-4 rounded-lg shadow-inner">
            <div className="text-gray-700">
              <strong>Total de Manutenções:</strong> {records.length}
            </div>
            <div className="text-gray-800 font-semibold">
              <strong>Total Gasto:</strong> R$ {totalGasto.toFixed(2)}
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <EmptyState
            title="Nenhuma manutenção encontrada"
            description="Você ainda não cadastrou nenhuma manutenção para este veículo."
            buttonText="Nova Manutenção"
            redirectTo={`/veiculos/${vehicleId}/manutencoes/novo`}
          />
        ) : (
          <div className="space-y-6">
            {records.map((r) => (
              <div
                key={r.id}
                onClick={() =>
                  router.push(`/veiculos/${vehicleId}/manutencoes/${r.id}`)
                }
                className="relative bg-white shadow rounded-lg p-4 space-y-4 cursor-pointer hover:shadow-lg transition"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(r.id);
                  }}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
                  aria-label="Excluir manutenção"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">{r.maintenance_name}</h2>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === "Feito"
                        ? "bg-green-100 text-green-800"
                        : r.status === "Cancelado"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                  <div>
                    <strong>Tipo:</strong> {r.maintenance_type}
                  </div>
                  <div>
                    <strong>Agendada:</strong> {r.scheduled_date ?? "—"}
                  </div>
                  <div>
                    <strong>Km Agendado:</strong> {r.scheduled_km ?? "—"}
                  </div>
                  {r.status === "Feito" && (
                    <>
                      <div>
                        <strong>Concluída:</strong> {r.completed_date}
                      </div>
                      <div>
                        <strong>Km Concluído:</strong> {r.completed_km}
                      </div>
                    </>
                  )}
                  <div>
                    <strong>Oficina:</strong> {r.provider ?? "—"}
                  </div>
                  <div>
                    <strong>Notas:</strong> {r.notes ?? "—"}
                  </div>
                </div>

                {r.maintenance_parts!.length > 0 && (
                  <div>
                    <h3 className="font-medium">Peças:</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {r.maintenance_parts!.map((p) => (
                        <li
                          key={p.id}
                          className="flex justify-between bg-gray-50 p-2 rounded"
                        >
                          <div>
                            <div>
                              <strong>{p.name}</strong> (x{p.quantity})
                            </div>
                            <div className="text-gray-600">
                              {p.brand && <span>{p.brand} · </span>}
                              {p.purchase_place}
                            </div>
                          </div>
                          <div className="font-medium">
                            R$ {(p.price * p.quantity).toFixed(2)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end text-base font-semibold">
                  Total: R$ {r.cost?.toFixed(2) ?? "0.00"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
