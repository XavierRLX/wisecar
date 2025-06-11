// app/admin/users/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/formatters";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";
import Link from "next/link";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  is_seller?: boolean;
  is_admin?: boolean;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [profiles, setProfiles]         = useState<Profile[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterAdmin, setFilterAdmin]   = useState(false);
  const [filterSeller, setFilterSeller] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, username, email, avatar_url, is_seller, is_admin, created_at"
        );
      if (error) console.error("Erro ao carregar profiles:", error);
      else setProfiles(data as Profile[]);
      setLoading(false);
    })();
  }, []);

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
      console.error("Erro ao atualizar perfil:", error.message);
      return;
    }
    setProfiles(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const displayed = useMemo(() => {
    const term = search.toLowerCase().trim();
    return profiles
      .filter(p =>
        !term ||
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        p.username?.toLowerCase().includes(term)
      )
      .filter(p => {
        if (filterAdmin && filterSeller) return !!p.is_admin || !!p.is_seller;
        if (filterAdmin) return !!p.is_admin;
        if (filterSeller) return !!p.is_seller;
        return true;
      })
      .sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [profiles, search, filterAdmin, filterSeller]);

  if (loading) return <LoadingState message="Carregando usuários…" />;

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Usuários</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Buscar por nome ou usuário..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-1">
            <button
              onClick={() => setFilterSeller(s => !s)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filterSeller
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Vendedores
            </button>
            <button
              onClick={() => setFilterAdmin(a => !a)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                filterAdmin
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Administradores
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {displayed.length > 0 ? (
            displayed.map(user => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block hover:shadow-md transition"
              >
                <div className="bg-white rounded-lg shadow-sm transition p-6">
                  {/* Nome + Username + Toggles */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar_url ?? "/default-avatar.png"}
                        alt={`${user.first_name} avatar`}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      />
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </div>
                        {user.username && (
                          <div className="text-xs text-gray-500 truncate">
                            @{user.username}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      {(
                        [
                          ["Vendedor", "is_seller"],
                          ["Admin",    "is_admin"]
                        ] as const
                      ).map(([label, field]) => {
                        const value = !!user[field];
                        return (
                          <div key={field} className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <button
                              onClick={() => toggleField(user.id, field, !value)}
                              className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                                field === "is_seller"
                                  ? (value ? "bg-green-600" : "bg-gray-300")
                                  : (value ? "bg-blue-600"  : "bg-gray-300")
                              }`}
                            >
                              <span
                                className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                                  value ? "translate-x-5" : ""
                                }`}
                              />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* E-mail + Created At */}
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-gray-600 truncate">{user.email}</div>
                    {user.created_at && (
                      <div className="text-[10px] text-gray-400 whitespace-nowrap">
                        Criado: {formatDate(user.created_at)}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">
              Nenhum usuário encontrado.
            </p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
