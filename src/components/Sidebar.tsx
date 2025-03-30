"use client";

import { useEffect, useState } from "react";
import { X, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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
        const fullName = user.user_metadata?.full_name || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");
        const avatarUrl = user.user_metadata?.avatar_url || "";
        setUserProfile({ firstName, lastName, avatarUrl });
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
          <div className="flex items-center gap-3 mt-8">
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

        {/* Espaço para futuras opções abaixo */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          {/* opções do menu serão adicionadas aqui futuramente */}
        </nav>
      </div>
    </div>
  );
}
