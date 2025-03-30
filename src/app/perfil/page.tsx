"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, username")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            username: data.username || "",
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
        })
        .eq("id", user.id);
      if (error) {
        setMessage("Erro ao atualizar o perfil.");
      } else {
        setMessage("Perfil atualizado com sucesso!");
      }
    }
    setSaving(false);
  }

  if (loading) return <LoadingState message="Carregando perfil..." />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 TextColorPrimary">Meu Perfil</h1>
        {message && (
          <p className="mb-4 text-center text-green-600">{message}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                value={profile.first_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, first_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Sobrenome
              </label>
              <input
                type="text"
                value={profile.last_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, last_name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={profile.username || ""}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
