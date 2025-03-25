// Em app/veiculos/[id]/editar/page.tsx
"use client";

import EditVehicleForm from "@/components/EditVehicleForm"; // ajuste o caminho se necessário
import AuthGuard from "@/components/AuthGuard";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export default function EditVehiclePage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicle() {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*, seller_details(*), vehicle_optionals!inner(optional:optionals(*)), vehicle_images(*)")
        .eq("id", id)
        .single();
      if (error) {
        setError(error.message);
      } else {
        setVehicle(data);
      }
      setLoading(false);
    }
    if (id) fetchVehicle();
  }, [id]);

  if (loading) return <p className="p-8">Carregando veículo...</p>;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;
  if (!vehicle) return <p className="p-8">Veículo não encontrado</p>;

  return (
    <AuthGuard>
      <EditVehicleForm vehicle={vehicle} />
    </AuthGuard>
  );
}
