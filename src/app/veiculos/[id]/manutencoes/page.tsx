// app/veiculos/[id]/manutencoes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";

interface MaintenanceRecord {
  id: string;
  status: "A fazer" | "Feito" | "Cancelado";
  maintenance_type: string;
  scheduled_date: string | null;
  scheduled_km: number | null;
  completed_date: string | null;
  completed_km: number | null;
  provider: string | null;
  cost: number | null;
  notes: string | null;
}

export default function MaintenancePage() {
  const { id: vehicleId } = useParams();
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("scheduled_date", { ascending: true });

      if (!error && data) setRecords(data as MaintenanceRecord[]);
      setLoading(false);
    }
    load();
  }, [vehicleId, router]);

  if (loading) return <LoadingState message="Carregando manutenções..." />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manutenções do Veículo</h1>
          <button
            onClick={() => router.push(`/veiculos/${vehicleId}/manutencoes/novo`)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Adicionar Manutenção
          </button>
        </div>

        {/* Empty */}
        {records.length === 0 ? (
          <EmptyState
            title="Nenhuma manutenção encontrada"
            description="Você ainda não cadastrou nenhuma manutenção para este veículo."
            buttonText="Nova Manutenção"
            redirectTo={`/veiculos/${vehicleId}/manutencoes/novo`}
          />
        ) : (
          <>
            {/* Desktop: Tabela */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Agendada</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Km Agendado</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Concluída</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Km Concluído</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Custo</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Oficina</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-800">{r.maintenance_type}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.scheduled_date ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.scheduled_km ?? "—"}</td>
                      <td className="px-4 py-2 text-sm">
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
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.completed_date ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.completed_km ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-800">
                        {r.cost != null ? `R$ ${r.cost.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-800">{r.provider ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: Cards */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
              {records.map((r) => (
                <div
                  key={r.id}
                  className="bg-white shadow rounded-lg p-4 space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{r.maintenance_type}</h2>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
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
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Agendada:</span>
                      <span>{r.scheduled_date ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Km Agendado:</span>
                      <span>{r.scheduled_km ?? "—"}</span>
                    </div>
                    {r.status === "Feito" && (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium">Concluída:</span>
                          <span>{r.completed_date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Km Concluído:</span>
                          <span>{r.completed_km}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Custo:</span>
                      <span>
                        {r.cost != null ? `R$ ${r.cost.toFixed(2)}` : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Oficina:</span>
                      <span>{r.provider ?? "—"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
