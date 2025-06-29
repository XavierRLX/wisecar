// app/envios-compartilhamentos/page.tsx
"use client";

import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ConfirmRequestModal from "@/components/ConfirmRequestModal";
import { useVehicleRequests } from "@/hooks/useVehicleRequests";
import { useProfiles } from "@/hooks/useProfiles";

export default function EnviosCompartilhamentosPage() {
  const { sent, received, loading, error, refresh } = useVehicleRequests();
  const { profiles, loading: loadingProfiles } = useProfiles();
  const [activeModal, setActiveModal] = useState<{ requestId: string } | null>(null);

  if (loading || loadingProfiles) {
    return <LoadingState message="Carregando envios e compartilhamentos…" />;
  }
  if (error) {
    return <p className="p-4 text-red-500">Erro: {error}</p>;
  }

  function formatDate(dt: string) {
    return new Date(dt)
      .toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " às");
  }

  const renderCard = (r: typeof sent[number], isSent: boolean) => {
    const otherId = isSent ? r.to_user : r.from_user;
    const prof = profiles.find((p) => p.id === otherId);
    const name = prof ? `${prof.first_name} ${prof.last_name}` : "Usuário";
    const dateStr = formatDate(r.created_at);

    const badgeClasses =
      r.status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : r.status === "accepted"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
      <div
        key={r.id}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 grid grid-cols-[auto,1fr,auto] gap-6 items-center"
      >
        {/* Vehicle Thumbnail */}
        <img
          src={r.vehicle.image_url ?? "/placeholder-car.png"}
          alt={`${r.vehicle.brand} ${r.vehicle.model}`}
          className="w-24 h-24 object-cover rounded-lg border"
        />

        {/* Main Info */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-lg font-semibold leading-snug">
              {isSent ? "Enviei" : "Recebi"}{" "}
              <span className="text-blue-600">
                {r.vehicle.brand} {r.vehicle.model}
              </span>{" "}
              {isSent ? "para" : "de"}{" "}
              <span className="font-medium">{name}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">{dateStr}</p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${badgeClasses}`}
            >
              {r.status.toUpperCase()}
            </span>
            {r.status === "pending" && (
              <button
                onClick={() => setActiveModal({ requestId: r.id })}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition text-sm"
              >
                {isSent ? "Cancelar" : "Responder"}
              </button>
            )}
          </div>
        </div>

        {/* User Avatar */}
        {prof?.avatar_url ? (
          <img
            src={prof.avatar_url}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-full" />
        )}
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Envios & Compartilhamentos
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Enviados */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Pedidos Enviados</h2>
            {sent.length === 0 ? (
              <EmptyState
                title="Nenhum pedido enviado"
                description="Você ainda não fez nenhum envio ou compartilhamento." buttonText={""}              />
            ) : (
              <div className="space-y-6">
                {sent.map((r) => renderCard(r, true))}
              </div>
            )}
          </section>

          {/* Recebidos */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Pedidos Recebidos</h2>
            {received.length === 0 ? (
              <EmptyState
                title="Nenhum pedido recebido"
                description="Você não recebeu pedidos de compartilhamento ou envio." buttonText={""}              />
            ) : (
              <div className="space-y-6">
                {received.map((r) => renderCard(r, false))}
              </div>
            )}
          </section>
        </div>

        {/* Modal de resposta */}
        {activeModal && (
          <ConfirmRequestModal
            mode="respond"
            requestId={activeModal.requestId}
            onClose={() => {
              setActiveModal(null);
              refresh();
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}
