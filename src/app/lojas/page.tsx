"use client";

import { useMemo, useState } from "react";
import AuthGuard      from "@/components/AuthGuard";
import EnsureProfile  from "@/components/EnsureProfile";
import LoadingState   from "@/components/LoadingState";
import EmptyState     from "@/components/EmptyState";
import ProviderCard   from "@/components/ProviderCard";
import { useServiceProviders } from "@/hooks/useServiceProviders";

export default function ProvidersPage() {
  const { providers, loading, error, refetch } = useServiceProviders();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return providers.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        p.services?.some(s => s.name.toLowerCase().includes(term))
    );
  }, [providers, search]);

  return (
    <AuthGuard>
      <EnsureProfile />
      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Oficinas & Serviços</h1>
        <input
          type="text"
          placeholder="Buscar por nome ou serviço..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />

        {loading ? (
          <LoadingState message="Carregando prestadores…" />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nenhum prestador encontrado"
            description="Tente outro termo ou recarregue."
            buttonText="Recarregar"
            onClick={refetch}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filtered.map(p => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
