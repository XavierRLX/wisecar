// Exemplo em app/chat/page.tsx
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
      
      // Query com expansão utilizando aliases únicos
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          vehicles(brand,model),
          buyer:profiles!buyer_id(username),
          seller:profiles!seller_id(username),
          messages(id)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar conversas:", error.message);
      } else if (data) {
        // Filtrar apenas conversas que têm mensagens, se necessário
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
      <h1 className="text-3xl font-bold mb-4">Minhas Conversas</h1>
      {conversations.length === 0 ? (
        <p className="text-gray-600 text-center">Nenhuma conversa encontrada.</p>
      ) : (
        <ul className="space-y-4">
          {conversations.map((conv) => (
            <li key={conv.id} className="border p-4 rounded-lg hover:bg-gray-100 transition">
              <Link href={`/chat/${conv.id}`}>
                <div>
                  <p className="font-semibold">
                    Veículo: {conv.vehicles ? `${conv.vehicles.brand} ${conv.vehicles.model}` : conv.vehicle_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Participantes: {conv.buyer ? conv.buyer.username : conv.buyer_id} e {conv.seller ? conv.seller.username : conv.seller_id}
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(conv.created_at).toLocaleString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
