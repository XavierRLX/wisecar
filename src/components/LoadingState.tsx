"use client";

import React from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ message = "Carregando..." }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[calc(100vh-80px)] text-gray-600">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-lg font-medium">{message}</p>
    </div>
  );
};

export default LoadingState;
