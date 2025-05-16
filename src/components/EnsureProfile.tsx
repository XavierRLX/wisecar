// components/EnsureProfile.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function EnsureProfile() {
  useEffect(() => {
    async function checkAndCreateProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Verifica se o profile já existe
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!fetchError && profile) return;

      // Dados básicos do usuário
      const userMetadata = user.user_metadata || {};
      const fullName = userMetadata.full_name || userMetadata.name || "";
      const firstName = fullName.split(" ")[0] || "";
      const lastName =
        fullName.split(" ").length > 1
          ? fullName.split(" ").slice(1).join(" ")
          : "";
      const avatarUrl = userMetadata.avatar_url || "";

      // 100 nomes de carros populares no Brasil
      const carNames = [
        "uno","gol","palio","fiesta","ka",
        "onix","prisma","hb20","voyage","polo",
        "virtus","up","fox","sandero","logan",
        "duster","captur","creta","hrv","crv",
        "fit","city","civic","corolla","etios",
        "yaris","kwid","mobi","s10","silverado",
        "frontier","ranger","hilux","amarok","saveiro",
        "strada","montana","weekend","idea","doblo",
        "punto","linea","bravo","toro","renegade",
        "compass","tcross","pulse","cronos","argo",
        "tracker","spin","cobalt","spark","agile",
        "c3","c4","aircross","ecosport","journey",
        "cherokee","grandcherokee","patriot","wrangler","commander",
        "versa","sentra","altima","titan","leaf",
        "tucson","santafe","hb20s","hb20x","kona",
        "ix35","elantra","rav4","corollacross","yarisedan",
        "jetta","golf","uptrend","goltrend","kombiwagen",
        "fusca","camaro","mustang","f40","maverick",
        "opala","chevette","dubo","belina","cheyenne",
        "qualis","zafira","astra","vectra","omega"
      ];

      // Gera username único de 8 chars: parte do nome do carro + dígitos
      async function generateUsername(): Promise<string> {
        let uname = "";
        let exists = true;
        while (exists) {
          const root = carNames[Math.floor(Math.random() * carNames.length)].slice(0, 4);
          const numDigits = 8 - root.length;
          const digits = Array.from({ length: numDigits })
            .map(() => Math.floor(Math.random() * 10))
            .join("");
          uname = (root + digits).toLowerCase();

          const { data: existing } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", uname)
            .single();
          exists = !!existing;
        }
        return uname;
      }

      const username = await generateUsername();
      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        username,
      });

      if (insertError) {
        console.error("Erro ao criar profile:", insertError.message);
      } else {
        console.log("Profile criado com username:", username);
      }
    }

    checkAndCreateProfile();
  }, []);

  return null;
}
