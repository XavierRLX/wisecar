"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
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

  return (
    <div
      className={`fixed inset-0 z-50 transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative bg-white w-64 h-full shadow-xl p-4">
        <button aria-label="Fechar menu" className="absolute top-2 right-2" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>

        {userProfile ? (
          <div className="flex flex-col items-center mt-8">
            {userProfile.avatarUrl && (
              <img
                src={userProfile.avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full mb-2"
              />
            )}
            <h2 className="text-lg font-semibold">
              {userProfile.firstName} {userProfile.lastName}
            </h2>
          </div>
        ) : (
          <p className="text-center mt-8">Carregando informações...</p>
        )}

      </div>
    </div>
  );
}
