"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Image from "next/image"; 

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setErrorMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL || "http://localhost:3000/veiculos",
      },
    });

    if (error) {
      console.error("Erro no login:", error.message);
      setErrorMessage("Erro ao realizar login, tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-300 relative flex h-screen items-center justify-center p-4">
      {/* Elementos de fundo */}
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-center">
        <Image
          unoptimized
          src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar//allwheels_logo_png.png"
          alt="WiseCar Logo"
          width={200}
          height={100}
          className="mx-auto"
        />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-lg TextColorPrimary">
          Adicione carros dos seus sonhos.
        </p>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 bg-white shadow-md rounded-lg px-8 py-10 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 TextColorPrimary mb-6">Login !</h2>
        {errorMessage && (
          <p className="mb-4 text-sm text-red-500">{errorMessage}</p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bkgColorPrimary text-white cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
          aria-label="Entrar com Google"
        >
          {loading && <Loader2 className="animate-spin w-5 h-5" />}
          <Image
            unoptimized
            src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar//google_logo.png"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Entrar com Google
        </button>
      </div>
    </div>
  );
}
