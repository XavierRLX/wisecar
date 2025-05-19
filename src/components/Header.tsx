// components/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Não mostra o header em /login ou nas rotas /chat/...
  if (pathname === "/login" || pathname?.startsWith("/chat/")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center bg-white border-b border-gray-200 pl-2 shadow-sm">
      <Link href="/" className="flex items-center">
        <Image
          unoptimized
          src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar//wisecarlogopng.png"
          alt="All Wheels Logo"
          width={60}
          height={40}
        />
        {/* <span className="text-lg font-bold TextColorPrimary">AW</span> */}
      </Link>
      <div className="flex-1" />
    </header>
  );
}
