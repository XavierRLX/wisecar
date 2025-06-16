// app/planos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import LoadingState from '@/components/LoadingState';
import { ToggleFilter, Option } from '@/components/ToggleFilter';
import { SubscriptionPlan } from '@/types';

const CATEGORIES: { key: 'seller' | 'other' | 'provider'; label: string }[] = [
  { key: 'seller',   label: 'Vendedor' },
  { key: 'other',    label: 'Usuário'   },
  { key: 'provider', label: 'Lojista'   },
];

export default function PlansPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<'seller' | 'other' | 'provider'>('other'); // Usuário pré

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });
      if (!error && data) setPlans(data as SubscriptionPlan[]);
      setLoading(false);
    })();
  }, [supabase]);

  if (loading) {
    return <LoadingState message="Carregando planos..." />;
  }

  const filteredPlans = plans.filter(p => {
    // sempre incluir 'full'
    if (p.key === 'full') return true;

    switch (category) {
      case 'seller':
        return p.key === 'seller';
      case 'provider':
        return p.key === 'provider';
      case 'other':
        // usuário = todos que não são seller nem provider (full já retorna acima)
        return p.key !== 'seller' && p.key !== 'provider';
    }
  });

  const filterOptions: Option<string>[] = CATEGORIES.map(c => ({
    value: c.key,
    label: c.label,
  }));

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Nossos Planos
        </h1>
        <p className="mt-3 text-gray-600">
          Selecione a categoria para ver os planos disponíveis.
        </p>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <ToggleFilter
            options={filterOptions}
            value={category}
            onChange={cat => setCategory(cat as any)}
            className="w-full sm:w-72 mx-auto"
          />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  {plan.name}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {plan.description}
                </p>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  R$ {plan.price.toFixed(2)}
                </span>
                <span className="ml-1 text-base text-gray-600">
                  /{plan.interval_count} {plan.interval}
                </span>
              </div>
              <button
                onClick={() => router.push(`/planos/${plan.id}`)}
                className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Assinar Agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
