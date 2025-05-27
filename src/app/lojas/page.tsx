// app/lojas/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from '@/hooks/useProviders';
import LoadingState from '@/components/LoadingState';
import EmptyState from '@/components/EmptyState';
import ProviderCard from '@/components/ProviderCard';
import ServiceSearchCard, { ServiceSearchCardProps } from '@/components/ServiceSearchCard';

type Mode = 'lojas' | 'servicos';

export default function LojasPage() {
  const router = useRouter();
  const { providers, loading, error } = useProviders();
  const [mode, setMode] = useState<Mode>('lojas');
  const [searchTerm, setSearchTerm] = useState('');

  // 1) filtra providers
  const filteredProviders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return providers;
    return providers.filter(p => {
      if (p.name.toLowerCase().includes(term)) return true;
      return p.services?.some(s => s.name.toLowerCase().includes(term)) ?? false;
    });
  }, [providers, searchTerm]);

  // 2) achata todos os services e guarda também logo da loja
  const allServices = useMemo<ServiceSearchCardProps[]>(() => {
    return providers.flatMap(p =>
      (p.services ?? []).map(s => ({
        ...s,
        providerName: p.name,
        providerId: p.id,
        providerLogoUrl: p.logo_url ?? p.provider_images?.[0]?.image_url,
      }))
    );
  }, [providers]);

  // 3) filtra services
  const filteredServices = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allServices;
    return allServices.filter(s => s.name.toLowerCase().includes(term));
  }, [allServices, searchTerm]);

  if (loading) {
    return <LoadingState message="Carregando lojas e serviços..." />;
  }
  if (error) {
    return <p className="p-8 text-red-500">Erro: {error}</p>;
  }
  if (!providers.length) {
    return (
      <EmptyState
        title="Nenhuma loja encontrada"
        description="Cadastre a primeira loja para começar."
        buttonText="Adicionar Loja"
        redirectTo="/lojas/novo"
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Toggle com sliding pill */}
      <div className="flex justify-center mb-6">
        <div className="relative inline-flex bg-gray-200 rounded-full p-1 h-10 w-72">
          <div
            style={{
              left:
                mode === 'lojas'
                  ? '1px'
                  : 'calc(100%/2 + 1px)',
            }}
            className="absolute top-1 h-8 w-1/2 bg-white rounded-full shadow transition-all duration-300"
          />
          { (['lojas','servicos'] as Mode[]).map(m => {
            const labels = { lojas: 'Lojas', servicos: 'Serviços' } as const;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`relative z-10 flex-1 text-sm font-medium transition-colors ${
                  mode === m
                    ? 'text-indigo-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {labels[m]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Busca */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder={
            mode === 'lojas'
              ? 'Buscar lojas ou serviços...'
              : 'Buscar serviços...'
          }
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full max-w-md pl-4 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Lista */}
      {mode === 'lojas' ? (
        filteredProviders.length === 0 ? (
          <div className="text-center text-gray-600 text-lg py-16">
            Nenhuma loja ou serviço encontrado para&nbsp;
            <span className="font-semibold text-indigo-600">
              “{searchTerm}”
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProviders.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/lojas/${p.id}`)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') router.push(`/lojas/${p.id}`);
                }}
              >
                <ProviderCard provider={p} />
              </div>
            ))}
          </div>
        )
      ) : (
        // modo SERVIÇOS
        <>
          {allServices.length === 0 ? (
            <EmptyState
              title="Nenhum serviço disponível"
              description="Cadastre serviços nas lojas para que apareçam aqui."
              buttonText="Adicionar Serviço"
              redirectTo="/lojas/novo"
            />
          ) : filteredServices.length === 0 ? (
            <div className="text-center text-gray-600 text-lg py-16">
              Nenhum serviço encontrado para&nbsp;
              <span className="font-semibold text-indigo-600">
                “{searchTerm}”
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredServices.map(svc => (
                <div
                  key={`${svc.providerId}-${svc.id}`}
                  className="cursor-pointer"
                  onClick={() => router.push(`/lojas/${svc.providerId}`)}
                >
                  <ServiceSearchCard {...svc} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
