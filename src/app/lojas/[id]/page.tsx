// app/lojas/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProvider } from '@/hooks/useProvider';
import LoadingState from '@/components/LoadingState';
import Carousel from '@/components/Carousel';
import ServiceCard from '@/components/ServiceCard';
import { Phone, MapPin, Globe, Instagram, Facebook, ListChecks } from 'lucide-react';

export default function LojaDetailPage() {
  const router = useRouter();
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0]! : rawId!;
  const { provider, loading, error } = useProvider(id);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider) {
    return <div className="py-16 text-center text-red-600">Erro ao carregar loja.</div>;
  }

  const {
    name,
    address,
    state,
    city,
    neighborhood,
    phone,
    description,
    social_media,
    logo_url,
    provider_images,
    provider_categories,
    services = [],
  } = provider;

  const fullAddress = `${address}${address ? ', ' : ''}${neighborhood}, ${city} - ${state}`;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

  // garantir arrays
  const categories = provider_categories ?? [];
  const withItems = services.filter(s => s.service_items?.length);
  const withoutItems = services.filter(s => !s.service_items?.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* HEADER */}
      <section className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-1/3 space-y-4">
          {logo_url ? (
            <img
              src={logo_url}
              alt={`Logo de ${name}`}
              className="w-full h-48 object-contain bg-white rounded-lg shadow"
            />
          ) : provider_images?.length ? (
            <div className="h-48 rounded-lg shadow overflow-hidden">
              <Carousel images={provider_images} />
            </div>
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-lg shadow text-gray-400">
              Sem imagens
            </div>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold text-gray-900">{name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-700">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:underline"
            >
              <MapPin className="w-5 h-5" /> {fullAddress}
            </a>
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-5 h-5 text-indigo-500" /> {phone}
              </span>
            )}
            {social_media?.instagram && (
              <a
                href={social_media.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <Instagram className="w-5 h-5" /> Instagram
              </a>
            )}
            {social_media?.facebook && (
              <a
                href={social_media.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <Facebook className="w-5 h-5" /> Facebook
              </a>
            )}
            {social_media?.website && (
              <a
                href={social_media.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline"
              >
                <Globe className="w-5 h-5" /> Site
              </a>
            )}
          </div>
        </div>
      </section>

      {/* SOBRE */}
      {description && (
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Sobre</h2>
          <p className="text-gray-700 leading-relaxed">{description}</p>
        </section>
      )}

      {/* CATEGORIAS */}
      {categories.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">Categorias</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(pc => (
              <span
                key={pc.category_id}
                className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full"
              >
                {pc.category.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SERVIÇOS COM ITENS */}
      {withItems.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Serviços</h2>
          <div className="space-y-8">
            {withItems.map(svc => (
              <div key={svc.id}>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{svc.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {svc.service_items!.map(item => (
                    <ServiceCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MAIS SERVIÇOS SEM ITENS */}
      {withoutItems.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Mais Serviços</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {withoutItems.map(svc => (
              <div
                key={svc.id}
                onClick={() => router.push(`/lojas/${id}#`)}
                className="flex items-center gap-2 p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg cursor-pointer transition"
              >
                <ListChecks className="w-5 h-5 text-indigo-500" />
                <span className="font-medium text-gray-800 truncate">{svc.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
