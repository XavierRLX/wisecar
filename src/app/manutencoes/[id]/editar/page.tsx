"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import LoadingState from "@/components/LoadingState";
import MaintenanceForm, { MaintenanceValues } from "@/components/MaintenanceForm";
import { supabase } from "@/lib/supabase";
import { MaintenancePart } from "@/types";

export default function EditMaintenancePage() {
  const router = useRouter();
  const { id } = useParams();

  const [initial, setInitial]       = useState<MaintenanceValues | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data: rec } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("id", id)
        .single();
      if (!rec) return router.push("/manutencoes");

      const { data: rawParts } = await supabase
        .from("maintenance_parts")
        .select("*")
        .eq("maintenance_record_id", id);

      const partsArray: MaintenancePart[] = rawParts ?? [];
      const partsTotal = partsArray.reduce((sum, p) => sum + p.price * p.quantity, 0);
      const laborOnly  = (rec.cost || 0) - partsTotal;

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
        laborCost: laborOnly.toString(),
        parts: partsArray.map(p => ({
          id: p.id,
          name: p.name,
          brand: p.brand || "",
          purchase_place: p.purchase_place || "",
          quantity: p.quantity.toString(),
          price: p.price.toString(),
        })),
      });

      setLoading(false);
    }
    load();
  }, [id, router]);

  async function handleSubmit(values: MaintenanceValues) {
    setSubmitting(true);

    // ... mesmo código de update + delete/insert parts ...

    router.push("/manutencoes");
  }

  if (loading || !initial) return <LoadingState message="Carregando dados…" />;

  return (
    <AuthGuard>
      <EnsureProfile />
      <MaintenanceForm
        initial={initial}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        submitting={submitting}
      />
    </AuthGuard>
  );
}
