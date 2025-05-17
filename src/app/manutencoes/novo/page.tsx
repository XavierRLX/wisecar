// app/manutencoes/novo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import MaintenanceForm, { MaintenanceValues } from "@/components/MaintenanceForm";
import { supabase } from "@/lib/supabase";

export default function NewMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<{ id: string; brand: string; model: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // load user’s garage vehicles
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.push("/login");
      supabase
        .from("vehicles")
        .select("id,brand,model")
        .eq("owner_id", data.user.id)
        .eq("is_for_sale", false)
        .order("brand")
        .order("model")
        .then(({ data: vs }) => {
          setVehicles(vs || []);
          setLoading(false);
        });
    });
  }, [router]);

  const initial: MaintenanceValues = {
    vehicleId: "",
    maintenanceName: "",
    status: "A fazer",
    maintenanceType: "preventiva",
    scheduledDate: "",
    scheduledKm: "",
    completedDate: "",
    completedKm: "",
    provider: "",
    notes: "",
    laborCost: "",
    parts: [],
  };

  const handleSubmit = async (values: MaintenanceValues) => {
    if (!values.vehicleId) throw new Error("Selecione um veículo");
    setSubmitting(true);

    // insert maintenance
    const { data, error } = await supabase
      .from("maintenance_records")
      .insert({
        vehicle_id: values.vehicleId,
        maintenance_name: values.maintenanceName,
        status: values.status,
        maintenance_type: values.maintenanceType,
        scheduled_date: values.scheduledDate || null,
        scheduled_km: +values.scheduledKm || null,
        completed_date: values.completedDate || null,
        completed_km: +values.completedKm || null,
        provider: values.provider || null,
        notes: values.notes || null,
        cost: 0,
      })
      .select("id")
      .single();
    if (error || !data.id) throw error || new Error("Erro ao criar");

    const recordId = data.id;

    // insert parts
    if (values.parts.length) {
      const { error: e2 } = await supabase
        .from("maintenance_parts")
        .insert(
          values.parts.map((p) => ({
            maintenance_record_id: recordId,
            name: p.name,
            brand: p.brand || null,
            purchase_place: p.purchase_place || null,
            quantity: p.quantity,
            price: p.price,
          }))
        );
      if (e2) throw e2;
    }

    // update cost
    const total = values.parts.reduce((s, p) => s + p.price * p.quantity, 0) + +values.laborCost;
    await supabase
      .from("maintenance_records")
      .update({ cost: total })
      .eq("id", recordId);

    router.push("/manutencoes");
  };

  if (loading) return <LoadingState message="Carregando veículos…" />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <MaintenanceForm
        initial={initial}
        vehicles={vehicles}
        selectedVehicle={initial.vehicleId}
        onVehicleChange={(id) => (initial.vehicleId = id)}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </AuthGuard>
  );
}
