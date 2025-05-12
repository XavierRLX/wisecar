// app/veiculos/[id]/manutencoes/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trash2, PlusCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { MaintenanceRecord, MaintenancePart } from "@/types";

type MaintenanceWithParts = MaintenanceRecord & {
  maintenance_parts: MaintenancePart[];
};

export default function MaintenancePage() {
  const { id: vehicleId } = useParams();
  const router = useRouter();

  const [records, setRecords] = useState<MaintenanceWithParts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);

  // filtros
  const [statusFilter, setStatusFilter] = useState<"" | "A fazer" | "Feito" | "Cancelado">("");
  const [typeFilter, setTypeFilter] = useState<string>("");

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

    if (!error && data) setRecords(data as MaintenanceWithParts[]);
    setLoading(false);
  }, [vehicleId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (recordId: string) => {
    if (!confirm("Deseja excluir esta manutenção?")) return;
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", recordId);
    if (!error) setRecords(prev => prev.filter(r => r.id !== recordId));
    else alert("Erro: " + error.message);
  };

  // altera status na API e no estado local
  const handleStatusChange = async (id: string, newStatus: MaintenanceRecord["status"]) => {
    const { error } = await supabase
      .from("maintenance_records")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setRecords(prev =>
        prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
      );
      setOpenStatusMenuId(null);
    } else {
      alert("Erro ao atualizar status: " + error.message);
    }
  };

  // aplica filtros
  const filtered = useMemo(() => {
    return records.filter(r => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (typeFilter && r.maintenance_type !== typeFilter) return false;
      return true;
    });
  }, [records, statusFilter, typeFilter]);

  const totalGasto = useMemo(
    () => filtered.reduce((sum, r) => sum + (r.cost ?? 0), 0),
    [filtered]
  );

  if (loading) return <LoadingState message="Carregando manutenções..." />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4 max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold">Manutenções</h1>
          <button
            onClick={() => router.push(`/veiculos/${vehicleId}/manutencoes/novo`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            <PlusCircle className="w-5 h-5"/> Nova
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Pills */}
          <div className="flex space-x-2 bg-gray-100 rounded-full p-1">
            {["", "A fazer", "Feito", "Cancelado"].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition
                  ${statusFilter === st
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-200"}`}
              >
                {st === "" ? "Todos" : st}
              </button>
            ))}
          </div>

          {/* Tipo Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTypeMenu(v => !v)}
              className="flex items-center gap-1 px-3 py-2 border rounded-md text-gray-700 hover:border-gray-400 transition"
            >
              {typeFilter || "Todos os Tipos"}
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            {showTypeMenu && (
              <ul className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-10">
                <li
                  onClick={() => { setTypeFilter(""); setShowTypeMenu(false); }}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Todos
                </li>
                {Array.from(new Set(records.map(r => r.maintenance_type))).map(t => (
                  <li
                    key={t}
                    onClick={() => { setTypeFilter(t); setShowTypeMenu(false); }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Resumo */}
        {filtered.length > 0 && (
          <div className="flex justify-between bg-blue-50 p-4 rounded-lg shadow-inner">
            <span className="text-gray-700">
              <strong>Itens:</strong> {filtered.length}
            </span>
            <span className="text-gray-800 font-semibold">
              <strong>Total:</strong> R$ {totalGasto.toFixed(2)}
            </span>
          </div>
        )}

        {/* Lista ou Empty */}
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma manutenção"
            description="Use o botão acima para criar sua primeira manutenção."
            buttonText="Nova Manutenção"
            redirectTo={`/veiculos/${vehicleId}/manutencoes/novo`}
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(r => {
              const partsTotal = r.maintenance_parts.reduce(
                (sum, p) => sum + p.price * p.quantity,
                0
              );
              return (
                <div
                  key={r.id}
                  className="relative bg-white shadow rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/veiculos/${vehicleId}/manutencoes/${r.id}`)}
                >
                  {/* Botão Excluir */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-600 transition"
                    aria-label="Excluir"
                  >
                    <Trash2 className="w-5 h-5"/>
                  </button>

                  {/* Topo: título + badge status */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">{r.maintenance_name}</h2>

                    <div className="relative">
                      <span
                        onClick={e => { e.stopPropagation(); setOpenStatusMenuId(r.id); }}
                        className={`px-2 py-0.5 text-xs font-medium rounded-full cursor-pointer select-none
                          ${r.status === "Feito"
                            ? "bg-green-100 text-green-800"
                            : r.status === "Cancelado"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"}`}
                      >
                        {r.status}
                      </span>

                      {/* dropdown in-place */}
                      {openStatusMenuId === r.id && (
                        <ul className="absolute right-0 mt-1 w-36 bg-white border rounded-md shadow-lg z-20">
                          {["A fazer","Feito","Cancelado"].map(opt => (
                            <li
                              key={opt}
                              onClick={e => {
                                e.stopPropagation();
                                handleStatusChange(r.id, opt as any);
                              }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Detalhes resumidos */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                    <div><strong>Tipo:</strong> {r.maintenance_type}</div>
                    <div><strong>Data:</strong> {r.scheduled_date ?? "—"}</div>
                    <div><strong>KM:</strong> {r.scheduled_km ?? "—"}</div>
                  </div>

                  {/* Peças resumo */}
                  {r.maintenance_parts.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      Peças: {r.maintenance_parts.length} — R$ {partsTotal.toFixed(2)}
                    </div>
                  )}

                  {/* Rodapé: total */}
                  <div className="flex justify-end items-center mt-4">
                    <span className="text-base font-semibold">
                      R$ {r.cost?.toFixed(2) ?? "0.00"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
