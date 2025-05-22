// app/lojas/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useProvider } from "@/hooks/useProvider";
import LoadingState from "@/components/LoadingState";
import ServiceCard from "@/components/ServiceCard";
import Carousel from "@/components/Carousel";
import { Phone, MapPin, Globe, Instagram, Facebook } from "lucide-react";

export default function LojaDetailPage() {
  const params = useParams();
  let id = params.id;
  if (Array.isArray(id)) id = id[0];

  const { provider, loading, error } = useProvider(id!);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider)
    return <p className="text-red-500 text-center mt-8">Erro ao carregar loja</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">{provider.name}</h1>
        {provider.address && (
          <p className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-blue-500" />
            {provider.address}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 text-gray-600">
          {provider.phone && (
            <span className="flex items-center">
              <Phone className="w-5 h-5 mr-1 text-green-500" />
              {provider.phone}
            </span>
          )}
          {provider.social_media?.instagram && (
            <a
              href={provider.social_media.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-pink-600"
            >
              <Instagram className="w-5 h-5 mr-1" />
              Instagram
            </a>
          )}
          {provider.social_media?.facebook && (
            <a
              href={provider.social_media.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-blue-700"
            >
              <Facebook className="w-5 h-5 mr-1" />
              Facebook
            </a>
          )}
          {provider.social_media?.website && (
            <a
              href={provider.social_media.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center hover:text-purple-600"
            >
              <Globe className="w-5 h-5 mr-1" />
              Site
            </a>
          )}
        </div>
      </header>

      {/* Galeria de Imagens */}
      {provider.provider_images?.length ? (
        <div className="rounded-lg overflow-hidden">
          <Carousel images={provider.provider_images} />
        </div>
      ) : null}

      {/* Descrição */}
      {provider.description && (
        <section className="bg-gray-50 p-4 rounded">
          <h2 className="text-2xl font-semibold mb-2">Sobre a Loja</h2>
          <p className="text-gray-700">{provider.description}</p>
        </section>
      )}

      {/* Categorias */}
      {provider.provider_categories?.length ? (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            {provider.provider_categories.map((pc) => (
              <span
                key={pc.category_id}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {pc.category.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Serviços */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Serviços</h2>
        {provider.services?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {provider.services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhum serviço cadastrado.</p>
        )}
      </section>
    </div>
  );
}
