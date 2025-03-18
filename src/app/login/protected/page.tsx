"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function fetchAndCreateProfile() {
      // Obtém o usuário logado
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (user) {
        // Extrai o nome completo e separa em primeiro nome e sobrenome
        const fullName = user.user_metadata?.full_name || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");
        
        // Extrai a URL do avatar
        const avatarUrl = user.user_metadata?.avatar_url || "";

        // Busca o perfil na tabela 'profiles'
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar perfil:", error.message);
        }

        // Se não encontrar, insere um novo registro com os dados extraídos
        if (!data) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: user.email,
            avatar_url: avatarUrl,
          });
          if (insertError) {
            console.error("Erro ao criar perfil:", insertError.message);
          } else {
            setUserProfile({
              first_name: firstName,
              last_name: lastName,
              avatar_url: avatarUrl,
            });
          }
        } else {
          setUserProfile(data);
        }
      }
      setLoading(false);
    }

    fetchAndCreateProfile();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-8">
      {/* Exibe o avatar se existir */}
      {userProfile?.avatar_url && (
        <img
          src={userProfile.avatar_url}
          alt="Avatar"
          className="w-24 h-24 rounded-full mb-4"
        />
      )}
      <h1>
        Hello, {userProfile?.first_name} {userProfile?.last_name}!
      </h1>
    </div>
  );
}
