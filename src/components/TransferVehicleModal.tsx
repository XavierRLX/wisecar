"use client";

import { useState } from "react";
import Modal from "./Modal";
import ConfirmRequestModal from "./ConfirmRequestModal";
import { supabase } from "@/lib/supabase";

type SearchUser = {
  id: string;
  email: string;
  username?: string;
};

interface TransferVehicleModalProps {
  vehicleId: string;
  onClose: () => void;
}

export default function TransferVehicleModal({
  vehicleId,
  onClose,
}: TransferVehicleModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, username")
      .or(`email.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10);

    if (error) {
      alert(error.message);
    } else {
      setUsers(data as SearchUser[]);
    }

    setLoading(false);
  };

  if (selectedUser) {
    return (
      <ConfirmRequestModal
        mode="transfer"
        vehicleId={vehicleId}
        toUserId={selectedUser.id}
        toUserEmail={selectedUser.email}
        onClose={() => {
          setSelectedUser(null);
          onClose();
        }}
      />
    );
  }

  return (
    <Modal title="Enviar Veículo" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          placeholder="Digite email ou username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>

        <div className="max-h-64 overflow-auto">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex justify-between items-center p-2 border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedUser(u)}
            >
              <span>
                {u.email} {u.username && `(${u.username})`}
              </span>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedUser(u);
                }}
              >
                Selecionar
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
