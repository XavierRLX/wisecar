"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  // Mapeamento de rotas para título exibido
  const routeTitles: { [key: string]: string } = {
    "/veiculos": "Veículos",
    "/favoritos": "Favoritos",
    "/adicionar": "Adicionar",
    // Adicione outras rotas conforme necessário
  };

  // Título padrão (pode ser vazio se não houver correspondência)
  const title = routeTitles[pathname] || "";

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm flex items-center h-12 z-50">
      <div className="flex-1">
      <Link href="/">
            <Image
            unoptimized
                src="https://tffzmmrlohxzvjpsxkym.supabase.co/storage/v1/object/public/logowisecar//text+logo_next_to.png"
                alt="WiseCar Logo"
                width={110}
                height={60}
                className="mx-auto"
            />
            </Link>
      </div>
      <div className="flex-1 text-center">
        <h2 className="text-md font-medium TextColorPrimary">{title}</h2>
      </div>
      <div className="flex-1">
        {/* Pode colocar algum ícone ou deixar vazio */}
      </div>
    </header>
  );
}
