"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import { supabase } from "@/lib/supabase";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { MessageWithSender } from "@/types";

export default function ChatPage() {
  const { conversationId } = useParams() as { conversationId: string };
  const router = useRouter();
  const { userId, loading: userLoading } = useCurrentUser();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  // Fetch inicial
  useEffect(() => {
    if (!conversationId) return;
    (async () => {
      const res = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles!sender_id(username)
        `)
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      const data = res.data as MessageWithSender[] | null;
      setMessages(data ?? []);
      setLoading(false);
    })();
  }, [conversationId]);

  // Realtime
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = payload.new as MessageWithSender;
          setMessages((prev) =>
            prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Scroll automático
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Envio otimista sem duplicação
  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || !userId) return;

    const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`;
    const placeholder: MessageWithSender = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: userId,
      content: newMessage,
      created_at: new Date().toISOString(),
      sender: { username: "Você" },
    };
    setMessages((prev) => [...prev, placeholder]);
    setNewMessage("");

    const res = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: placeholder.content,
      })
      .select(`*, sender:profiles!sender_id(username)`)
      .single();

    if (res.error) {
      console.error("Erro ao enviar mensagem:", res.error.message);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      return;
    }

    const inserted = res.data as MessageWithSender;
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? inserted : m))
    );
  }

  if (userLoading || loading) {
    return <LoadingState message="Carregando chat..." />;
  }
  if (!userId) {
    router.push("/login");
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="flex items-center p-4 bg-white shadow">
        <button onClick={() => router.push("/chat")} aria-label="Voltar">
          <ArrowLeft className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="ml-4 text-xl font-bold">Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-4 rounded-lg shadow ${
                  isMe
                    ? "bkgColorPrimary text-white"
                    : "bg-white text-gray-800 border"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold mb-1">
                    {msg.sender?.username}
                  </p>
                )}
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs text-right mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </main>

      <form onSubmit={sendMessage} className="p-4 bg-white shadow-inner flex">
        <input
          type="text"
          placeholder="Digite sua mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-3 rounded-lg border focus:outline-none"
        />
        <button
          type="submit"
          className="ml-3 p-3 bkgColorPrimary text-white rounded-lg"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
