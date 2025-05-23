'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useProvider } from '@/hooks/useProvider';
import LoadingState from '@/components/LoadingState';
import Carousel from '@/components/Carousel';
import ServiceCard from '@/components/ServiceCard';
import { Phone, MapPin, Globe, Instagram, Facebook } from 'lucide-react';

export default function LojaDetailPage() {
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0]! : rawId!;
  const { provider, loading, error } = useProvider(id);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider)
    return <p className="text-red-500 text-center mt-8">Erro ao carregar loja</p>;

  const gallery = provider.provider_images ?? [];
  const categories = provider.provider_categories ?? [];
  const services = provider.services ?? [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* HEADER */}
      <header className="space-y-3">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {provider.name}
        </h1>
        <div className="flex flex-wrap gap-4 text-gray-600">
          {provider.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-5 h-5 text-blue-500" /> {provider.address}
            </span>
          )}
          {provider.phone && (
            <span className="flex items-center gap-1">
              <Phone className="w-5 h-5 text-green-500" /> {provider.phone}
            </span>
          )}
          {provider.social_media?.instagram && (
            <a
              href={provider.social_media.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-pink-600"
            >
              <Instagram className="w-5 h-5" /> Instagram
            </a>
          )}
          {provider.social_media?.facebook && (
            <a
              href={provider.social_media.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-700"
            >
              <Facebook className="w-5 h-5" /> Facebook
            </a>
          )}
          {provider.social_media?.website && (
            <a
              href={provider.social_media.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-purple-600"
            >
              <Globe className="w-5 h-5" /> Site
            </a>
          )}
        </div>
      </header>

      {/* CAROUSEL DE IMAGENS */}
      {gallery.length > 0 && (
        <div className="rounded-lg overflow-hidden shadow">
          <Carousel images={gallery} />
        </div>
      )}

      {/* SOBRE */}
      {provider.description && (
        <section className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Sobre</h2>
          <p className="text-gray-700">{provider.description}</p>
        </section>
      )}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-2">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((pc) => (
              <span
                key={pc.category_id}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {pc.category.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SERVIÇOS E ITENS */}
      <section className="space-y-8">
        <h2 className="text-2xl font-semibold">Serviços</h2>
        {services.length === 0 && (
          <p className="text-gray-500">Nenhum serviço cadastrado.</p>
        )}
        {services.map((s) => (
          <div key={s.id} className="space-y-4">
            <h3 className="text-xl font-semibold">{s.name}</h3>
            {s.service_items && s.service_items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {s.service_items.map((item) => (
                  <ServiceCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Nenhum item para este serviço.</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
