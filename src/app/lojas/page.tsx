// app/lojas/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from '@/hooks/useProviders';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ProviderCard from '@/components/ProviderCard';
import { Search } from 'lucide-react';

export default function LojasPage() {
  const router = useRouter();
  const { providers, loading, error } = useProviders();
  const [searchTerm, setSearchTerm] = useState('');

  // filtra por nome da loja ou nome de qualquer serviço
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return providers;
    return providers.filter((p) => {
      if (p.name.toLowerCase().includes(term)) return true;
      return (
        p.services?.some((s) =>
          s.name.toLowerCase().includes(term)
        ) ?? false
      );
    });
  }, [providers, searchTerm]);

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Cabeçalho + Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Nossas Lojas
        </h1>
        <div className="w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lojas ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Caso nenhuma loja/serviço encontre */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">
            Nenhuma loja ou serviço encontrado para “
            <span className="font-medium text-gray-700">{searchTerm}</span>
            ”
          </p>
        </div>
      ) : (
        /* Grid de cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="cursor-pointer transform hover:scale-[1.02] transition-transform"
              onClick={() => router.push(`/lojas/${p.id}`)}
            >
              <ProviderCard provider={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
