"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface BackButtonProps {
  /** Texto exibido ao lado do ícone */
  label?: string;
  /** Classes adicionais de Tailwind para customizar */
  className?: string;
  /** Rota alternativa caso não haja histórico anterior */
  fallbackHref?: string;
}

export default function BackButton({
  label = "Voltar",
  className = "",
  fallbackHref,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
    // Se não houver histórico, redirecione para fallback (caso configurado)
    if (fallbackHref && typeof window !== "undefined" && window.history.length <= 1) {
      router.push(fallbackHref);
    } else {
      router.back();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-2 text-gray-600 hover:text-gray-800 ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
