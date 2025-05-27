// app/lojas/[id]/page.tsx
'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProvider } from '@/hooks/useProvider';
import LoadingState from '@/components/LoadingState';
import Carousel from '@/components/Carousel';
import BackButton from '@/components/BackButton';
import ServiceCard from '@/components/ServiceCard';
import {
  Phone,
  MapPin,
  Globe,
  Instagram,
  Facebook,
  ListChecks
} from 'lucide-react';
import type { ServiceCategory, ServiceItemImage } from '@/types';

export default function LojaDetailPage() {
  const router = useRouter();
  const { id: rawId } = useParams();
  const id = Array.isArray(rawId) ? rawId[0]! : rawId!;
  const { provider, loading, error } = useProvider(id);

  if (loading) return <LoadingState message="Carregando loja..." />;
  if (error || !provider) {
    return (
      <div className="py-16 text-center text-red-600">
        Erro ao carregar loja.
      </div>
    );
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
    provider_images = [],
    services = [],
  } = provider;

  const fullAddress = `${address}${address ? ', ' : ''}${neighborhood}, ${city} - ${state}`;
  const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`;

  // extrai categorias únicas a partir dos serviços
  const categories: ServiceCategory[] = services
    .map(s => s.category)
    .filter((c): c is ServiceCategory => Boolean(c))
    .reduce<ServiceCategory[]>((acc, cat) => {
      if (!acc.find(x => x.id === cat.id)) acc.push(cat);
      return acc;
    }, []);

  // separa serviços com e sem itens
  const withItems = services.filter(
    s => s.service_items && s.service_items.length > 0
  );
  const withoutItems = services.filter(
    s => !s.service_items || s.service_items.length === 0
  );

  // monta todas as imagens para o carousel do header:
  const carouselImages: ServiceItemImage[] = [
    // logo primeiro, se houver
    ...(logo_url
      ? [{ id: 'logo', service_item_id: id, image_url: logo_url }]
      : []),
    // galeria da loja
    ...provider_images.map(img => ({
      id: `prov-${img.id}`,
      service_item_id: id,
      image_url: img.image_url
    })),
    // todas as imagens dos itens de serviço
    ...services.flatMap(svc =>
      svc.service_items?.flatMap(item =>
        (item.item_images ?? []).map(img => ({
          id: `item-${img.id}`,
          service_item_id: item.id,
          image_url: img.image_url
        }))
      ) ?? []
    ),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      {/* Voltar */}
      <BackButton fallbackHref="/lojas" className="mb-4" />

      {/* HEADER com Carousel */}
      <section className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-1/3 space-y-4">
          {carouselImages.length > 1 ? (
            <div className="h-56 rounded-lg shadow overflow-hidden">
              <Carousel images={carouselImages} />
            </div>
          ) : carouselImages.length === 1 ? (
            <img
              src={carouselImages[0].image_url}
              alt={name}
              className="w-full h-56 object-cover rounded-lg shadow"
            />
          ) : (
            <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-lg shadow text-gray-400">
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
              className="flex items-center gap-1 hover:underline"
            >
              <MapPin className="w-5 h-5 text-blue-600" /> {fullAddress}
            </a>
            {phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-5 h-5 text-blue-600" /> {phone}
              </span>
            )}
            {social_media?.instagram && (
              <a
                href={social_media.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Instagram className="w-5 h-5 text-blue-600" /> Instagram
              </a>
            )}
            {social_media?.facebook && (
              <a
                href={social_media.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Facebook className="w-5 h-5 text-blue-600" /> Facebook
              </a>
            )}
            {social_media?.website && (
              <a
                href={social_media.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:underline"
              >
                <Globe className="w-5 h-5 text-blue-600" /> Site
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
            {categories.map(cat => (
              <span
                key={cat.id}
                className="bg-indigo-100 text-indigo-700 text-sm font-medium px-3 py-1 rounded-full"
              >
                {cat.name}
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
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {svc.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {svc.service_items!.map(item => {
                    // se não houver imagens no item, usa logo como fallback
                    const itemImages: ServiceItemImage[] =
                      item.item_images && item.item_images.length > 0
                        ? item.item_images
                        : logo_url
                        ? [{ id: `fallback-${item.id}`, service_item_id: item.id, image_url: logo_url }]
                        : [];

                    return (
                      <ServiceCard
                        key={item.id}
                        item={{ ...item, item_images: itemImages }}
                      />
                    );
                  })}
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
                <span className="font-medium text-gray-800 truncate">
                  {svc.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
