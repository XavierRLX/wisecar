"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LoadingState from "@/components/LoadingState";
import RealtimeTest from "@/components/RealtimeTest";
import { ArrowLeft } from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;
  const router = useRouter();

  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Ref para rolar até o final
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getCurrentUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    }
    getCurrentUser();
  }, []);

  async function fetchMessages() {
    if (!conversationId) return;
    const { data, error } = await supabase
      .from("messages")
      .select(`
         *,
         sender:profiles!sender_id(username, avatar_url)
      `)
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      setMessages(data);
    } else if (error) {
      console.error("Erro ao buscar mensagens:", error.message);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!conversationId) return;
    console.log("Iniciando assinatura realtime para conversationId:", conversationId);
    fetchMessages();

    const channel = supabase
      .channel("chat")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log("Nova mensagem recebida (chat):", payload.new);
          setMessages((prev) => {
            if (prev.find((msg) => msg.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    const testChannel = supabase
      .channel("test-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          console.log("Evento de teste - nova mensagem inserida:", payload.new);
        }
      )
      .subscribe((status) => {
        console.log("Test subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(testChannel);
    };
  }, [conversationId]);

  // Rolar automaticamente até o final sempre que as mensagens mudarem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const tempMessage = {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage,
      created_at: new Date().toISOString(),
      sender: { username: "Você" },
      pending: true,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: tempMessage.content,
      });
    if (error) {
      console.error("Erro ao enviar mensagem:", error.message);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  }

  if (loading) return <LoadingState message="Carregando chat..." />;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <RealtimeTest conversationId={conversationId} />

      {/* Cabeçalho personalizado da conversa */}
      <header className="flex items-center p-4 bg-white shadow">
        <button
          onClick={() => router.push("/chat")}
          className="mr-4"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Chat</h1>
      </header>

      {/* Área de mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCurrentUser = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-4 rounded-lg shadow ${
                  isCurrentUser
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                {!isCurrentUser && msg.sender && (
                  <p className="text-xs font-semibold mb-1">
                    {msg.sender.username}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-right mt-1 text-gray-500">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </main>

      {/* Campo de envio fixo */}
      <form onSubmit={sendMessage} className="p-4 bg-white shadow-inner flex">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="ml-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
