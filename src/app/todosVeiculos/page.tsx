// app/todosVeiculos/page.tsx
"use client";

import { useEffect, useState } from "react";
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
      const { data: { user } } = await supabase.auth.getUser();
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

  // toggle favorito (só faz sentido em veículos desejados)
  async function toggleFavorite(id: string) {
    if (!userId) return;
    const isFav = favorites.includes(id);
    if (!isFav) {
      const { error } = await supabase.from("favorites").insert({ user_id: userId, vehicle_id: id });
      if (!error) setFavorites((f) => [...f, id]);
    } else {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("vehicle_id", id);
      if (!error) setFavorites((f) => f.filter((x) => x !== id));
    }
  }

  // delete universal (anúncio ou garagem)
  async function handleDelete(id: string) {
    // remove imagens
    const { data: imgs } = await supabase
      .from("vehicle_images")
      .select("image_url")
      .eq("vehicle_id", id);
    for (const img of imgs || []) {
      const bucket = "vehicle-images";
      const prefix = `/public/${bucket}/`;
      const idx = img.image_url.indexOf(prefix);
      if (idx !== -1) {
        const path = img.image_url.substring(idx + prefix.length);
        await supabase.storage.from(bucket).remove([path]);
      }
    }
    // remove veículo
    await supabase.from("vehicles").delete().eq("id", id);
    refetch();
  }

  if (loading) return <LoadingState message="Carregando veículos..." />;
  if (error) return <p className="p-8 text-red-500">Erro: {error}</p>;

  return (
    <AuthGuard>
      <EnsureProfile />

      <div className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        {/* —— CONTROLE DE FILTRO —— */}
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
            {(["all", "desire", "garage"] as VehicleMode[]).map((m, i) => {
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

        {/* —— LISTAGEM —— */}
        {vehicles.length === 0 ? (
          <EmptyState
            title="Nenhum veículo encontrado"
            description="Altere o filtro acima ou adicione novos veículos."
            buttonText="Adicionar Veículo"
            redirectTo="/adicionar"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                onClick={() => router.push(`/veiculos/${v.id}`)}
                className="cursor-pointer"
              >
                <VehicleCard
                  vehicle={v}
                  isFavorited={v.is_for_sale ? favorites.includes(v.id) : undefined}
                  onToggleFavorite={v.is_for_sale ? toggleFavorite : undefined}
                  onDelete={handleDelete}
                  extraActions={
                    !v.is_for_sale && ( // só mostra se for garagem
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/veiculos/${v.id}/manutencoes`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                          aria-label="Manutenções"
                        >
                          <Wrench className="w-5 h-5" />
                          <span className="text-sm">Manutenções</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(v.id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-red-600 transition"
                          aria-label="Excluir veículo"
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
