"use client";
import { usePathname } from "next/navigation";

export default function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Se a rota for "/login" ou começar com "/chat/" (conversa individual), não aplica padding
  const isFullScreen = pathname === "/login" || pathname.startsWith("/chat/");
  return <div className={isFullScreen ? "" : "pt-12 pb-16"}>{children}</div>;
}
