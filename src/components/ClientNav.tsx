"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function ClientNav() {
  const pathname = usePathname();
  
  // Exibe o BottomNav apenas se o pathname for exatamente "/chat"
  const showBottomNav = pathname === "/chat";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  function handleOpenSidebar() {
    setIsSidebarOpen(true);
  }
  function handleCloseSidebar() {
    setIsSidebarOpen(false);
  }
  return (
    <>
      {showBottomNav && <BottomNav onMenuClick={handleOpenSidebar} />}
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
    </>
  );
}
