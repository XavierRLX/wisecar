// app/admin/planos/[id]/page.tsx
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // renomeado de 'key' para não conflitar com React
  const [planKey, setPlanKey] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [currency, setCurrency] = useState('BRL');
  const [interval, setIntervalField] = useState<'day' | 'month' | 'year'>('month');
  const [intervalCount, setIntervalCount] = useState<number>(1);

  // carrega o plano
  useEffect(() => {
    supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
        } else if (data) {
          const p = data as SubscriptionPlan;
          setPlan(p);
          setName(p.name);
          setPlanKey(p.key);
          setDesc(p.description || '');
          setPrice(p.price);
          setCurrency(p.currency);
          setIntervalField(p.interval as any);
          setIntervalCount(p.interval_count);
        }
      });
  }, [id, supabase]);

  if (!plan) {
    return <p className="p-8 text-center">Carregando plano…</p>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const updates = {
      name,
      key: planKey,
      description: desc,
      price,
      currency,
      interval,
      interval_count: intervalCount,
    };

    // executa update
    const { data, error } = await supabase
      .from('subscription_plans')
      .update(updates)
      .eq('id', id);

    if (error) {
      // 23505 = duplicate key value violates unique constraint
      if (error.code === '23505') {
        console.warn('Chave duplicada ignorada:', planKey);
        // prossegue mesmo assim
      } else {
        console.error(error);
        setErrorMsg(error.message);
        setSaving(false);
        return;
      }
    }

    // redireciona após update ou after duplicate-ignore
    router.push('/admin/planos');
    setSaving(false);
  }

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8 max-w-lg mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-2 sm:space-y-0">
          <BackButton />
          <h2 className="text-2xl font-bold">Editar Plano</h2>
        </div>

        {errorMsg && (
          <p className="mb-4 text-center text-red-600">{errorMsg}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chave */}
          <div className="flex flex-col">
            <label htmlFor="planKey" className="mb-1 font-medium">
              Chave (pode repetir)
            </label>
            <input
              id="planKey"
              name="planKey"
              value={planKey}
              onChange={e => setPlanKey(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              disabled={saving}
            />
          </div>

          {/* Nome */}
          <div className="flex flex-col">
            <label htmlFor="name" className="mb-1 font-medium">
              Nome
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              disabled={saving}
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col">
            <label htmlFor="desc" className="mb-1 font-medium">
              Descrição
            </label>
            <textarea
              id="desc"
              name="desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              rows={4}
              disabled={saving}
            />
          </div>

          {/* Preço e Moeda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="price" className="mb-1 font-medium">
                Preço
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(+e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
                disabled={saving}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="currency" className="mb-1 font-medium">
                Moeda
              </label>
              <input
                id="currency"
                name="currency"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
                disabled={saving}
              />
            </div>
          </div>

          {/* Intervalo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label htmlFor="interval" className="mb-1 font-medium">
                Intervalo
              </label>
              <select
                id="interval"
                name="interval"
                value={interval}
                onChange={e => setIntervalField(e.target.value as any)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
                disabled={saving}
              >
                <option value="day">Dia</option>
                <option value="month">Mês</option>
                <option value="year">Ano</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 flex flex-col">
              <label htmlFor="intervalCount" className="mb-1 font-medium">
                Contagem do Intervalo
              </label>
              <input
                id="intervalCount"
                name="intervalCount"
                type="number"
                value={intervalCount}
                onChange={e => setIntervalCount(+e.target.value)}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
                disabled={saving}
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
