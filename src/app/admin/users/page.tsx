// app/admin/users/page.tsx
"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";

interface Profile {
  id:        string;
  first_name:string;
  last_name: string;
  email:     string;
  avatar_url?:string;
  is_seller?: boolean;
  is_admin?:  boolean;
}

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");

  // fetch centralizado
  const fetchPage = async (pageIndex: number) => {
    const from = pageIndex * PAGE_SIZE;
    const to   = from + PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, avatar_url, is_seller, is_admin")
      .order("is_admin", { ascending: false })
      .order("first_name", { ascending: true })
      .range(from, to);

    if (error) {
      console.error("Erro ao carregar perfis:", error);
      return [];
    }
    return data as Profile[];
  };

  // carregamento inicial
  useEffect(() => {
    (async () => {
      setLoading(true);
      const firstBatch = await fetchPage(0);
      setProfiles(firstBatch);
      setHasMore(firstBatch.length === PAGE_SIZE);
      setLoading(false);
    })();
  }, []);

  // carregar mais
  const handleLoadMore = async () => {
    if (!hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const batch = await fetchPage(nextPage);
    setProfiles(prev => [...prev, ...batch]);
    setPage(nextPage);
    setHasMore(batch.length === PAGE_SIZE);
    setLoadingMore(false);
  };

  // toggle como antes
  const toggleField = async (
    id: string,
    field: "is_seller" | "is_admin",
    value: boolean
  ) => {
    const { error } = await supabase
      .from("profiles")
      .update({ [field]: value })
      .eq("id", id);
    if (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro: " + error.message);
      return;
    }
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // filtro local por busca
  const filtered = profiles.filter(p =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  if (loading) return <LoadingState message="Carregando usuários…" />;

  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Usuários</h1>

        <input
          type="text"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou sobrenome…"
          className="w-full md:w-1/2 lg:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="grid grid-cols-2 gap-6">
          {filtered.length === 0 && (
            <div className="col-span-2 text-center text-gray-500 py-10">
              Nenhum usuário encontrado.
            </div>
          )}

          {filtered.map(user => {
            const seller = !!user.is_seller;
            const admin  = !!user.is_admin;
            return (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col justify-between"
              >
                {/* avatar + info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={user.avatar_url ?? "/default-avatar.png"}
                    alt={`${user.first_name} avatar`}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-gray-900 truncate">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                {/* labels */}
                <div className="grid grid-cols-2 gap-4 text-sm font-medium text-gray-700 mb-2">
                  <div className="text-center">Vendedor</div>
                  <div className="text-center">Admin</div>
                </div>

                {/* toggles */}
                <div className="grid grid-cols-2 gap-4">
                  {([["is_seller", seller], ["is_admin", admin]] as const).map(
                    ([field, value]) => {
                      const color = field === "is_seller" ? "green" : "blue";
                      return (
                        <button
                          key={field}
                          onClick={() =>
                            toggleField(
                              user.id,
                              field as "is_seller" | "is_admin",
                              !value
                            )
                          }
                          className={`mx-auto relative inline-flex items-center h-6 w-11 transition-colors rounded-full focus:outline-none ${
                            value ? `bg-${color}-500` : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`transform transition-transform bg-white w-5 h-5 rounded-full shadow-sm ${
                              value ? "translate-x-5" : ""
                            }`}
                          />
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              {loadingMore ? "Carregando…" : "Carregar Mais"}
            </button>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
