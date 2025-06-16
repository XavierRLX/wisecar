// components/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import {
  X,
  LogOut,
  User,
  Heart,
  CircleParking,
  Car,
  Rss,
  Ligature,
  Wrench,
  Cog,
  Tag,
  Store
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClose: () => void;
}

function NavItem({ href, icon, label, onClose }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg transition
        ${isActive
          ? "bg-blue-100 text-blue-600"
          : "text-gray-700 hover:bg-gray-100"}
      `}
    >
      {icon}
      <span className="flex-1 whitespace-nowrap">{label}</span>
    </Link>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null>(null);

  // Busca dados do perfil
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("profiles")
        .select("first_name,last_name,avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data, error }) => {
          if (!error && data) {
            setProfile({
              firstName: data.first_name,
              lastName: data.last_name,
              avatarUrl: data.avatar_url,
            });
          }
        });
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="relative bg-white w-full h-full shadow-xl flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded hover:bg-gray-100 transition"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Perfil */}
        <div className="mt-16 px-4 pb-6 border-b border-gray-200 flex items-center justify-between">
          {profile ? (
            <>
              <div className="flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.firstName} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {profile.firstName} {profile.lastName}
                  </p>
                  <Link
                    href="/perfil"
                    onClick={onClose}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver perfil
                  </Link>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-gray-100 transition"
                aria-label="Sair"
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">Carregando perfil…</p>
          )}
        </div>

        {/* Menu principal */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          <div className="space-y-1">
            <NavItem
              href="/vendedor"
              icon={<User className="w-5 h-5" />}
              label="Área do vendedor"
              onClose={onClose}
            />
            <NavItem
              href="/lojas"
              icon={<Cog className="w-5 h-5" />}
              label="Serviços"
              onClose={onClose}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-1">
            <NavItem
              href="/veiculos"
              icon={<Car className="w-5 h-5" />}
              label="Lista de Desejo"
              onClose={onClose}
            />
            <NavItem
              href="/minhaGaragem"
              icon={<CircleParking className="w-5 h-5" />}
              label="Minha Garagem"
              onClose={onClose}
            />
            <NavItem
              href="/manutencoes"
              icon={<Wrench className="w-5 h-5" />}
              label="Manutenções"
              onClose={onClose}
            />
            <NavItem
              href="/favoritos"
              icon={<Heart className="w-5 h-5" />}
              label="Favoritos"
              onClose={onClose}
            />
          </div>

          <div className="pt-4 border-t border-gray-200 space-y-1">
          <NavItem
              href="/planos"
              icon={<Tag className="w-5 h-5" />}
              label="Planos"
              onClose={onClose}
            />
            <NavItem
              href="/consultaFipe"
              icon={<Ligature className="w-5 h-5" />}
              label="Consulta FIPE"
              onClose={onClose}
            />
            <NavItem
              href="/lojas/novo"
              icon={<Store className="w-5 h-5" />}
              label="Adicionar Loja"
              onClose={onClose}
            />
             <NavItem
              href="/feed"
              icon={<Rss className="w-5 h-5" />}
              label="Feed"
              onClose={onClose}
            />
          </div>
        </nav>

        {/* Footer profissional */}
        <footer className="px-4 py-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>All Wheels Experience © 2025</p>
          <div className="mt-2 space-x-2">
            <Link
              href="/termos"
              onClick={onClose}
              className="hover:underline"
            >
              Termos
            </Link>
            <span>·</span>
            <Link
              href="/privacidade"
              onClick={onClose}
              className="hover:underline"
            >
              Privacidade
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
