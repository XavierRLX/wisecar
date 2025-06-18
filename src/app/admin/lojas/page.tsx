'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProviders } from '@/hooks/useProviders';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/lib/supabase';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import ProviderCard from '@/components/ProviderCard';
import { Edit2, Trash2, User as UserIcon } from 'lucide-react';
import type { Provider } from '@/types';
import BackButton from '@/components/BackButton';

export default function AdminProvidersPage() {
  const router = useRouter();
  const { providers, loading: loadingProviders, error, refetch } = useProviders();
  const { profiles, loading: loadingProfiles } = useProfiles();

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

  if (loadingProviders || loadingProfiles) {
    return <LoadingState message="Carregando lojas..." />;
  }
  if (error) {
    return <p className="p-8 text-red-500 text-center">{error}</p>;
  }

  return (
    <AdminGuard>
      <div className="mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <BackButton />
          <h1 className="text-3xl font-extrabold text-gray-900">Gerenciar Lojas</h1>
          <button
            onClick={() => router.push('/admin/lojas/novo')}
            className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            + Nova Loja
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider: Provider) => {
            const owner = profiles.find(u => u.id === provider.user_id);
            return (
              <div
                key={provider.id}
                className="relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-lg transition-transform transform hover:-translate-y-1"
              >
                {/* Clickable Area */}
                <div
                  onClick={() => router.push(`/admin/lojas/${provider.id}`)}
                  className="flex-1 cursor-pointer p-6 flex flex-col justify-between space-y-4"
                >
                  {/* Owner Info */}
                  {owner && (
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-5 h-5 text-gray-500" />
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/admin/users/${owner.id}`);
                        }}
                        className="text-sm font-medium text-indigo-600 hover:underline focus:outline-none"
                      >
                        @{owner.username || `${owner.first_name} ${owner.last_name}`}
                      </button>
                    </div>
                  )}

                  {/* Provider Card Content */}
                  <ProviderCard provider={provider} />
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      router.push(`/admin/lojas/${provider.id}/editar`);
                    }}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label="Editar loja"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      handleDelete(provider.id);
                    }}
                    className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label="Excluir loja"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminGuard>
  );
}
