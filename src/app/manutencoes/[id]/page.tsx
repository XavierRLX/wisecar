// app/manutencoes/[id]/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Trash2, Check, Edit2, ChevronDown,  Calendar, List, ClipboardList, DollarSign, Cog,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import { MaintenanceRecord, MaintenancePart, Vehicle } from "@/types";
import BackButton from "@/components/BackButton";

interface MaintenanceDetail extends MaintenanceRecord {
  maintenance_parts: MaintenancePart[];
  vehicle: Pick<Vehicle, "brand" | "model">;
}

export default function MaintenanceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<MaintenanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // cores por status
  const STATUS_STYLE = {
    "A fazer": "bg-yellow-100 text-yellow-800",
    Feito: "bg-green-100 text-green-800",
    Cancelado: "bg-red-100 text-red-800",
  } as const;

  // busca o registro
  const fetchRecord = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("maintenance_records")
      .select(`*, maintenance_parts(*), vehicle:vehicles(brand,model)`)
      .eq("id", id)
      .single();
    if (error) {
      console.error(error);
      router.back();
    } else {
      setRecord(data as MaintenanceDetail);
    }
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  // fecha menu ao clicar fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStatusMenuOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  // atualiza status
  const updateStatus = async (newStatus: MaintenanceRecord["status"]) => {
    if (!record) return;
    const { error } = await supabase
      .from("maintenance_records")
      .update({ status: newStatus })
      .eq("id", record.id);
    if (!error) {
      setRecord({ ...record, status: newStatus });
      setStatusMenuOpen(false);
    } else {
      alert("Erro ao alterar status: " + error.message);
    }
  };

  // deleta
  const handleDelete = async () => {
    if (!confirm("Confirmar exclusão desta manutenção?")) return;
    const { error } = await supabase
      .from("maintenance_records")
      .delete()
      .eq("id", id);
    if (!error) router.push("/manutencoes");
    else alert("Erro ao excluir: " + error.message);
  };

  if (loading || !record) return <LoadingState message="Carregando detalhes…" />;

  // total de peças
  const partsTotal = record.maintenance_parts.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
      <BackButton className='mb-2'/>
        {/* Header e Ações */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Cog className="w-6 h-6 text-gray-600" />
            {record.maintenance_name}
          </h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => router.push(`/manutencoes/${id}/editar`)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              <Edit2 className="w-4 h-4" /> Editar
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        </div>

        {/* Status */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setStatusMenuOpen(o => !o)}
            className={`inline-flex items-center gap-1 px-4 py-2 rounded-full font-medium ${STATUS_STYLE[record.status]}`}
          >
            <List className="w-5 h-5" /> {record.status}
            <ChevronDown className="w-4 h-4" />
          </button>
          {statusMenuOpen && (
            <ul className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              {(["A fazer", "Feito", "Cancelado"] as const).map(opt => (
                <li
                  key={opt}
                  onClick={() => updateStatus(opt)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                >
                  {opt === "Feito" ? <Check className="w-4 h-4 text-green-600" />
                    : opt === "Cancelado" ? <Trash2 className="w-4 h-4 text-red-600" />
                    : <Calendar className="w-4 h-4 text-yellow-600" />
                  }
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Detalhes principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white rounded-lg shadow p-6">
          <div className="space-y-3">
            <p className="text-sm"><strong>Veículo:</strong> {record.vehicle.brand} {record.vehicle.model}</p>
            <p className="text-sm"><strong>Tipo:</strong> {record.maintenance_type}</p>
            <p className="text-sm"><strong>Agendada:</strong> {record.scheduled_date || '—'}</p>
            <p className="text-sm"><strong>KM Agendada:</strong> {record.scheduled_km ?? '—'} km</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm"><strong>Concluída:</strong> {record.completed_date || '—'}</p>
            <p className="text-sm"><strong>KM Concluída:</strong> {record.completed_km ?? '—'} km</p>
            <p className="text-sm"><strong>Fornecedor:</strong> {record.provider || '—'}</p>
            <p className="text-sm flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <strong>Custo:</strong> R$ {(record.cost ?? 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Observações */}
        {record.notes && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
              <ClipboardList className="w-5 h-5" /> Observações
            </h2>
            <p className="text-gray-700">{record.notes}</p>
          </div>
        )}

        {/* Lista de Peças */}
        {record.maintenance_parts.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-1">
              <List className="w-5 h-5" /> Peças
            </h2>
            <ul className="divide-y divide-gray-200">
              {record.maintenance_parts.map(p => (
                <li key={p.id} className="py-2 flex justify-between items-center text-sm">
                  <span>{p.name} <em>×{p.quantity}</em></span>
                  <span>R$ {(p.price * p.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 text-right font-medium">
              Total peças: R$ {partsTotal.toFixed(2)}
            </div>
          </div>
        )}

      </div>
    </AuthGuard>
  );
}
