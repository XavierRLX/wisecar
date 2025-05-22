// app/admin/lojas/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import type { Provider } from "@/types";

export default function AdminProvidersPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega as lojas
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("service_providers")
        .select("id, name, address, provider_images(*)");
      if (error) setError(error.message);
      else setProviders(data as Provider[]);
      setLoading(false);
    })();
  }, []);

  // Excluir loja
  const handleDelete = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta loja?")) return;
    const { error } = await supabase
      .from("service_providers")
      .delete()
      .eq("id", id);
    if (error) {
      alert("Erro ao excluir loja: " + error.message);
    } else {
      setProviders((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (loading) return <LoadingState message="Carregando lojas..." />;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">
            Gerenciar Lojas
          </h1>
          <button
            onClick={() => router.push("/lojas/novo")}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            + Nova Loja
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col"
            >
              <div className="flex-1">
                {p.provider_images?.[0] ? (
                  <img
                    src={p.provider_images[0].image_url}
                    alt={`Imagem da loja ${p.name}`}
                    className="h-32 w-full object-cover rounded mb-4"
                  />
                ) : (
                  <div className="h-32 w-full bg-gray-200 rounded mb-4 flex items-center justify-center text-gray-500">
                    Sem imagem
                  </div>
                )}
                <h2 className="text-xl font-semibold mb-1">{p.name}</h2>
                <p className="text-gray-600 truncate">{p.address}</p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => router.push(`/admin/lojas/${p.id}/editar`)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
