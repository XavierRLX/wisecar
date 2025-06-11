// hooks/useUserProviders.ts
"use client";
import { useState, useEffect } from "react";
import { fetchProvidersByUserId } from "@/lib/providerService";
import type { Provider } from "@/types";

export function useUserProviders(userId: string) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetchProvidersByUserId(userId)
      .then(setProviders)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [userId]);
  return { providers, loading, error };
}
