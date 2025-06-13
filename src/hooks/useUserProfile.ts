// hooks/useUserProfile.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, subscription_plans (key, name)')
        .single();

      if (error) {
        console.error('Erro ao buscar profile:', error);
        setError(error.message);
      } else {
        setProfile(data as Profile);
      }
      setLoading(false);
    })();
  }, []);

  return { profile, loading, error };
}
