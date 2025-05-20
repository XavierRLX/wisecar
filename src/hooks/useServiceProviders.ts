// hooks/useServiceProviders.ts
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ServiceProvider } from "@/types";

export function useServiceProviders() {
  const [providers, set] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    const { data, error: e } = await supabase
      .from("service_providers")
      .select(`
        *,
        service_provider_images (*),
        services (
          *,
          service_images (*)
        )
      `);
    if (e) {
      setError(e.message);
      set([]);
    } else {
      set(data as ServiceProvider[]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchAll() }, []);
  return { providers, loading, error, refetch: fetchAll };
}
