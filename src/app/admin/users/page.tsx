// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
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

  if (loading) return <LoadingState message="Carregando usuários…" />;

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Usuários</h1>

        <div className="space-y-4">
          {profiles.map(user => (
            <div
              key={user.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
            >
              <div className="flex items-center justify-between">
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
                <div className="flex items-center justify-center space-x-6">
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

              {/* Linha 2: email completo */}
              <div className="mt-4 text-gray-600 truncate">
                {user.email}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminGuard>
  );
}
