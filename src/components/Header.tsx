// components/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/login" || pathname?.startsWith("/chat/")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center bg-white border-b border-gray-200 px-2 shadow-sm">
      <Link href="/" className="flex items-center">
        <Image
          unoptimized
          src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar/wisecarlogopng.png"
          alt="All Wheels Logo"
          width={60}
          height={40}
        />
        <span className="text-xl font-logo font-bold TextColorPrimary">
          AWX
        </span>
      </Link>

      <div className="flex-1" />

      <button
        aria-label="Notificações"
        className="p-2 rounded-full transition TextColorPrimary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-secondary"
      >
        <Bell className="h-6 w-6 text-secondary" />
      </button>
    </header>
  );
}
