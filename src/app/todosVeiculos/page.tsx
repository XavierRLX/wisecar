// app/todosVeiculos/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import EnsureProfile from "@/components/EnsureProfile";
import { useVehicles, VehicleMode } from "@/hooks/useVehicles";
import { supabase } from "@/lib/supabase";
import VehicleCard from "@/components/VehicleCard";
import EmptyState from "@/components/EmptyState";
import LoadingState from "@/components/LoadingState";
import { Wrench, Trash2, Heart } from "lucide-react";

export default function TodosVeiculosPage() {
  const router = useRouter();
  const [mode, setMode] = useState<VehicleMode>("all");
  const { vehicles, loading, error, refetch } = useVehicles(mode);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // carrega favoritos
  useEffect(() => {
    async function loadFavs() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data, error } = await supabase
        .from("favorites")
        .select("vehicle_id")
        .eq("user_id", user.id);
      if (!error && data) setFavorites(data.map((f: any) => f.vehicle_id));
    }
    loadFavs();
  }, []);

  // toggle favorito (apenas em desejados)
  async function toggleFavorite(id: string) {
    if (!userId) return;
    const isFav = favorites.includes(id);
    if (!isFav) {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, vehicle_id: id });
      if (!error) setFavorites(f => [...f, id]);
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", id);
      if (!error) setFavorites(f => f.filter(x => x !== id));
    }
  }

  // delete universal
  async function handleDelete(id: string) {
    // remove imagens
    const { data: imgs } = await supabase
      .from("vehicle_images")
      .select("image_url")
      .eq("vehicle_id", id);
    for (const img of imgs || []) {
      const marker = `/public/vehicle-images/`;
      const idx = img.image_url.indexOf(marker);
      if (idx !== -1) {
        const path = img.image_url.substring(idx + marker.length);
        await supabase.storage.from("vehicle-images").remove([path]);
      }
    }
    // remove veículo
    await supabase.from("vehicles").delete().eq("id", id);
    refetch();
  }

  // lista ordenada por "brand model"
  const sorted = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      const nameA = `${a.brand} ${a.model}`.toLowerCase();
      const nameB = `${b.brand} ${b.model}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [vehicles]);

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* Filtro de modo */}
        <div className="flex justify-center mb-6">
          <div className="relative inline-flex bg-gray-200 rounded-full p-1 h-10 w-72">
            <div
              style={{
                left:
                  mode === "all"
                    ? "1px"
                    : mode === "desire"
                    ? "calc(100%/3 + 1px)"
                    : "calc(2 * 100%/3 + 1px)",
              }}
              className="absolute top-1 h-8 w-1/3 bg-white rounded-full shadow transition-all duration-300"
            />
            {(["all", "desire", "garage"] as VehicleMode[]).map(m => {
              const labels = { all: "Todos", desire: "Desejado", garage: "Garagem" };
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 flex-1 text-sm font-medium transition-colors ${
                    mode === m ? "text-blue-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {labels[m]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listagem */}
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingState message="Carregando veículos..." />
          </div>
        ) : error ? (
          <p className="p-8 text-red-500">Erro: {error}</p>
        ) : sorted.length === 0 ? (
          <EmptyState
            title="Nenhum veículo encontrado"
            description="Altere o filtro acima ou adicione novos veículos."
            buttonText="Adicionar Veículo"
            redirectTo="/adicionar"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sorted.map(v => (
              <div key={v.id} className="cursor-pointer">
                <VehicleCard
                  vehicle={v}
                  isFavorited={v.is_for_sale ? favorites.includes(v.id) : undefined}
                  onToggleFavorite={v.is_for_sale ? toggleFavorite : undefined}
                  onDelete={v.is_for_sale ? handleDelete : undefined}
                  extraActions={
                    !v.is_for_sale && (
                      <div className="flex justify-end space-x-2 mt-2">
                        {/* Navega para a página global de manutenções, já filtrada */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            router.push(`/manutencoes?vehicleId=${v.id}`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        >
                          <Wrench className="w-5 h-5" />
                          <span className="text-sm">Manutenções</span>
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(v.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
