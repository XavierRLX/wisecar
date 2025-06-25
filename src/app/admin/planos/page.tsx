'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import BackButton from '@/components/BackButton';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { supabase } from '@/lib/supabase';
import type { SubscriptionPlan } from '@/types';

export default function AdminPlanosPage() {
  const { plans, loading } = useSubscriptionPlans();
  const [localPlans, setLocalPlans] = useState<SubscriptionPlan[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalPlans(plans);
  }, [plans]);

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) return;
    setDeletingId(id);
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Erro ao excluir plano:', error.message);
      alert('Não foi possível excluir o plano.');
    } else {
      setLocalPlans(prev => prev.filter(p => p.id !== id));
    }
    setDeletingId(null);
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setTogglingId(id);
    const { error } = await supabase
      .from('subscription_plans')
      .update({ active: !current })
      .eq('id', id);
    if (error) {
      console.error('Erro ao atualizar status:', error.message);
      alert('Não foi possível atualizar o status do plano.');
    } else {
      setLocalPlans(prev =>
        prev.map(p => (p.id === id ? { ...p, active: !current } : p))
      );
    }
    setTogglingId(null);
  };

  if (loading) {
    return <p className="p-8 text-center text-gray-500">Carregando planos…</p>;
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
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

        {/* Mobile: Cards */}
        <div className="sm:hidden space-y-4">
          {localPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition p-4"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{plan.name}</h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{plan.key}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(plan.id, !!plan.active)}
                    disabled={togglingId === plan.id}
                    className="disabled:opacity-50"
                    aria-label={plan.active ? 'Desativar plano' : 'Ativar plano'}
                  >
                    {plan.active ? (
                      <ToggleRight className="h-6 w-6 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    disabled={deletingId === plan.id}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    aria-label="Excluir plano"
                  >
                    <Trash2 className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Preço:</span>
                  <span className="font-medium text-gray-900">R$ {plan.price.toFixed(2)} {plan.currency.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Intervalo:</span>
                  <span className="font-medium text-gray-900">Cada {plan.interval_count}× {plan.interval}</span>
                </div>
                {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}
              </div>
              <div className="mt-4">
                <Link
                  href={`/admin/planos/${plan.id}`}
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Edit2 className="mr-1 h-4 w-4" />
                  Editar
                </Link>
              </div>
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
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {localPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-semibold">{plan.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600 uppercase">{plan.key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">R$ {plan.price.toFixed(2)} {plan.currency.toUpperCase()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">Cada {plan.interval_count}× {plan.interval}</td>
                  <td className="px-6 py-4 whitespace-nowrap">                
                    <button
                      onClick={() => handleToggleActive(plan.id, !!plan.active)}
                      disabled={togglingId === plan.id}
                      className="inline-flex items-center disabled:opacity-50"
                      aria-label={plan.active ? 'Desativar plano' : 'Ativar plano'}
                    >
                      {plan.active ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right flex justify-end space-x-4">
                    <Link
                      href={`/admin/planos/${plan.id}`}
                      className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      <Edit2 className="mr-1 h-4 w-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      disabled={deletingId === plan.id}
                      className="inline-flex items-center text-red-600 hover:text-red-800 disabled:opacity-50"
                      aria-label="Excluir plano"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
