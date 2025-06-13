// app/admin/planos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { SubscriptionPlan } from '@/types';

export default function EditPlanoPage() {
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [saving, setSaving] = useState(false);

  // campos de formulário
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
          const p = data as SubscriptionPlan;
          setPlan(p);
          setName(p.name);
          setKey(p.key);
          setDesc(p.description || '');
          setPrice(p.price);
          setCurrency(p.currency);
          setIntervalField(p.interval as any);
          setIntervalCount(p.interval_count);
        }
      });
  }, [id, supabase]);

  if (!plan) return <p className="p-8">Carregando plano…</p>;

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
      <div className="max-w-xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-4">Editar Plano</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Chave */}
          <div>
            <label className="block font-medium">Chave (única)</label>
            <input
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Nome */}
          <div>
            <label className="block font-medium">Nome</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-medium">Descrição</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          {/* Preço e Moeda */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Preço</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(+e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div>
              <label className="block font-medium">Moeda</label>
              <input
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* Intervalo */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-medium">Intervalo</label>
              <select
                value={interval}
                onChange={e => setIntervalField(e.target.value as any)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="day">Dia</option>
                <option value="month">Mês</option>
                <option value="year">Ano</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block font-medium">Contagem do Intervalo</label>
              <input
                type="number"
                value={intervalCount}
                onChange={e => setIntervalCount(+e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {saving ? 'Salvando…' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
