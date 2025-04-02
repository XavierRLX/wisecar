// lib/chatService.ts
import { supabase } from "@/lib/supabase";

// Função que busca uma conversa existente ou cria uma nova
export async function getOrCreateConversation(
  vehicleId: string,
  buyerId: string,
  sellerId: string
) {
  // Tente buscar uma conversa existente para essa combinação
  let { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("vehicle_id", vehicleId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .limit(1);

  if (error) {
    throw error;
  }

  if (conversations && conversations.length > 0) {
    return conversations[0];
  }

  // Se não existir, crie uma nova conversa
  const { data, error: insertError } = await supabase
    .from("conversations")
    .insert({ vehicle_id: vehicleId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return data;
}
