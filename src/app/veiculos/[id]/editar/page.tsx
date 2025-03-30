"use client";

import EditVehicleForm from "@/components/EditVehicleForm";
import AuthGuard from "@/components/AuthGuard";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Vehicle } from "@/types";

export default function EditVehiclePage() {
  const { id } = useParams();
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVehicle() {
      setLoading(true);
      // Busca o veículo com suas relações
      const { data, error } = await supabase
        .from("vehicles")
        .select(
          "*, seller_details(*), vehicle_optionals!inner(optional:optionals(*)), vehicle_images(*)"
        )
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else if (data) {
        // Verifica se o usuário autenticado é o dono do veículo
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && user.id !== data.user_id) {
          setError("Você não tem permissão para editar este veículo.");
        } else {
          setVehicle(data);
        }
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
