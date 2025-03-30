import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function FeedPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center bkgColorPrimary items-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-lg">
        <AlertTriangle className="mx-auto mb-4 w-16 h-16 text-yellow-500" />
        <h1 className="text-3xl font-bold mb-2 text-gray-800">
          Página em desenvolvimento
        </h1>
        <p className="text-gray-600 mb-4">
          Estamos preparando um espaço incrível onde você poderá postar e compartilhar os seus carros.
          Volte em breve para conferir todas as novidades!
        </p>
        <Link href="/veiculos">
          <span className="text-blue-600 font-semibold underline cursor-pointer">
            Voltar para Veículos
          </span>
        </Link>
      </div>
    </div>
  );
}
