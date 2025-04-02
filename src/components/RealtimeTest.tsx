// components/RealtimeTest.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface RealtimeTestProps {
  conversationId?: string; // Permite string ou undefined
}

export default function RealtimeTest({ conversationId }: RealtimeTestProps) {
  useEffect(() => {
    if (!conversationId) {
      console.warn("RealtimeTest: conversationId está indefinido.");
      return;
    }

    console.log("RealtimeTest: Iniciando assinatura para conversationId:", conversationId);
    
    // Cria a assinatura para mensagens na conversa
    const testChannel = supabase
      .channel("test-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("RealtimeTest: Nova mensagem inserida:", payload.new);
        }
      )
      .subscribe((status) => {
        console.log("RealtimeTest: Status da assinatura:", status);
      });

    return () => {
      supabase.removeChannel(testChannel);
    };
  }, [conversationId]);

  return null;
}
