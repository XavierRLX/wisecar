import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface UnderDevelopmentProps {
  title?: string;
  description?: string;
  redirectLink?: string;
  redirectText?: string;
}

export default function UnderDevelopment({
  title = "Página em desenvolvimento",
  description = "Estamos preparando um espaço incrível onde você poderá postar e compartilhar os seus carros. Volte em breve para conferir todas as novidades!",
  redirectLink = "/",
  redirectText = "Voltar",
}: UnderDevelopmentProps) {
  return (
    <div className="p-2 mt-60 flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-4 rounded-lg shadow-lg text-center max-w-lg">
        <AlertTriangle className="mx-auto mb-4 w-16 h-16 text-yellow-500" />
        <h1 className="text-3xl font-bold mb-2 text-gray-800">{title}</h1>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link href={redirectLink}>
          <span className="text-blue-600 font-semibold underline cursor-pointer">
            {redirectText}
          </span>
        </Link>
      </div>
    </div>
  );
}
