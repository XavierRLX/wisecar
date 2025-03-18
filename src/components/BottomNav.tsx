"use client";

import Link from "next/link";
import { Menu as MenuIcon, Car, PlusCircle, Heart } from "lucide-react";

interface BottomNavProps {
    onMenuClick: () => void;
  }

  export default function BottomNav({ onMenuClick }: BottomNavProps) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md">
        <div className="flex justify-around items-center py-2">
          {/* Botão Menu */}
          <button
            onClick={onMenuClick}
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <MenuIcon className="h-6 w-6" />
            <span className="text-xs">Menu</span>
          </button>
  
          {/* Item Veículos */}
          <Link
            href="/veiculos"
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <Car className="h-6 w-6" />
            <span className="text-xs">Veículos</span>
          </Link>
  
          {/* Ícone de Adicionar */}
          <Link
            href="/adicionar"
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-xs">Adicionar</span>
          </Link>
  
          {/* Item Favoritos */}
          <Link
            href="/favoritos"
            className="flex flex-col items-center text-gray-700 hover:text-blue-600"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs">Favoritos</span>
          </Link>
        </div>
      </nav>
    );
  }
