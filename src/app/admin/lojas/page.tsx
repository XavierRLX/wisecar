// app/admin/lojas/page.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from '@/hooks/useProviders';
import { supabase } from '@/lib/supabase';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import ProviderCard from '@/components/ProviderCard';
import { Edit2, Trash2 } from 'lucide-react';
import type { Provider } from '@/types';

export default function AdminProvidersPage() {
  const router = useRouter();
  const { providers, loading, error, refetch } = useProviders();

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta loja?')) return;
    const { error } = await supabase
      .from('service_providers')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Erro ao excluir loja: ' + error.message);
    } else {
      await refetch();
    }
  };

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error) return <p className="p-8 text-red-500 text-center">{error}</p>;

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Gerenciar Lojas</h1>
          <button
            onClick={() => router.push('/lojas/novo')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
          >
            + Nova Loja
          </button>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p: Provider) => (
            <div key={p.id} className="relative">
              {/* Card público */}
              <div
                onClick={() => router.push(`/lojas/${p.id}`)}
                className="cursor-pointer"
              >
                <ProviderCard provider={p} />
              </div>

              {/* Botões de edição e exclusão (sempre visíveis) */}
              <div className="absolute top-2 right-2 flex space-x-2 z-10">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    router.push(`/admin/lojas/${p.id}/editar`);
                  }}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow rounded-full transition"
                  aria-label="Editar loja"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    handleDelete(p.id);
                  }}
                  className="p-2 bg-white bg-opacity-90 hover:bg-opacity-100 shadow rounded-full transition"
                  aria-label="Excluir loja"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
