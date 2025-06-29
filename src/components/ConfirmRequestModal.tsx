// src/components/ConfirmRequestModal.tsx
"use client";

import { useState } from "react";
import Modal from "./Modal";
import { useVehicleRequests } from "@/hooks/useVehicleRequests";

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
  const { share, transfer, respond } = useVehicleRequests();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (action?: "accepted" | "rejected" | "cancelled") => {
    setLoading(true);
    try {
      if (mode === "share" && vehicleId && toUserId) {
        await share(vehicleId, toUserId, "share");
      } else if (mode === "transfer" && vehicleId && toUserId) {
        await transfer(vehicleId, toUserId, "transfer");
      } else if (mode === "respond" && requestId && action) {
        await respond(requestId, action);
      }
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Modo de resposta de pedido (aceitar/recusar)
  if (mode === "respond") {
    return (
      <Modal title="Responder Pedido" onClose={onClose}>
        <p>Deseja aceitar ou recusar este pedido?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => handleConfirm("rejected")}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            Recusar
          </button>
          <button
            onClick={() => handleConfirm("accepted")}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Processando..." : "Aceitar"}
          </button>
        </div>
      </Modal>
    );
  }

  // Modo de criar novo pedido (compartilhar ou transferir)
  const title = mode === "share" ? "Confirmar Compartilhamento" : "Confirmar Envio";
  const actionLabel = mode === "share" ? "Compartilhar" : "Enviar";

  return (
    <Modal title={title} onClose={onClose}>
      <p>
        Tem certeza que deseja <strong>{actionLabel.toLowerCase()}</strong> este veículo{" "}
        {toUserEmail ? `para ${toUserEmail}` : ""}?
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={() => handleConfirm()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? `${actionLabel}...` : actionLabel}
        </button>
      </div>
    </Modal>
  );
}
