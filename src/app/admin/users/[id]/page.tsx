// app/admin/users/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import { useUserProviders } from "@/hooks/useUserProviders";
import { useUserVehicles } from "@/hooks/useUserVehicles";

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
        <Link
          href="/admin/users"
          className="text-blue-500 hover:underline"
        >
          ← Voltar à lista de usuários
        </Link>

        <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>

        {/* Seção de Lojas */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Lojas cadastradas</h2>
          {providers.length > 0 ? (
            providers.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-lg shadow p-4 mb-2"
              >
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-gray-600">
                  {p.city} – {p.state}
                </p>
                <Link
                  href={`/admin/providers/${p.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver detalhes da loja →
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhuma loja encontrada.</p>
          )}
        </section>

        {/* Seção de Veículos */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Veículos cadastrados</h2>
          {vehicles.length > 0 ? (
            vehicles.map((v) => (
              <div
                key={v.id}
                className="flex items-center bg-white rounded-lg shadow p-4 mb-2"
              >
                <img
                  src={v.vehicle_images?.[0]?.image_url ?? "/default-car.png"}
                  alt={`${v.brand} ${v.model}`}
                  className="w-12 h-8 object-cover rounded mr-4"
                />
                <div>
                  <p className="font-medium">
                    {v.brand} {v.model} ({v.year})
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {v.status}
                  </p>
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
