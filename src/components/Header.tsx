// components/Header.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Não renderiza o header em /login ou em páginas de conversa individual (ex: /chat/123)
  if (pathname === "/login" || pathname.startsWith("/chat/")) return null;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm flex items-center h-12 z-50">
      <div>
        <Link href="/">
          <Image
            unoptimized
            src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar//allwheels_logo_2_png.png"
            alt="WiseCar Logo"
            width={100}
            height={50}
            className="mx-auto"
          />
        </Link>
      </div>
      <div className="flex-1">
        {/* Espaço para ícones ou outras ações */}
      </div>
    </header>
  );
}
