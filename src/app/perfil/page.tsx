"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  first_name: string;
  last_name:  string;
  username:   string;
  is_admin?:  boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name:  "",
    username:   "",
    is_admin:   false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, is_admin")
        .eq("id", user.id)
        .single();

      if (error) console.error("Erro ao carregar perfil:", error);
      else if (data) {
        setProfile({
          first_name: data.first_name  || "",
          last_name:  data.last_name   || "",
          username:   data.username    || "",
          is_admin:   data.is_admin    || false,
        });
      }
      setLoading(false);
    }
    fetchProfile();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Usuário não autenticado.");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name,
        last_name:  profile.last_name,
        username:   profile.username,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      setMessage("Erro ao atualizar o perfil.");
    } else {
      setMessage("Perfil atualizado com sucesso!");
    }

    setSaving(false);
  }

  if (loading) return <LoadingState message="Carregando perfil..." />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Meu Perfil</h1>

        {message && (
          <p className="mb-4 text-center text-green-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow p-6 space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={profile.first_name}
                onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                required
              />
            </div>

            {/* Sobrenome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sobrenome</label>
              <input
                type="text"
                value={profile.last_name}
                onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={profile.username}
                onChange={e => setProfile({ ...profile, username: e.target.value })}
                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                required
              />
            </div>

            {/* Botão Salvar */}
            <button
              type="submit"
              disabled={saving}
              className={`w-full flex justify-center items-center py-3 rounded-md text-white font-medium transition ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>

        {/* Botão para Dashboard de Admin */}
        {profile.is_admin && (
          <div className="mt-8 text-center">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              {/* you can replace with any icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M3 7h18M3 12h18M3 17h18" />
              </svg>
              Tela de Admin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
