// app/manutencoes/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Edit2, Trash2, ArrowLeft } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import { MaintenanceRecord, MaintenancePart, Vehicle } from "@/types";

type MaintenanceWithRelations = MaintenanceRecord & {
  maintenance_parts: MaintenancePart[];
  vehicle: Pick<Vehicle, "id" | "brand" | "model">;
};

export default function MaintenanceViewPage() {
  const { id } = useParams();              // id da manutenção
  const router = useRouter();
  const [record, setRecord] = useState<MaintenanceWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      // consulta incluindo peça e veículo
      const { data, error } = await supabase
        .from("maintenance_records")
        .select(`
          *,
          maintenance_parts(*),
          vehicle:vehicles(id, brand, model)
        `)
        .eq("id", id)
        .single();

      if (!error && data) {
        setRecord(data as MaintenanceWithRelations);
      }
      setLoading(false);
    }
    if (id) load();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm("Deseja realmente excluir esta manutenção?")) return;
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", id);
    if (!error) router.push("/manutencoes");
    else alert("Erro: " + error.message);
  };

  if (loading) return <LoadingState message="Carregando detalhes..." />;

  if (!record)
    return (
      <EmptyState
        title="Manutenção não encontrada"
        description="Este registro não existe ou foi removido."
        buttonText="Voltar"
        redirectTo="/manutencoes"
      />
    );

  const {
    maintenance_name,
    status,
    maintenance_type,
    scheduled_date,
    scheduled_km,
    completed_date,
    completed_km,
    provider,
    notes,
    maintenance_parts,
    cost,
    created_at,
    vehicle,
  } = record;

  const partsTotal = maintenance_parts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  const laborCost = ((cost ?? 0) - partsTotal).toFixed(2);

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg space-y-8">
        {/* Voltar + Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push("/manutencoes")}
            className="text-gray-600 hover:text-gray-800 transition"
            aria-label="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">{maintenance_name}</h1>
        </div>
        <p className="text-sm text-gray-500">
          Veículo: {vehicle.brand} {vehicle.model}
          <span className="mx-2">•</span>
          Criado em: {created_at?.split("T")[0]}
        </p>

        {/* Ações Editar / Excluir */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/manutencoes/${id}/editar`)}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <Edit2 className="w-5 h-5" /> Editar
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-5 h-5" /> Excluir
          </button>
        </div>

        {/* Status */}
        <span
          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
            status === "Feito"
              ? "bg-green-100 text-green-800"
              : status === "Cancelado"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status}
        </span>

        {/* Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          <div className="space-y-2">
            <p>
              <strong>Tipo:</strong> {maintenance_type}
            </p>
            <p>
              <strong>Data Agendada:</strong> {scheduled_date ?? "—"}
            </p>
            <p>
              <strong>Km Agendado:</strong> {scheduled_km ?? "—"}
            </p>
          </div>
          <div className="space-y-2">
            {status === "Feito" && (
              <>
                <p>
                  <strong>Data Concluída:</strong> {completed_date}
                </p>
                <p>
                  <strong>Km Concluído:</strong> {completed_km}
                </p>
              </>
            )}
            <p>
              <strong>Oficina:</strong> {provider ?? "—"}
            </p>
            <p className="whitespace-pre-wrap">
              <strong>Observações:</strong> {notes ?? "—"}
            </p>
          </div>
        </div>

        {/* Peças */}
        {maintenance_parts.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Peças Utilizadas</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Nome</th>
                    <th className="px-4 py-2">Marca</th>
                    <th className="px-4 py-2">Qtd</th>
                    <th className="px-4 py-2">Preço Unit.</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Local Compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {maintenance_parts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2">{p.name}</td>
                      <td className="px-4 py-2">{p.brand || "—"}</td>
                      <td className="px-4 py-2">{p.quantity}</td>
                      <td className="px-4 py-2">R$ {p.price.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        R$ {(p.price * p.quantity).toFixed(2)}
                      </td>
                      <td className="px-4 py-2">{p.purchase_place}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 font-medium">
          <p>Custo Mão de Obra: R$ {laborCost}</p>
          <p>Total Peças: R$ {partsTotal.toFixed(2)}</p>
        </div>
        <div className="text-right text-2xl font-semibold">
          Custo Total: R$ {cost?.toFixed(2) ?? "0.00"}
        </div>
      </div>
    </AuthGuard>
  );
}
