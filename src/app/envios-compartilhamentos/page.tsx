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
    return <p className="p-4 text-center text-red-500">Erro: {error}</p>;
  }

  const formatDate = (iso: string) =>
    new Date(iso)
      .toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " às");

  const renderCard = (r: typeof sent[number], isSent: boolean) => {
    const otherId = isSent ? r.to_user : r.from_user;
    const prof = profiles.find((p) => p.id === otherId);
    const name = prof ? `${prof.first_name} ${prof.last_name}` : "—";
    const dateStr = formatDate(r.created_at);

    const badgeColor =
      r.status === "pending"
        ? "bg-yellow-100 text-yellow-800"
        : r.status === "accepted"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
      <div
        key={r.id}
        className="flex flex-col sm:flex-row items-center bg-white shadow rounded-lg overflow-hidden 
                   hover:shadow-lg transition-shadow duration-200"
      >
        {/* Thumb veículo */}
        <div className="flex-shrink-0 w-full sm:w-32 h-32 sm:h-auto">
          <img
            src={r.vehicle.image_url ?? "/placeholder-car.png"}
            alt={`${r.vehicle.brand} ${r.vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 p-4 grid grid-rows-[auto_auto_auto] gap-2">
          {/* Linha 1: ação + veículo */}
          <p className="text-base font-semibold text-gray-800 leading-snug">
            <span className="uppercase text-xs font-bold text-gray-500 mr-1">
              {isSent ? "Enviei" : "Recebi"}
            </span>
            <span className="text-blue-600">
              {r.vehicle.brand} {r.vehicle.model}
            </span>{" "}
            {isSent ? "para" : "de"}{" "}
            <span className="font-medium">{name}</span>
          </p>

          {/* Linha 2: data e status */}
          <div className="flex items-center text-sm text-gray-500">
            <time dateTime={r.created_at}>{dateStr}</time>
            <span className={`ml-4 px-2 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
              {r.status.toUpperCase()}
            </span>
          </div>

          {/* Linha 3: botão */}
          {r.status === "pending" && (
            <button
              onClick={() => setActiveModal({ requestId: r.id })}
              className="self-start mt-2 px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 
                         rounded hover:bg-gray-200 transition"
            >
              {isSent ? "Cancelar" : "Responder"}
            </button>
          )}
        </div>

        {/* Avatar */}
        <div className="p-4 flex-shrink-0">
          {prof?.avatar_url ? (
            <img
              src={prof.avatar_url}
              alt={name}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200" />
          )}
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center">
          Envios & Compartilhamentos
        </h1>

        <div className="space-y-12">
          {/* Seção Enviados */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pedidos Enviados</h2>
            {sent.length === 0 ? (
              <EmptyState
                title="Nenhum pedido enviado"
                description="Você ainda não enviou ou compartilhou nenhum veículo." buttonText={""}              />
            ) : (
              <div className="space-y-6">{sent.map((r) => renderCard(r, true))}</div>
            )}
          </section>

          {/* Seção Recebidos */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Pedidos Recebidos</h2>
            {received.length === 0 ? (
              <EmptyState
                title="Nenhum pedido recebido"
                description="Você não recebeu pedidos de envio ou compartilhamento." buttonText={""}              />
            ) : (
              <div className="space-y-6">{received.map((r) => renderCard(r, false))}</div>
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
