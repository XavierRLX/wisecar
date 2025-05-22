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

  if (loading) 
    return <LoadingState message="Carregando lojas..." />;
  if (error) 
    return <p className="text-red-500 text-center">{error}</p>;
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
    <div className="px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Nossas Lojas</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    </div>
  );
}
