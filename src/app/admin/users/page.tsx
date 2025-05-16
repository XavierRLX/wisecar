// app/admin/users/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import AdminGuard from "@/components/AdminGuard";
import LoadingState from "@/components/LoadingState";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  is_seller?: boolean;
  is_admin?: boolean;
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, avatar_url, is_seller, is_admin");

      if (error) {
        console.error("Erro ao carregar profiles:", error);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
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

  // Aplica busca e ordenação
  const displayed = useMemo(() => {
    const term = search.toLowerCase().trim();
    return profiles
      .filter(p =>
        !term ||
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        // Admin primeiro
        if (a.is_admin && !b.is_admin) return -1;
        if (!a.is_admin && b.is_admin) return 1;
        // Depois pelo nome completo
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [profiles, search]);

  if (loading) return <LoadingState message="Carregando usuários…" />;

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Usuários</h1>

        {/* Campo de Busca */}
        <div className="flex">
          <input
            type="text"
            placeholder="Buscar por nome ou sobrenome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          {displayed.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-center justify-between">
                {/* Avatar + Nome */}
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar_url ?? "/default-avatar.png"}
                    alt={`${user.first_name} avatar`}
                    className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  />
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </div>
                </div>

                {/* Toggles alinhados verticalmente ao centro */}
                <div className="flex items-center space-x-6">
                  {([
                    ["Vendedor", "is_seller"],
                    ["Admin",    "is_admin"]
                  ] as const).map(([label, field]) => {
                    const value = !!user[field];
                    const color = field === "is_seller" ? "green" : "blue";
                    return (
                      <div key={field} className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <button
                          onClick={() =>
                            toggleField(user.id, field, !value)
                          }
                          className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                            value ? `bg-${color}-500` : "bg-gray-300"
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

              {/* Linha 2: email */}
              <div className="mt-4 text-gray-600 truncate">
                {user.email}
              </div>
            </div>
          ))}
          {displayed.length === 0 && (
            <p className="text-center text-gray-500">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
