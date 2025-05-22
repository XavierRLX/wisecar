"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useProvider } from "@/hooks/useProvider";
import LoadingState from "@/components/LoadingState";
import ServiceCard from "@/components/ServiceCard";

export default function LojaDetailPage() {
  const params = useSearchParams();
  const id = params.get("id")!;
  const { provider, loading, error } = useProvider(id);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider) return <p className="text-red-500">Erro ao carregar loja</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{provider.name}</h1>
      <p>{provider.address}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {provider.provider_images?.map((img) => (
          <img key={img.id} src={img.image_url} className="rounded-lg" />
        ))}
      </div>
      <h2 className="text-xl font-semibold">Serviços</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {provider.services?.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </div>
  );
}
