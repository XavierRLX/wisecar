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
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 p-4 sm:p-6">
      <div className="w-full max-w-sm bg-red-50 border border-red-200 rounded-lg shadow-md p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Lock className="w-6 h-6 text-red-600" />
          <h2 className="text-lg sm:text-xl font-bold text-red-600">Acesso Restrito</h2>
        </div>
        <p className="mt-4 text-center text-gray-700 text-sm sm:text-base">
          {message}
        </p>
        {onButtonClick && (
          <button
            onClick={onButtonClick}
            className="mt-6 w-full py-2 text-sm sm:text-base bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
