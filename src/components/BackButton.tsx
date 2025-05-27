"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import React from "react";

interface BackButtonProps {
  label?: string;
  className?: string;
  fallbackHref?: string;
}

export default function BackButton({
  label = "",
  className = "",
  fallbackHref,
}: BackButtonProps) {
  const router = useRouter();

  function handleClick() {
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
      className={`flex items-center text-gray-600 hover:text-gray-800 ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
