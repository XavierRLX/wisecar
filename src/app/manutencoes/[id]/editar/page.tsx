// app/manutencoes/[id]/editar/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import MaintenanceForm, { MaintenanceValues } from "@/components/MaintenanceForm";
import { supabase } from "@/lib/supabase";

export default function EditMaintenancePage() {
  const router = useRouter();
  const { id } = useParams();
  const [initial, setInitial] = useState<MaintenanceValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: rec, error: e1 } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("id", id)
        .single();
      if (e1 || !rec) {
        router.push("/manutencoes");
        return;
      }
      const { data: ps } = await supabase
        .from("maintenance_parts")
        .select("*")
        .eq("maintenance_record_id", id);

      setInitial({
        maintenanceName: rec.maintenance_name,
        status: rec.status,
        maintenanceType: rec.maintenance_type,
        scheduledDate: rec.scheduled_date || "",
        scheduledKm: rec.scheduled_km?.toString() || "",
        completedDate: rec.completed_date || "",
        completedKm: rec.completed_km?.toString() || "",
        provider: rec.provider || "",
        notes: rec.notes || "",
        laborCost: (rec.cost || 0).toString(),
        parts: (ps || []).map((p) => ({
          id: p.id,
          name: p.name,
          brand: p.brand || "",
          purchase_place: p.purchase_place || "",
          quantity: p.quantity,
          price: p.price,
        })),
      });
      setLoading(false);
    }
    load();
  }, [id, router]);

  const handleSubmit = async (values: MaintenanceValues) => {
    setSubmitting(true);
    // update record
    await supabase
      .from("maintenance_records")
      .update({
        maintenance_name: values.maintenanceName,
        status: values.status,
        maintenance_type: values.maintenanceType,
        scheduled_date: values.scheduledDate || null,
        scheduled_km: +values.scheduledKm || null,
        completed_date: values.completedDate || null,
        completed_km: +values.completedKm || null,
        provider: values.provider || null,
        notes: values.notes || null,
        cost: values.parts.reduce((s,p)=>s+p.price*p.quantity,0) + +values.laborCost,
      })
      .eq("id", id);

    // replace parts
    await supabase.from("maintenance_parts").delete().eq("maintenance_record_id", id);
    if (values.parts.length) {
      await supabase
        .from("maintenance_parts")
        .insert(
          values.parts.map((p) => ({
            maintenance_record_id: id,
            name: p.name,
            brand: p.brand || null,
            purchase_place: p.purchase_place || null,
            quantity: p.quantity,
            price: p.price,
          }))
        );
    }
    router.push("/manutencoes");
  };

  if (loading || !initial) return <LoadingState message="Carregando dados…" />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <MaintenanceForm
        initial={initial}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </AuthGuard>
  );
}
