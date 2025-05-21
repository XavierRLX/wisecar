"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
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
      const res = await supabase
        .from("conversations")
        .select(`
          *,
          vehicles(brand, model, vehicle_images(image_url)),
          buyer:profiles!buyer_id(username),
          seller:profiles!seller_id(username),
          messages(id)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      const data = res.data as ConversationWithDetails[] | null;
      if (data) {
        setConversations(data.filter((c) => c.messages?.length));
      }
      setLoading(false);
    })();
  }, [userId, userLoading, router]);

  if (userLoading || loading) {
    return <LoadingState message="Carregando conversas..." />;
  }

  return (
    <div className="py-8 px-2 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Mensagens</h1>

      {conversations.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhuma conversa encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv) => (
            <li key={conv.id} className="border rounded-lg hover:shadow-md">
              <Link href={`/chat/${conv.id}`}>
                <a className="flex items-center gap-4 p-4">
                  <div className="w-20 h-20 relative">
                    {conv.vehicles.vehicle_images?.[0] ? (
                      <Image
                        src={conv.vehicles.vehicle_images[0].image_url}
                        alt={`${conv.vehicles.brand} ${conv.vehicles.model}`}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="bg-gray-200 rounded w-full h-full flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-bold text-gray-800">
                        {`${conv.vehicles.brand} ${conv.vehicles.model}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {conv.buyer?.username ?? conv.buyer_id}
                      </span>
                      {" — "}
                      <span className="font-medium">
                        {conv.seller?.username ?? conv.seller_id}
                      </span>
                    </p>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
