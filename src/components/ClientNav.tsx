// components/ClientNav.tsx
"use client";

import { useState } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

export default function ClientNav() {
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
