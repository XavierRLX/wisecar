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

  // lista de carros da garagem
  const [vehicles, setVehicles] = useState<{ id: string; brand: string; model: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // estado pra controlar seleção do select
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");

  // spinner de submissão
  const [submitting, setSubmitting] = useState(false);

  // carrega os veículos do usuário
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return router.push("/login");
      supabase
        .from("vehicles")
        .select("id, brand, model")
        .eq("owner_id", data.user.id)
        .eq("is_for_sale", false)
        .order("brand", { ascending: true })
        .order("model", { ascending: true })
        .then(({ data: vs, error }) => {
          if (error) {
            console.error(error);
            setVehicles([]);
          } else {
            setVehicles(vs || []);
          }
          setLoading(false);
        });
    });
  }, [router]);

  const initial: MaintenanceValues = {
    vehicleId: "",          // não será usado diretamente
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

  async function handleSubmit(values: MaintenanceValues) {
    // garanta que pegamos do select controlado
    const vehicleId = selectedVehicle || values.vehicleId;
    if (!vehicleId) {
      throw new Error("Selecione um veículo");
    }

    setSubmitting(true);
    // 1) cria o registro de manutenção
    const { data, error } = await supabase
      .from("maintenance_records")
      .insert({
        vehicle_id: vehicleId,
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
    if (error || !data?.id) {
      setSubmitting(false);
      throw error || new Error("Erro ao criar manutenção");
    }
    const recordId = data.id;

    // 2) insere as peças
    if (values.parts.length > 0) {
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
      if (e2) {
        console.error(e2);
      }
    }

    // 3) atualiza o custo
    const total =
      values.parts.reduce((sum, p) => sum + p.price * p.quantity, 0) +
      +values.laborCost;
    await supabase
      .from("maintenance_records")
      .update({ cost: total })
      .eq("id", recordId);

    router.push("/manutencoes");
  }

  if (loading) return <LoadingState message="Carregando veículos…" />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <MaintenanceForm
        initial={initial}
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </AuthGuard>
  );
}
