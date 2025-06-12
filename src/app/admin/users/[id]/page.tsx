// app/admin/users/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import { useUserProviders } from "@/hooks/useUserProviders";
import { useUserVehicles } from "@/hooks/useUserVehicles";
import ProviderCard from "@/components/ProviderCard";
import BackButton from "@/components/BackButton";

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = id!;

  const {
    providers,
    loading: loadingProviders,
    error: errorProviders
  } = useUserProviders(userId);

  const {
    vehicles,
    loading: loadingVehicles,
    error: errorVehicles
  } = useUserVehicles(userId);

  if (loadingProviders || loadingVehicles) {
    return <LoadingState message="Carregando detalhes…" />;
  }

  if (errorProviders || errorVehicles) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">Erro: {errorProviders || errorVehicles}</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Voltar */}
        <BackButton className="mb-2" />

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-800">Detalhes do Usuário</h1>

        {/* Lojas */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Lojas cadastradas</h2>

          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map((p) => (
                <div key={p.id} className="cursor-pointer">
                  <ProviderCard provider={p} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma loja encontrada.</p>
          )}
        </section>

        {/* Veículos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Veículos cadastrados</h2>

          {vehicles.length > 0 ? (
            vehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <img
                  src={v.vehicle_images?.[0]?.image_url ?? "/default-car.png"}
                  alt={`${v.brand} ${v.model}`}
                  className="w-12 h-12 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    {v.brand} {v.model} ({v.year})
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Status: {v.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhum veículo encontrado.</p>
          )}
        </section>
      </div>
    </AdminGuard>
  );
}
