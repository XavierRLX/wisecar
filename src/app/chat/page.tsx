"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import Link from "next/link";

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversations() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // Query com expansão usando aliases e incluindo os dados do veículo e dos perfis, inclusive as imagens do veículo
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          vehicles(brand, model, vehicle_images(image_url)),
          buyer:profiles!buyer_id(username),
          seller:profiles!seller_id(username),
          messages(id)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar conversas:", error.message);
      } else if (data) {
        // Opcional: filtrar apenas conversas que têm mensagens
        const filtered = data.filter(conv => conv.messages && conv.messages.length > 0);
        setConversations(filtered);
      }
      setLoading(false);
    }
    fetchConversations();
  }, [router]);

  if (loading) return <LoadingState message="Carregando conversas..." />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {conversations.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhuma conversa encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-colors"
            >
              <Link href={`/chat/${conv.id}`}>
                <div className="flex items-center gap-4">
                  {/* Imagem do veículo à esquerda */}
                  <div className="w-20 h-20 flex-shrink-0">
                    {conv.vehicles && conv.vehicles.vehicle_images && conv.vehicles.vehicle_images.length > 0 ? (
                      <img
                        src={conv.vehicles.vehicle_images[0].image_url}
                        alt={`${conv.vehicles.brand} ${conv.vehicles.model}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">Sem imagem</span>
                      </div>
                    )}
                  </div>
                  {/* Informações da conversa */}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-gray-800">
                        {conv.vehicles ? `${conv.vehicles.brand} ${conv.vehicles.model}` : "Veículo"}
                      </p>
                      <p className="text-xs text-gray-500 p-2">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">
                        {conv.buyer ? conv.buyer.username : conv.buyer_id}
                      </span>
                      <span> &mdash; </span>
                      <span className="font-medium">
                        {conv.seller ? conv.seller.username : conv.seller_id}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
