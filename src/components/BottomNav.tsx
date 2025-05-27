// app/components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu as MenuIcon,
  Car,
  PlusCircle,
  MessageSquare,
  Cog,
} from "lucide-react";

interface BottomNavProps {
  onMenuClick: () => void;
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const activeClass = (route: string) =>
    pathname === route ? "text-blue-600" : "TextColorPrimary";

  // helper para link + scroll
  function NavLink({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <Link
        href={href}
        scroll={true}                   
        onClick={() => window.scrollTo(0, 0)}
        className={`flex flex-col items-center ${activeClass(
          href
        )} hover:text-blue-600`}
      >
        {children}
      </Link>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="grid grid-cols-5 items-center py-1 px-1">
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            onMenuClick();
          }}
          className={`flex flex-col items-center ${activeClass(
            "/menu"
          )} hover:text-blue-600`}
        >
          <MenuIcon className="h-6 w-6" />
          <span className="text-xs">Menu</span>
        </button>

        <NavLink href="/todosVeiculos">
          <Car className="h-6 w-6" />
          <span className="text-xs">Veículos</span>
        </NavLink>

        <NavLink href="/adicionar">
          <PlusCircle className="h-6 w-6" />
          <span className="text-xs">Adicionar</span>
        </NavLink>

        <NavLink href="/lojas">
          <Cog className="h-6 w-6" />
          <span className="text-xs">Serviços</span>
        </NavLink>

        <NavLink href="/chat">
          <MessageSquare className="h-6 w-6" />
          <span className="text-xs">Chat</span>
        </NavLink>
      </div>
    </nav>
  );
}
