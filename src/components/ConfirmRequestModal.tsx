"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import {
  createVehicleRequest,
  respondVehicleRequest,
  RequestType,
} from "@/hooks/useVehicleRequests";

interface ConfirmRequestModalProps {
  mode: "share" | "transfer" | "respond";
  vehicleId?: string;
  toUserId?: string;
  toUserEmail?: string;
  requestId?: string;
  onClose: () => void;
}

export default function ConfirmRequestModal({
  mode,
  vehicleId,
  toUserId,
  toUserEmail,
  requestId,
  onClose,
}: ConfirmRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handle = async (action?: "accepted" | "rejected" | "cancelled") => {
    setLoading(true);
    try {
      if (mode === "share" || mode === "transfer") {
        await createVehicleRequest(
          vehicleId!,
          toUserId!,
          mode as RequestType
        );
      } else {
        await respondVehicleRequest(requestId!, action!);
      }
      onClose();
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const title =
    mode === "share"
      ? "Confirmar Compartilhamento"
      : mode === "transfer"
      ? "Confirmar Envio"
      : "Responder Pedido";

  const question =
    mode === "share"
      ? `Compartilhar este veículo com ${toUserEmail}?`
      : mode === "transfer"
      ? `Enviar este veículo para ${toUserEmail}?`
      : "Deseja aceitar ou recusar este pedido?";

  return (
    <Modal title={title} onClose={onClose}>
      <p className="mb-4">{question}</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancelar
        </button>

        {mode === "respond" ? (
          <>
            <button
              onClick={() => handle("rejected")}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              {loading ? "…" : "Recusar"}
            </button>
            <button
              onClick={() => handle("accepted")}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              {loading ? "…" : "Aceitar"}
            </button>
          </>
        ) : (
          <button
            onClick={() => handle()}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "…" : "Confirmar"}
          </button>
        )}
      </div>
    </Modal>
  );
}
