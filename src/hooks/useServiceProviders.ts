"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ServiceProvider } from "@/types";

export function useServiceProviders() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string|null>(null);

  async function fetchProviders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("service_providers")
      .select(`
        *,
        service_provider_images ( * ),
        services ( * )
      `);
    if (error) {
      setError(error.message);
      setProviders([]);
    } else {
      setProviders(data as ServiceProvider[]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchProviders() }, []);

  return { providers, loading, error, refetch: fetchProviders };
}
