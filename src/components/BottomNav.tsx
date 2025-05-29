// components/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu as MenuIcon,
  Car as CarIcon,
  PlusCircle as AddIcon,
  MessageSquare as ChatIcon,
  Cog as ServicesIcon,
} from "lucide-react";

interface BottomNavProps {
  onMenuClick: () => void;
}

export default function BottomNav({ onMenuClick }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  const navItems: {
    href?: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    onClick?: () => void;
  }[] = [
    {
      label: "Menu",
      Icon: MenuIcon,
      onClick: () => {
        window.scrollTo(0, 0);
        onMenuClick();
      },
    },
    { href: "/veiculos/todosVeiculos", label: "Veículos", Icon: CarIcon },
    { href: "/veiculos/novo", label: "Adicionar", Icon: AddIcon },
    { href: "/lojas", label: "Serviços", Icon: ServicesIcon },
    { href: "/chat", label: "Chat", Icon: ChatIcon },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-md z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ href, label, Icon, onClick }) => {
          const active = href ? isActive(href) : false;
          const colorClass = active ? "text-blue-500" : "TextColorPrimary";

          const commonProps = {
            className: `flex flex-col items-center justify-center ${colorClass} hover:text-secondary transition`,
            "aria-label": label,
          };

          return href ? (
            <Link key={label} href={href} {...commonProps}>
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          ) : (
            <button
              key={label}
              onClick={onClick}
              {...commonProps}
              type="button"
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
