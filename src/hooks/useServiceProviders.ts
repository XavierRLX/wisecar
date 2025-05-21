"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ServiceProvider,
  ServiceProviderImage,
  Service,
  ServiceImage,
} from "@/types";

interface RawServiceProviderImageRow {
  id: string;
  service_provider_id: string;
  image_url: string;
  created_at: string;
}

interface RawServiceRow {
  id: string;
  service_provider_id: string;
  name: string;
  description?: string;
  price?: number;
  created_at?: string;
  service_images?: ServiceImage[];
}

interface RawServiceProviderRow {
  id: string;
  profile_id: string;
  name: string;
  address?: string;
  phone?: string;
  social_media?: string;
  description?: string;
  created_at?: string;
  service_provider_images?: RawServiceProviderImageRow[];
  services?: RawServiceRow[];
}

export function useServiceProviders() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("service_providers")
      .select(`
        id,
        profile_id,
        name,
        address,
        phone,
        social_media,
        description,
        created_at,
        service_provider_images (
          id,
          service_provider_id,
          image_url,
          created_at
        ),
        services (
          id,
          service_provider_id,
          name,
          description,
          price,
          created_at,
          service_images (
            id,
            service_id,
            image_url,
            created_at
          )
        )
      `);

    if (fetchError) {
      setError(fetchError.message);
      setProviders([]);
      setLoading(false);
      return;
    }

    const raw = data as RawServiceProviderRow[];
    const mapped: ServiceProvider[] = raw.map((prov) => ({
      id: prov.id,
      profile_id: prov.profile_id,
      name: prov.name,
      address: prov.address,
      phone: prov.phone,
      social_media: prov.social_media,
      description: prov.description,
      created_at: prov.created_at,
      images: prov.service_provider_images ?? [],
      services: prov.services?.map((svc) => ({
        id: svc.id,
        service_provider_id: svc.service_provider_id,
        name: svc.name,
        description: svc.description,
        price: svc.price,
        created_at: svc.created_at,
        images: svc.service_images ?? [],
      })) ?? [],
    }));

    setProviders(mapped);
    setLoading(false);
  }

  useEffect(() => {
    fetchAll();
  }, []);

  return { providers, loading, error, refetch: fetchAll };
}
