// app/login/page.tsx
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
      options: { redirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL },
    });
    if (error) {
      console.error("Erro no login:", error.message);
      setErrorMessage("Erro ao realizar login, tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      {/* Logo e Tagline */}
      <div className="absolute top-8 left-1/2 w-full max-w-xs -translate-x-1/2 text-center">
        <Image
          unoptimized
          src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar/wisecarlogopng.png"
          alt="All Wheels Logo"
          width={160}
          height={40}
          className="mx-auto"
        />
        <p className="mt-4 text-base text-gray-700 TextColorPrimary">
          <span className="inline-block text-2xl font-extrabold tracking-tight text-gray-900 TextColorPrimary">
            AWX
          </span>{" "}
           - Conectando você a todas as experiências sobre rodas.
        </p>
      </div>

      {/* Card de Login */}
      <div className="relative z-10 w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-shadow hover:shadow-2xl/40">
        <h2 className="mb-6 text-center text-2xl font-extrabold text-gray-900 TextColorPrimary">
          Bem-vindo
        </h2>

        {errorMessage && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="flex w-full hover:cursor-pointer hover:bkgColorSecundary bkgColorPrimary items-center justify-center gap-3 rounded-lg bg-blue-600 py-3 text-white transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          <Image
            unoptimized
            src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar/google_logo.png"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Entrar com Google
        </button>
      </div>

      {/* Rodapé */}
      <footer className="absolute bottom-4 left-1/2 w-full max-w-xs -translate-x-1/2 text-center text-xs text-gray-500 TextColorPrimary ">
        © {new Date().getFullYear()} All Wheels. Todos os direitos reservados.
      </footer>
    </div>
  );
}
