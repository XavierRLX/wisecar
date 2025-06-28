//envios-compartilhamentos
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import LoadingState from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ConfirmRequestModal from "@/components/ConfirmRequestModal";

type UIRequest = {
  id: string;
  type: "share" | "transfer";
  status: "pending" | "accepted" | "rejected" | "cancelled";
  brand: string;
  model: string;
  from_user: string;
  to_user: string;
  from_email: string;
  to_email: string;
};

export default function EnviosCompartilhamentosPage() {
  const [sent, setSent] = useState<UIRequest[]>([]);
  const [received, setReceived] = useState<UIRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{
    mode: "respond";
    requestId: string;
  } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    const { data, error } = await supabase
      .from("vehicle_requests")
      .select(`
        id,
        type,
        status,
        from_user,
        to_user,
        vehicles(brand,model),
        from_user_profile:profiles!from_user(email),
        to_user_profile:profiles!to_user(email)
      `)
      .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.error(error);
      setLoading(false);
      return;
    }

    const all: UIRequest[] = data.map((r) => ({
      id: r.id,
      type: r.type as any,
      status: r.status as any,
      brand: r.vehicles[0]?.brand ?? "",
      model: r.vehicles[0]?.model ?? "",
      from_user: r.from_user,
      to_user: r.to_user,
      from_email: r.from_user_profile[0]?.email ?? "",
      to_email: r.to_user_profile[0]?.email ?? "",
    }));

    setSent(all.filter((r) => r.from_user === user.id && r.status === "pending"));
    setReceived(all.filter((r) => r.to_user === user.id && r.status === "pending"));
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <LoadingState message="Carregando pedidos…" />;

  return (
    <AuthGuard>
      <div className="max-w-3xl mx-auto p-4 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-2">Pedidos Enviados</h2>
          {sent.length === 0 ? (
            <EmptyState description="Nenhum pedido enviado." title={""} buttonText={""} />
          ) : (
            sent.map((r) => (
              <div key={r.id} className="flex justify-between items-center p-2 border-b">
                <span>
                  {r.type === "share" ? "Compartilhar" : "Enviar"}{" "}
                  <strong>{r.brand} {r.model}</strong> → {r.to_email}
                </span>
                <button
                  onClick={() => setActiveModal({ mode: "respond", requestId: r.id })}
                  className="px-2 py-1 bg-gray-300 rounded"
                >
                  Cancelar
                </button>
              </div>
            ))
          )}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-2">Pedidos Recebidos</h2>
          {received.length === 0 ? (
            <EmptyState description="Nenhum pedido recebido." title={""} buttonText={""} />
          ) : (
            received.map((r) => (
              <div key={r.id} className="flex justify-between items-center p-2 border-b">
                <span>
                  {r.type === "share" ? "Compartilhar" : "Enviar"}{" "}
                  <strong>{r.brand} {r.model}</strong> ← {r.from_email}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveModal({ mode: "respond", requestId: r.id })}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => setActiveModal({ mode: "respond", requestId: r.id })}
                    className="px-2 py-1 bg-green-500 text-white rounded"
                  >
                    Aceitar
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      {activeModal && (
        <ConfirmRequestModal
          mode="respond"
          requestId={activeModal.requestId}
          onClose={() => {
            setActiveModal(null);
            fetchRequests();
          }}
        />
      )}
    </AuthGuard>
  );
}
