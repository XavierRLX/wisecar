// app/veiculos/novo/page.tsx
"use client";

import React from "react";
import AuthGuard from "@/components/AuthGuard";
import VehicleWizardForm from "@/components/VehicleWizardForm";

export default function AddVehiclePage() {
  return (
    <AuthGuard>
      <div className="px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6">
          Cadastrar Novo Veículo
        </h1>
        <VehicleWizardForm />
      </div>
    </AuthGuard>
  );
}
