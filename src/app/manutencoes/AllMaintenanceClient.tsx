// app/manutencoes/AllMaintenanceClient.tsx
'use client';

import { useState, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Trash2, PlusCircle, ChevronDown } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import EnsureProfile from '@/components/EnsureProfile';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import BackButton from '@/components/BackButton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useVehicles } from '@/hooks/useVehicles';
import { useMaintenance } from '@/hooks/useMaintenance';
import type { Vehicle, MaintenancePart, MaintenanceRecord } from '@/types';

type MaintenanceWithVehicle = MaintenanceRecord & {
  maintenance_parts: MaintenancePart[];
  vehicle: Pick<Vehicle, 'id' | 'brand' | 'model'>;
};

export default function AllMaintenanceClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetVehicleId = searchParams.get('vehicleId') ?? '';

  // 👉 useCurrentUser agora retorna { userId, loading }
  const { userId, loading: loadingUser } = useCurrentUser();
  const { vehicles, loading: loadingVehicles, error: vehiclesError } = useVehicles('garage');
  const {
    records,
    loading: loadingMaintenance,
    error: maintenanceError,
    remove,
    changeStatus
  } = useMaintenance(userId ?? '');

  // filtros
  const [vehicleFilter, setVehicleFilter] = useState<string>(presetVehicleId);
  const [statusFilter, setStatusFilter] = useState<'' | 'A fazer' | 'Feito' | 'Cancelado'>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  // dropdowns
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [openStatusMenuId, setOpenStatusMenuId] = useState<string | null>(null);
  const vehicleMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef  = useRef<HTMLDivElement>(null);

  // handlers
  const handleDelete = (id: string) => {
    if (!confirm('Deseja excluir esta manutenção?')) return;
    remove(id);
  };

  const handleStatusChange = (id: string, newStatus: MaintenanceRecord['status']) => {
    changeStatus(id, newStatus);
    setOpenStatusMenuId(null);
  };

  // aplica filtros
  const filtered = useMemo(() =>
    (records as MaintenanceWithVehicle[])
      .filter(r => !vehicleFilter || r.vehicle.id === vehicleFilter)
      .filter(r => !statusFilter  || r.status === statusFilter)
      .filter(r => !typeFilter    || r.maintenance_type === typeFilter)
  , [records, vehicleFilter, statusFilter, typeFilter]);

  const totalGasto = useMemo(
    () => filtered.reduce((sum, r) => sum + (r.cost ?? 0), 0),
    [filtered]
  );

  // loading / errors
  if (loadingUser || loadingVehicles || loadingMaintenance) {
    return <LoadingState message="Carregando manutenções…" />;
  }
  if (vehiclesError || maintenanceError) {
    const msg = vehiclesError ?? maintenanceError;
    return <div className="text-red-600 p-4">Erro: {msg}</div>;
  }

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        <BackButton className="mb-2" />

        {/* Header */}
        <div className="flex justify-between items-center gap-4">
          <h1 className="text-2xl font-bold">Manutenções</h1>
          <button
            onClick={() => router.push(`/manutencoes/novo`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <PlusCircle className="w-5 h-5" /> Nova
          </button>
        </div>

        {/* Filtros */}
        <form className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Status */}
          <div className="flex flex-col">
            <label htmlFor="statusFilter" className="mb-1 text-sm font-medium text-gray-700">Status</label>
            <div id="statusFilter" className="relative inline-flex bg-gray-100 rounded-full p-1 h-10 w-full">
              <div
                style={{
                  left:
                    statusFilter === ""       ? "1px"
                  : statusFilter === "A fazer" ? "calc(100%/4 + 1px)"
                  : statusFilter === "Feito"   ? "calc(2 * 100%/4 + 1px)"
                  :                             "calc(3 * 100%/4 + 1px)",
                }}
                className="absolute top-1 h-8 w-1/4 bg-white rounded-full shadow transition-all duration-200"
              />
              {(["","A fazer","Feito","Cancelado"] as const).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors ${
                    statusFilter === st ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {st === "" ? "Todos" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Veículo */}
          <div className="flex flex-col">
            <label htmlFor="vehicleFilter" className="mb-1 text-sm font-medium text-gray-700">Veículo</label>
            <div ref={vehicleMenuRef} id="vehicleFilter" className="relative">
              <button
                type="button"
                onClick={() => setShowVehicleMenu(v => !v)}
                className="w-full text-left flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white hover:border-gray-400 transition"
              >
                {vehicleFilter
                  ? `${vehicles.find(v => v.id === vehicleFilter)!.brand} ${vehicles.find(v => v.id === vehicleFilter)!.model}`
                  : "Todos os Veículos"}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              {showVehicleMenu && (
                <ul className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <li
                    onClick={() => { setVehicleFilter(''); setShowVehicleMenu(false); }}
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Todos
                  </li>
                  {vehicles.map(v => (
                    <li
                      key={v.id}
                      onClick={() => { setVehicleFilter(v.id); setShowVehicleMenu(false); }}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      {v.brand} {v.model}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </form>

        {/* Resumo */}
        {filtered.length > 0 && (
          <div className="flex justify-between bg-blue-50 p-4 rounded-lg shadow-inner">
            <span className="text-gray-700"><strong>Itens:</strong> {filtered.length}</span>
            <span className="text-gray-800 font-semibold"><strong>Total:</strong> R$ {totalGasto.toFixed(2)}</span>
          </div>
        )}

        {/* Lista ou Empty */}
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhuma manutenção"
            description="Use o botão acima para criar sua primeira manutenção."
            buttonText="Nova Manutenção"
            redirectTo="/manutencoes/novo"
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(r => {
              const partsTotal = r.maintenance_parts.reduce((sum, p) => sum + p.price * p.quantity, 0);
              return (
                <div
                  key={r.id}
                  className="bg-white shadow rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/manutencoes/${r.id}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold flex-1 text-center">
                      {r.maintenance_name}
                    </h2>
                    <div
                      ref={el => {
                        if (openStatusMenuId === r.id) statusMenuRef.current = el;
                      }}
                      className="relative"
                    >
                      <button
                        onClick={e => { e.stopPropagation(); setOpenStatusMenuId(r.id); }}
                        className={`inline-flex items-center gap-1 px-3 py-1 text-base font-medium rounded-full select-none
                          ${r.status === "Feito"     ? "bg-green-100 text-green-800"
                          : r.status === "Cancelado" ? "bg-red-100 text-red-800"
                          :                            "bg-yellow-100 text-yellow-800"}`}
                      >
                        {r.status} <ChevronDown className="w-4 h-4" />
                      </button>
                      {openStatusMenuId === r.id && (
                        <ul
                          onClick={e => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg z-20"
                        >
                          {["A fazer","Feito","Cancelado"].map(opt => (
                            <li
                              key={opt}
                              onClick={e => { e.stopPropagation(); handleStatusChange(r.id, opt as any); }}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            >
                              {opt}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-700">
                    <div><strong>Veículo:</strong> {r.vehicle.brand} {r.vehicle.model}</div>
                    <div><strong>Tipo:</strong> {r.maintenance_type}</div>
                    <div><strong>Data:</strong> {r.scheduled_date ?? "—"}</div>
                  </div>

                  {/* Peças */}
                  {r.maintenance_parts.length > 0 && (
                    <div className="mt-2 text-sm text-gray-700">
                      Peças: {r.maintenance_parts.length} — R$ {partsTotal.toFixed(2)}
                    </div>
                  )}

                  {/* Total e delete */}
                  <div className="flex justify-between items-center mt-4">
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(r.id); }}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
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
