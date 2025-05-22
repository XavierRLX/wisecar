"use client";
import React from "react";
import { useProviders } from "@/hooks/useProviders";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ProviderCard from "@/components/ProviderCard";

export default function LojasPage() {
  const { providers, loading, error } = useProviders();

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error)   return <p className="text-red-500">Erro: {error}</p>;
  if (providers.length === 0)
    return <EmptyState
    title="Nenhuma loja encontrada"
    description="Cadastre a primeira loja!"
    buttonText="Adicionar Veículo"
    redirectTo="/lojas/novo"
  />

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} />
      ))}
    </div>
  );
}
