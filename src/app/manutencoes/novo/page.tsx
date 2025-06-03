// app/manutencoes/novo/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import MaintenanceWizardForm from "@/components/MaintenanceWizardForm";
import type {
  MaintenanceValues,
  PartForm,
  DocForm,
} from "@/components/MaintenanceWizardForm.types";

export default function NewMaintenancePage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<
    { id: string; brand: string; model: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");

  // Carrega veículos do usuário atual
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      supabase
        .from("vehicles")
        .select("id, brand, model")
        .eq("owner_id", data.user.id)
        .in("status", ["GARAGE", "FOR_SALE"])
        .order("brand", { ascending: true })
        .order("model", { ascending: true })
        .then(({ data: vs, error }) => {
          if (error) console.error(error);
          setVehicles(vs || []);
          setLoading(false);
        });
    });
  }, [router]);

  // Valores iniciais para o Wizard (automapa campos vazios)
  const initial: MaintenanceValues = {
    vehicleId: "",
    category: "manutencao",
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
    docs: [],
  };

  //  → O mesmo handleSubmit que você já tinha adaptado, mas agora recebe MaintenanceValues
  async function handleSubmit(values: MaintenanceValues) {
    const vehicleId = selectedVehicle || values.vehicleId;
    if (!vehicleId) throw new Error("Selecione um veículo");
    setSubmitting(true);

    // 1) Cria a maintenance_records
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
        cost: 0, // atualizaremos logo após
      })
      .select("id")
      .single();

    if (error || !data?.id) {
      setSubmitting(false);
      throw error || new Error("Erro ao criar manutenção");
    }
    const recordId = data.id;

    // 2) Insere as partes (manutenção_parts)
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

    // 3) Atualiza custo total (peças + mão de obra)
    const partsTotal = values.parts.reduce(
      (sum, p) => sum + (parseFloat(p.price) || 0) * (parseInt(p.quantity) || 0),
      0
    );
    await supabase
      .from("maintenance_records")
      .update({ cost: partsTotal + (parseFloat(values.laborCost) || 0) })
      .eq("id", recordId);

    // 4) Faz upload e grava documentos (maintenance_docs)
    if (values.docs.length > 0) {
      await Promise.all(
        values.docs.map(async (doc) => {
          const path = `${recordId}/${doc.file!.name}`;
          // 4.1) Upload para o bucket "maintenance-docs"
          const { error: uploadErr } = await supabase
            .storage
            .from("maintenance-docs")
            .upload(path, doc.file!);
          if (uploadErr) throw uploadErr;

          // 4.2) Recupera a URL pública
          const {
            data: { publicUrl },
          } = supabase
            .storage
            .from("maintenance-docs")
            .getPublicUrl(path);

          // 4.3) Grava registro em maintenance_docs
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
      <MaintenanceWizardForm
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
