"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/veiculos",
      },
    });

    if (error) {
      console.error("Erro no login:", error.message);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-600 p-4">
      <div className="bg-white shadow-xl rounded-2xl px-8 py-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">WiseCar</h1>
        <p className="text-gray-600 mb-8">
          Adicione carros dos seus sonhos, compare preços.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
