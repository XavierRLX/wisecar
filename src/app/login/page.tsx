"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Redireciona para a tela protegida após login; ajuste a URL conforme necessário
        redirectTo: "http://localhost:3000/login/protected",
      },
    });
    if (error) {
      console.error("Erro no login:", error.message);
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <button
        onClick={handleLogin}
        className="bg-blue-500 text-white p-4 rounded"
        disabled={loading}
      >
        {loading ? "Carregando..." : "Entrar com Google"}
      </button>
    </div>
  );
}
