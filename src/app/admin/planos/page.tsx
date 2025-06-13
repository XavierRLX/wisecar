// app/admin/planos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubscriptionPlan } from '@/types';
import BackButton from '@/components/BackButton';

export default function AdminPlanosPage() {
  const supabase = createClientComponentClient();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setPlans(data as SubscriptionPlan[]);  // cast seguro
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-8">Carregando planos…</p>;

  return (
    <AdminGuard>
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
      <BackButton className="mb-2" />
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <Link
            href="/admin/planos/new"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Novo Plano
          </Link>
        </div>
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Chave</th>
              <th className="px-4 py-2 text-left">Preço</th>
              <th className="px-4 py-2 text-left">Intervalo</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-t">
                <td className="px-4 py-2">{plan.name}</td>
                <td className="px-4 py-2">{plan.key}</td>
                <td className="px-4 py-2">
                  {plan.price.toFixed(2)} {plan.currency}
                </td>
                <td className="px-4 py-2">
                  Cada {plan.interval_count}× {plan.interval}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/planos/${plan.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminGuard>
  );
}
