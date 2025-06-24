// hooks/useUserSubscription.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Subscription {
  id: string;
  profile_id: string;
  plan_id: string;
  started_at: string;
  expires_at: string;
  canceled_at: string | null;
  subscription_plan: {
    key: string;
    name: string;
    price: number;
    interval: string;
    interval_count: number;
  };
}

export function useUserSubscription(userId: string) {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          id, profile_id, plan_id, started_at, expires_at, canceled_at,
          subscription_plans(key, name, price, interval, interval_count)
        `)
        .eq('profile_id', userId)
        .is('canceled_at', null)
        .gt('expires_at', 'now()')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        const arr = (data as any).subscription_plans as any[];
        const plan = arr[0] ?? { key: '', name: '', price: 0, interval: '', interval_count: 0 };
        setSub({
          id: data.id,
          profile_id: data.profile_id,
          plan_id: data.plan_id,
          started_at: data.started_at,
          expires_at: data.expires_at,
          canceled_at: data.canceled_at,
          subscription_plan: plan
        });
      }
      setLoading(false);
    })();
  }, [userId]);

  return { sub, setSub, loading };
}
