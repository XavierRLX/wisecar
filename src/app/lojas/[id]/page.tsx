// app/lojas/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useProvider } from "@/hooks/useProvider";
import LoadingState from "@/components/LoadingState";
import ServiceCard from "@/components/ServiceCard";

export default function LojaDetailPage() {
  const params = useParams();
  let id = params.id;
  if (Array.isArray(id)) {
    id = id[0];
  }

  const { provider, loading, error } = useProvider(id!);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider)
    return <p className="text-red-500">Erro ao carregar loja</p>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">{provider.name}</h1>
      <p className="text-gray-700">{provider.address}</p>

      {/* Imagens da Loja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {provider.provider_images?.map((img) => (
          <img
            key={img.id}
            src={img.image_url}
            alt={`Imagem da loja ${provider.name}`}
            className="rounded-lg object-cover w-full h-48"
          />
        ))}
      </div>

      {/* Lista de Serviços */}
      <h2 className="text-xl font-semibold">Serviços</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {provider.services?.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </div>
  );
}
