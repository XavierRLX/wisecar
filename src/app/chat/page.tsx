// app/chat/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { ConversationWithDetails } from "@/types";

export default function ChatListPage() {
  const router = useRouter();
  const { userId, loading: userLoading } = useCurrentUser();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !userId) {
      router.push("/login");
      return;
    }
    if (!userId) return;

    (async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          vehicles (
            brand,
            model,
            vehicle_images ( image_url )
          ),
          buyer:profiles!buyer_id ( username ),
          seller:profiles!seller_id ( username ),
          messages ( id )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (error) console.error("Erro ao buscar conversas:", error.message);
      setConversations(data || []);
      setLoading(false);
    })();
  }, [userId, userLoading, router]);

  if (userLoading || loading) {
    return <LoadingState message="Carregando conversas…" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Mensagens</h1>

      {conversations.length === 0 ? (
        <p className="text-center text-gray-500">Nenhuma conversa encontrada.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/chat/${conv.id}`}
              className="block"
            >
              <div className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition p-1">
                {/* Thumbnail */}
                {conv.vehicles.vehicle_images?.[0] ? (
                  <img
                    src={conv.vehicles.vehicle_images[0].image_url}
                    alt={`${conv.vehicles.brand} ${conv.vehicles.model}`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="text-xs text-gray-500">Sem imagem</span>
                  </div>
                )}

                {/* Info */}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {conv.vehicles.brand} {conv.vehicles.model}
                    </h3>
                    <time
                      className="text-xs text-gray-400"
                      dateTime={conv.created_at}
                    >
                      {new Date(conv.created_at).toLocaleDateString("pt-BR")}
                    </time>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 truncate">
                    <span className="font-medium text-gray-800">
                      {conv.buyer?.username ?? conv.buyer_id}
                    </span>
                    {" → "}
                    <span className="font-medium text-gray-800">
                      {conv.seller?.username ?? conv.seller_id}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
