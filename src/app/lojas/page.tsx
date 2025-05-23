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
  if (error) return <p className="text-red-600">{error}</p>;
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Cabeçalho + Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Nossas Lojas</h1>
        <div className="relative w-full md:w-64">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar lojas ou serviços..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Resultado da busca */}
      {filtered.length === 0 ? (
        <div className="text-center text-gray-600 text-lg">
          <p>
            Nenhuma loja ou serviço encontrado para&nbsp;
            <span className="font-semibold text-indigo-600">“{searchTerm}”</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/lojas/${p.id}`)}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') router.push(`/lojas/${p.id}`);
              }}
            >
              <ProviderCard provider={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
