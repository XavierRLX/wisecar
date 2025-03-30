"use client";

import { useEffect, useState } from "react";
import { X, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    firstName: string;
    lastName: string;
    avatarUrl: string;
  } | null>(null);

  useEffect(() => {
    async function getUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      if (user) {
        // Consulta a tabela "profiles" pelo id do usuário
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("id", user.id)
          .single();
  
        if (!error && data) {
          setUserProfile({
            firstName: data.first_name,
            lastName: data.last_name,
            avatarUrl: data.avatar_url,
          });
        }
      }
    }
  
    getUserProfile();
  }, []);
  

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div
        className="absolute inset-0 bg-black opacity-40"
        onClick={onClose}
      ></div>

      <div className="relative bg-white w-full sm:w-64 h-full shadow-xl flex flex-col p-4">
        <button
          aria-label="Fechar menu"
          className="absolute top-3 right-3 hover:bg-gray-100 rounded-full p-1 transition"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>

        {userProfile ? (
          <div className="flex items-center justify-between mt-8">
            <div className="flex items-center gap-3">
              {userProfile.avatarUrl && (
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-base font-semibold">
                  {userProfile.firstName} {userProfile.lastName}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/perfil"
                onClick={onClose}
                className="text-sm text-blue-600 hover:underline"
              >
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm mt-8 text-gray-400">
            Carregando...
          </p>
        )}

        {/* Linha divisória */}
        <hr className="my-4 border-gray-200" />

        {/* Menu de opções */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <Link
                href="/vendedor"
                onClick={onClose}
                className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5 text-gray-600" />
                <span className="text-gray-800">Vendedor</span>
              </Link>
            </li>
            {/* Outras opções podem ser adicionadas aqui */}
          </ul>
        </nav>
      </div>
    </div>
  );
}
