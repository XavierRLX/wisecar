// hooks/useProvider.ts
"use client";
import { useState, useEffect } from "react";
import { fetchProviderById } from "@/lib/providerService";
import type { Provider } from "@/types";

export function useProvider(id: string) {
  const [provider, set] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  async function load() {
    setLoading(true);
    try {
      const data = await fetchProviderById(id);
      set(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [id]);
  return { provider, loading, error, refetch: load };
}