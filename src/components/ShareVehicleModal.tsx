"use client";

import { useState } from "react";
import Modal from "./Modal";
import ConfirmRequestModal from "./ConfirmRequestModal";
import { useVehicleRequests } from "@/hooks/useVehicleRequests";
import { supabase } from "@/lib/supabase";

type SearchUser = { id: string; email: string; username?: string };

interface ShareVehicleModalProps {
  vehicleId: string;
  onClose: () => void;
}

export default function ShareVehicleModal({ vehicleId, onClose }: ShareVehicleModalProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SearchUser | null>(null);
  const { share } = useVehicleRequests();

  async function handleSearch() {
    setLoading(true);
    const { data, error } = await fetchProfiles(query);
    if (error) alert(error.message);
    else setUsers(data);
    setLoading(false);
  }

  if (selected) {
    return (
      <ConfirmRequestModal
        mode="share"
        vehicleId={vehicleId}
        toUserId={selected.id}
        toUserEmail={selected.email}
        onClose={() => {
          setSelected(null);
          onClose();
        }}
      />
    );
  }

  return (
    <Modal title="Compartilhar Veículo" onClose={onClose}>
      <input
        type="text"
        placeholder="Buscar por email ou username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 border rounded"
      />
      <button
        onClick={handleSearch}
        disabled={!query.trim() || loading}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Buscando…" : "Buscar"}
      </button>
      <div className="mt-4 max-h-48 overflow-auto">
        {users.map((u) => (
          <div
            key={u.id}
            onClick={() => setSelected(u)}
            className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between"
          >
            <span>{u.email}{u.username && ` (${u.username})`}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelected(u);
              }}
              className="px-2 py-1 bg-green-500 text-white rounded"
            >
              Selecionar
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// helper para busca de perfis
async function fetchProfiles(query: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,username")
    .or(`email.ilike.%${query}%,username.ilike.%${query}%`)
    .limit(10);
  return { data: data ?? [], error };
}
