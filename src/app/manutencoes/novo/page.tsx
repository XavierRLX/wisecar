'use client';

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
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // src/app/manutencoes/novo/page.tsx
useEffect(() => {
  supabase.auth.getUser().then(({ data }) => {
    if (!data.user) return router.push("/login");
    supabase
    .from("vehicles")
    .select("id, brand, model")
    .eq("owner_id", data.user.id)
    .in("status", ["GARAGE", "FOR_SALE"])   // ← garagem **e** à venda
    .order("brand", { ascending: true })
    .order("model", { ascending: true })
    .then(({ data: vs, error }) => {
      if (error) console.error(error);
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
    docs: [],           // ← adiciona docs aqui
  };

  async function handleSubmit(values: MaintenanceValues) {
    const vehicleId = selectedVehicle || values.vehicleId;
    if (!vehicleId) throw new Error("Selecione um veículo");
    setSubmitting(true);

    // 1) cria manutenção
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

    // 2) insere peças
    if (values.parts.length > 0) {
      await supabase
        .from("maintenance_parts")
        .insert(
          values.parts.map((p) => ({
            maintenance_record_id: recordId,
            name: p.name,
            brand: p.brand || null,
            purchase_place: p.purchase_place || null,
            quantity: +p.quantity,
            price: +p.price,
          }))
        );
    }

    // 3) atualiza custo total
    const partsTotal = values.parts.reduce(
      (sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0),
      0
    );
    await supabase
      .from("maintenance_records")
      .update({ cost: partsTotal + (parseFloat(values.laborCost) || 0) })
      .eq("id", recordId);

    // 4) faz upload dos docs e insere em maintenance_docs
    if (values.docs.length > 0) {
      await Promise.all(
        values.docs.map(async (doc) => {
          const path = `${recordId}/${doc.file!.name}`;
          // upload para o bucket "maintenance-docs"
          const { error: uploadErr } = await supabase
            .storage
            .from("maintenance-docs")
            .upload(path, doc.file!);
          if (uploadErr) throw uploadErr;

          // recupera URL pública
          const { data: { publicUrl } } = supabase
            .storage
            .from("maintenance-docs")
            .getPublicUrl(path);

          // insere metadados no banco
          const { error: dbErr } = await supabase
            .from("maintenance_docs")
            .insert({
              maintenance_record_id: recordId,
              title: doc.title,
              file_url: publicUrl,
            });
          if (dbErr) throw dbErr;
        })
      );
    }

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
        onCancel={() => router.back()}
        submitting={submitting}
      />
    </AuthGuard>
  );
}
