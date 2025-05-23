'use client';

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, username, is_admin")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao carregar perfil:", error);
      } else if (data) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingState message="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center">
          Meu Perfil
        </h1>

        {message && (
          <div
            className={`mb-6 text-center ${
              message.includes("erro") || message.includes("Erro")
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3"
                required
              />
            </div>

            {/* Sobrenome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sobrenome
              </label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3"
                required
              />
            </div>

            {/* Username (full width) */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 p-3"
                required
              />
            </div>

            {/* Botão Salvar (full width) */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className={`w-full flex justify-center items-center py-3 rounded-xl text-white font-semibold transition ${
                  saving
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>

        {/* Botão para Dashboard de Admin */}
        {profile.is_admin && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7h18M3 12h18M3 17h18"
                />
              </svg>
              Dashboard Admin
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
