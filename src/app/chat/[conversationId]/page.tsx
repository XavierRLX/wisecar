// app/chat/[conversationId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";

export default function ChatPage() {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Função para buscar as mensagens da conversa
  async function fetchMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (conversationId) {
      fetchMessages();

      // (Opcional) Configurar Supabase Realtime para atualizar as mensagens em tempo real
      const subscription = supabase
        .channel("chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [conversationId]);

  // Função para enviar uma nova mensagem
  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Obter o ID do usuário remetente
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: newMessage,
      });

    if (error) {
      console.error("Erro ao enviar mensagem:", error.message);
    } else {
      setNewMessage("");
      // A mensagem será adicionada via Realtime ou atualize o estado manualmente:
      // setMessages((prev) => [...prev, data[0]]);
    }
  }

  if (loading) return <LoadingState message="Carregando chat..." />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="border p-4 rounded-lg h-96 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            {/* Aqui você pode buscar o nome do usuário a partir do sender_id se tiver essa informação */}
            <p className="text-sm text-gray-600">
              <strong>{msg.sender_id}</strong>: {msg.content}
            </p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
