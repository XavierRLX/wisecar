// hooks/useProviders.ts
"use client";

import { useState, useEffect } from "react";
import { fetchProviders } from "@/lib/providerService";
import type { Provider } from "@/types";

export function useProviders(filters?: {
  categoryId?: number;
  state?: string;
  city?: string;
  neighborhood?: string;
  search?: string;
}) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  async function load() {
    setLoading(true);
    try {
      const data = await fetchProviders(filters);
      setProviders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [JSON.stringify(filters)]);

  return { providers, loading, error, refetch: load };
}
