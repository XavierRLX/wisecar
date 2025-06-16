// app/admin/planos/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import BackButton from '@/components/BackButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoadingState from '@/components/LoadingState';
import { SubscriptionPlan } from '@/types';

export default function NewPlanoPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState('BRL');
  const [interval, setInterval] = useState<'dia' | 'Mês' | 'Ano'>('Mês');
  const [intervalCount, setIntervalCount] = useState<string>('1');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // validações básicas
    if (!key.trim() || !name.trim() || !price || !intervalCount) {
      setErrorMsg('Preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    const newPlan: Omit<SubscriptionPlan, 'id'> = {
      key: key.trim(),
      name: name.trim(),
      description: desc.trim() || null,
      price: parseFloat(price),
      currency: currency.trim(),
      interval,
      interval_count: parseInt(intervalCount, 10),
    };

    const { error } = await supabase
      .from('subscription_plans')
      .insert(newPlan);

    setSaving(false);

    if (error) {
      setErrorMsg('Erro ao criar plano: ' + error.message);
    } else {
      router.push('/admin/planos');
    }
  }

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8 max-w-lg mx-auto">
        <BackButton />
        <h2 className="text-2xl font-bold mb-6 text-center">Novo Plano</h2>
        {errorMsg && (
          <p className="mb-4 text-center text-red-600">{errorMsg}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chave */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Chave (única)*</label>
            <input
              value={key}
              onChange={e => setKey(e.target.value)}
              disabled={saving}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
            />
          </div>

          {/* Nome */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Nome*</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={saving}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Descrição</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              disabled={saving}
              rows={4}
              className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
            />
          </div>

          {/* Preço e Moeda */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Preço (R$)*</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                disabled={saving}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Moeda*</label>
              <input
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                disabled={saving}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
          </div>

          {/* Intervalo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium">Intervalo*</label>
              <select
                value={interval}
                onChange={e => setInterval(e.target.value as any)}
                disabled={saving}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              >
                <option value="day">Dia</option>
                <option value="month">Mês</option>
                <option value="year">Ano</option>
              </select>
            </div>
            <div className="col-span-1 sm:col-span-2 flex flex-col">
              <label className="mb-1 font-medium">Contagem*</label>
              <input
                type="number"
                value={intervalCount}
                onChange={e => setIntervalCount(e.target.value)}
                disabled={saving}
                className="w-full border px-3 py-2 rounded focus:ring sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition sm:w-auto sm:px-6"
          >
            {saving ? 'Criando…' : 'Criar Plano'}
          </button>
        </form>
      </div>
    </AdminGuard>
  );
}
