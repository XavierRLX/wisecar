// app/admin/lojas/page.tsx
"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Store {
  id:        string;
  name:      string;
  address:   string;
  phone:     string;
  social:    string;      // agora vai vir de social_media
  cover_url?: string;     // URL da primeira imagem, se houver
}

export default function AdminStoresPage() {
  const [stores, setStores]   = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // 1) Busca na tabela correta, puxando também as imagens relacionadas
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          id,
          name,
          address,
          phone,
          social_media,
          service_provider_images ( image_url )
        `);

      if (error) {
        console.error("Erro ao carregar lojas:", error);
        setStores([]);
      } else if (data) {
        // 2) Mapeia cada provedor num objeto Store
        const mapped: Store[] = data.map((row: any) => ({
          id:        row.id,
          name:      row.name,
          address:   row.address,
          phone:     row.phone,
          social:    row.social_media,
          cover_url: row.service_provider_images?.[0]?.image_url ?? undefined,
        }));
        setStores(mapped);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <LoadingState message="Carregando Serviços..." />;

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Lojas</h1>
          <Link
            href="/admin/lojas/novo"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                 viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v16m8-8H4" />
            </svg>
            Nova Loja
          </Link>
        </div>

        {stores.length === 0 ? (
          <EmptyState
            title="Nenhuma loja cadastrada"
            description="Cadastre sua primeira loja para começar a oferecer serviços."
            buttonText="Criar Loja"
            redirectTo="/admin/lojas/novo"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map(store => (
              <div key={store.id} className="bg-white rounded-lg shadow p-4 flex space-x-4">
                {store.cover_url ? (
                  <img
                    src={store.cover_url}
                    alt={`Capa da loja ${store.name}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded" />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900">{store.name}</h2>
                  <p className="text-sm text-gray-600">{store.address}</p>
                  <p className="text-sm text-gray-600">{store.phone}</p>
                  <p className="text-sm text-gray-600">{store.social}</p>
                </div>
                <div className="flex flex-col justify-end space-y-2">
                  <Link
                    href={`/admin/lojas/${store.id}/editar`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={async () => {
                      if (!confirm("Excluir esta loja?")) return;
                      const { error } = await supabase
                        .from("service_providers")
                        .delete()
                        .eq("id", store.id);
                      if (error) alert("Erro: " + error.message);
                      else setStores(prev => prev.filter(s => s.id !== store.id));
                    }}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
