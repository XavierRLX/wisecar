// app/admin/planos/page

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
        else setPlans(data as SubscriptionPlan[]);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-8 text-center">Carregando planos…</p>;

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-2 sm:space-y-0">
          <BackButton className="self-start sm:self-auto" />
          <h2 className="text-2xl font-bold">Gerenciar Planos</h2>
          <Link
            href="/admin/planos/novo"
            className="w-full sm:w-auto text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Novo Plano
          </Link>
        </div>

        {/* MOBILE: cards */}
        <div className="sm:hidden space-y-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-white p-4 rounded-lg shadow flex flex-col"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <span className="text-sm text-gray-500 uppercase">{plan.key}</span>
              </div>
              <p className="mt-2 text-gray-700">
                R$ {plan.price.toFixed(2)} • {plan.currency.toUpperCase()}
              </p>
              <p className="mt-1 text-gray-500 text-sm">
                Cada {plan.interval_count}× {plan.interval}
              </p>
              <Link
                href={`/admin/planos/${plan.id}`}
                className="mt-4 self-start text-blue-600 hover:underline"
              >
                Editar
              </Link>
            </div>
          ))}
        </div>

        {/* DESKTOP: tabela */}
        <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Nome</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Chave</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Preço</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Intervalo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-gray-800">{plan.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">{plan.key}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-800">
                    R$ {plan.price.toFixed(2)} {plan.currency.toUpperCase()}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    Cada {plan.interval_count}× {plan.interval}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
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
      </div>
    </AdminGuard>
  );
}
