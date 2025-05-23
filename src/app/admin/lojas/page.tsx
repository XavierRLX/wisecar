// app/admin/lojas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import { MapPin, Edit2, Trash2 } from 'lucide-react';
import type { Provider } from '@/types';

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('service_providers')
        .select('id, name, address, logo_url, provider_images(*)');
      if (error) setError(error.message);
      else setProviders(data as Provider[]);
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta loja?')) return;
    const { error } = await supabase
      .from('service_providers')
      .delete()
      .eq('id', id);
    if (error) alert('Erro ao excluir loja: ' + error.message);
    else setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <AdminGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Gerenciar Lojas
          </h1>
          <button
            onClick={() => router.push('/lojas/novo')}
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
          >
            + Nova Loja
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 flex flex-col"
            >
              <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
                {p.logo_url ? (
                  <img
                    src={p.logo_url}
                    alt={`Logo de ${p.name}`}
                    className="w-full h-full object-contain"
                  />
                ) : p.provider_images?.[0] ? (
                  <img
                    src={p.provider_images[0].image_url}
                    alt={`Imagem de ${p.name}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                    Sem imagem
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-green-600 transition">
                  {p.name}
                </h2>
                {p.address && (
                  <p className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                    {p.address}
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => router.push(`/admin/lojas/${p.id}/editar`)}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  aria-label="Editar loja"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
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
