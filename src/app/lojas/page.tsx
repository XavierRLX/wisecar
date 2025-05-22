"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useProviders } from "@/hooks/useProviders";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ProviderCard from "@/components/ProviderCard";

export default function LojasPage() {
  const router = useRouter();
  const { providers, loading, error } = useProviders();

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error) return <p className="text-red-500">Erro: {error}</p>;
  if (providers.length === 0) {
    return (
      <EmptyState
        title="Nenhuma loja encontrada"
        description="Cadastre a primeira loja!"
        buttonText="Adicionar Loja"
        redirectTo="/lojas/novo"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map((p) => (
        <div
          key={p.id}
          className="cursor-pointer"
          onClick={() => router.push(`/lojas/${p.id}`)}
        >
          <ProviderCard provider={p} />
        </div>
      ))}
    </div>
  );
}
