"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  /** Se fornecido, executa essa função; caso contrário, faz redirect para `redirectTo`. */
  onClick?: () => void;
  /** Se `onClick` não for passado, faz redirect para cá. */
  redirectTo?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onClick,
  redirectTo,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (redirectTo) {
      router.push(redirectTo);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 p-8 rounded-lg shadow-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-16 h-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      <h2 className="text-2xl font-semibold mt-4">{title}</h2>
      <p className="mt-2 text-gray-600 text-center">{description}</p>
      <button
        onClick={handleClick}
        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
