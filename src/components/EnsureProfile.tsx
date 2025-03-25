// components/EnsureProfile.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function EnsureProfile() {
  useEffect(() => {
    async function checkAndCreateProfile() {
      // Obtém o usuário autenticado
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Verifica se já existe um registro em 'profiles' para esse usuário
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error || !profile) {
          // Extrai as informações do usuário a partir do user_metadata
          // O campo full_name ou name pode vir na metadata do usuário
          const userMetadata = user.user_metadata || {};
          const fullName = userMetadata.full_name || userMetadata.name || "";
          const firstName = fullName.split(" ")[0] || "";
          const lastName =
            fullName.split(" ").length > 1
              ? fullName.split(" ").slice(1).join(" ")
              : "";
          const avatarUrl = userMetadata.avatar_url || "";

          // Insere o perfil com os dados adicionais
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            avatar_url: avatarUrl,
          });
          if (insertError) {
            console.error("Erro ao criar profile:", insertError.message);
          } else {
            console.log("Profile criado com sucesso.");
          }
        } else {
          console.log("Profile já existe.");
        }
      }
    }

    checkAndCreateProfile();
  }, []);

  // Esse componente não precisa renderizar nada na UI
  return null;
}
