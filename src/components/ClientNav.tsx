"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function ClientNav() {
  const pathname = usePathname();

  // Se estiver na rota de login, não renderiza o ClientNav
  if (pathname === "/login") return null;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function handleOpenSidebar() {
    setIsSidebarOpen(true);
  }

  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }

  return (
    <>
      <BottomNav onMenuClick={handleOpenSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </>
  );
}
