// hooks/useProviders.ts
"use client";
import { useState, useEffect } from "react";
import { fetchProviders } from "@/lib/providerService";
import type { Provider } from "@/types";

export function useProviders() {
  const [providers, set] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  async function load() {
    setLoading(true);
    try {
      const data = await fetchProviders();
      set(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return { providers, loading, error, refetch: load };
}
