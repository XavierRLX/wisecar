// hooks/useUserProfile.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types';

export function useUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('profiles')
      .select(`
        *,
        subscription_plans ( key, name )
      `)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setProfile(data as Profile);
        }
        setLoading(false);
      });
  }, []);

  return { profile, loading };
}
