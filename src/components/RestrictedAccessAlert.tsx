// components/RestrictedAccessAlert.tsx
"use client";

import { Lock } from "lucide-react";

interface RestrictedAccessAlertProps {
  message?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export default function RestrictedAccessAlert({
  message = "Esta área é exclusiva para vendedores. Para acessar, assine um plano ou atualize seu perfil.",
  buttonText = "Assinar Plano",
  onButtonClick,
}: RestrictedAccessAlertProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg shadow-md">
      <div className="flex items-center gap-2">
        <Lock className="w-6 h-6 text-red-600" />
        <h2 className="text-xl font-bold text-red-600">Acesso Restrito</h2>
      </div>
      <p className="mt-4 text-center text-gray-700">
        {message}
      </p>
      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className="mt-6 px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
