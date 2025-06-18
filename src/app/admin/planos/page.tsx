'use client';

import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import BackButton from '@/components/BackButton';
import { Plus, Edit2 } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export default function AdminPlanosPage() {
  const { plans, loading } = useSubscriptionPlans();

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Carregando planos…</p>;
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex sm:flex-row items-center justify-between gap-4">
          <div className='flex'>
          <BackButton />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Gerenciar Planos</h2>
          </div>
               <Link
            href="/admin/planos/novo"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition"
          >
            <Plus className="mr-2 h-5 w-5" />
            Novo Plano
          </Link>
        </div>

        {/* Mobile: All Cards Open */}
        <div className="sm:hidden space-y-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{plan.key}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Preço:</span>
                  <span className="font-medium text-gray-900">
                    R$ {plan.price.toFixed(2)} {plan.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Intervalo:</span>
                  <span className="font-medium text-gray-900">
                    Cada {plan.interval_count}× {plan.interval}
                  </span>
                </div>
                {plan.description && (
                  <p className="text-sm text-gray-600">{plan.description}</p>
                )}
              </div>
              <Link
                href={`/admin/planos/${plan.id}`}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm mt-4"
              >
                <Edit2 className="mr-1 h-4 w-4" />
                Editar Plano
              </Link>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden sm:block bg-white border border-gray-200 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Chave</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Preço</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Intervalo</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">{plan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 uppercase">{plan.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    R$ {plan.price.toFixed(2)} {plan.currency.toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">Cada {plan.interval_count}× {plan.interval}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/admin/planos/${plan.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
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
