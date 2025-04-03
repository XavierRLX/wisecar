// components/GlobalNav.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import ClientNav from "./ClientNav";

export default function GlobalNav() {
  const pathname = usePathname();

  // Esconde nav se for /login ou se for uma conversa individual (ex: /chat/123)
  const hideNav = pathname === "/login" || pathname.startsWith("/chat/");
  if (hideNav) return null;

  return (
    <>
      <Header />
      <ClientNav />
    </>
  );
}
