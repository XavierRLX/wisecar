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
        // Redireciona para a página de veículos após o login
        redirectTo: "http://localhost:3000/veiculos",
      },
    });
    if (error) {
      console.error("Erro no login:", error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">WiseCar</h1>
      <p className="text-gray-700 mb-8 text-center">
        Adicione os carros dos seus sonhos, compare preços e pesquise o mercado.
      </p>
      <button
        onClick={handleLogin}
        className="w-full max-w-xs py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        disabled={loading}
      >
        {loading ? "Carregando..." : "Entrar com Google"}
      </button>
    </div>
  );
}
