'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubscriptionPlan } from '@/types';
import BackButton from '@/components/BackButton';

export default function EditPlanoPage() {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // campos
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('BRL');
  const [interval, setIntervalField] = useState<'day' | 'month' | 'year'>('month');
  const [intervalCount, setIntervalCount] = useState<number>(1);

  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error(error);
        else if (data) {
          setPlan(data as SubscriptionPlan);
          setName(data.name);
          setKey(data.key);
          setDesc(data.description || '');
          setPrice(data.price);
          setCurrency(data.currency);
          setIntervalField(data.interval as any);
          setIntervalCount(data.interval_count);
        }
      });
  }, [id, supabase]);

  if (!plan) return <p className="p-8 text-center">Carregando plano…</p>;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const updates = {
      name,
      key,
      description: desc,
      price,
      currency,
      interval,
      interval_count: intervalCount,
    };

    const { error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id);

    setSaving(false);
    if (error) console.error(error);
    else router.push('/admin/planos');
  }

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8 max-w-lg mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-2 sm:space-y-0">
          <BackButton />
          <h2 className="text-2xl font-bold">Editar Plano</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chave */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Chave (única)</label>
            <input
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
            />
          </div>

          {/* Nome */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Descrição</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              rows={4}
            />
          </div>

          {/* Preço e Moeda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Preço</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(+e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Moeda</label>
              <input
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
          </div>

          {/* Intervalo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Intervalo</label>
              <select
                value={interval}
                onChange={e => setIntervalField(e.target.value as any)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              >
                <option value="day">Dia</option>
                <option value="month">Mês</option>
                <option value="year">Ano</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 flex flex-col">
              <label className="mb-1 font-medium">Contagem do Intervalo</label>
              <input
                type="number"
                value={intervalCount}
                onChange={e => setIntervalCount(+e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition sm:w-auto sm:px-6"
          >
            {saving ? 'Salvando…' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
