'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import BackButton from '@/components/BackButton';
import { useUserProviders } from '@/hooks/useUserProviders';
import { useUserVehicles } from '@/hooks/useUserVehicles';
import { useProfiles } from '@/hooks/useProfiles';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';
import { useUserSubscription } from '@/hooks/useUserSubscription';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/formatters';
import type { Profile } from '@/types';

// Helper para adicionar meses corretamente (tratando fim de mês)
function addMonths(date: Date, months: number) {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== day) {
    d.setDate(0);
  }
  return d;
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id || '';

  const [updatingAdmin, setUpdatingAdmin] = useState(false);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const { profiles, setProfiles, loading: loadingProfiles } = useProfiles();
  const { plans, loading: loadingPlans } = useSubscriptionPlans();
  const { providers, loading: loadingProviders, error: errorProviders } = useUserProviders(userId);
  const { vehicles, loading: loadingVehicles, error: errorVehicles } = useUserVehicles(userId);
  const { sub: currentSub, setSub: setCurrentSub, loading: loadingSub } = useUserSubscription(userId);

  const [selectedPlan, setSelectedPlan] = useState<string>('');

  // Define selectedPlan a partir de currentSub
  useEffect(() => {
    if (currentSub?.plan_id) {
      setSelectedPlan(currentSub.plan_id);
    }
  }, [currentSub]);

  if (loadingProfiles || loadingPlans || loadingProviders || loadingVehicles || loadingSub) {
    return <LoadingState message="Carregando detalhes…" />;
  }

  const profile = profiles.find((p) => p.id === userId);
  if (!profile) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-center text-red-600">Perfil não encontrado.</p>
      </div>
    );
  }

  if (errorProviders || errorVehicles) {
    const errMsg = errorProviders || errorVehicles;
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-center text-red-600">Erro: {errMsg}</p>
      </div>
    );
  }

  const toggleAdmin = async () => {
    setUpdatingAdmin(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !profile.is_admin })
      .eq('id', userId);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_admin: !p.is_admin } : p
        )
      );
    }
    setUpdatingAdmin(false);
  };

  const togglePlanActive = async () => {
    setUpdatingPlan(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan_active: !profile.plan_active })
      .eq('id', userId);
    if (!error) {
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, plan_active: !p.plan_active } : p
        )
      );
    }
    setUpdatingPlan(false);
  };

  const handleChangePlan = async () => {
    if (!selectedPlan) return;
    setUpdatingPlan(true);

    // Cancela assinatura existente
    if (currentSub) {
      await supabase
        .from('subscriptions')
        .update({ canceled_at: new Date().toISOString() })
        .eq('id', currentSub.id);
    }

    // Busca dados do plano selecionado
    const plan = plans.find((p) => p.id === selectedPlan);
    if (!plan) {
      setUpdatingPlan(false);
      return;
    }

    // Calcula datas de início e expiração
    const now = new Date();
    let expires: Date;
    if (plan.interval === 'day') {
      expires = new Date(now);
      expires.setDate(now.getDate() + plan.interval_count);
    } else if (plan.interval === 'month') {
      expires = addMonths(now, plan.interval_count);
    } else {
      expires = new Date(now);
      expires.setFullYear(now.getFullYear() + plan.interval_count);
    }

    // Insere nova assinatura
    const { data: newSub, error: insertError } = await supabase
      .from('subscriptions')
      .insert({
        profile_id: userId,
        plan_id: selectedPlan,
        started_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .select(
        `id, profile_id, plan_id, started_at, expires_at, canceled_at, subscription_plans(key,name,price,interval,interval_count)`
      )
      .single();

    // Verifica se newSub é nulo
    if (insertError || !newSub) {
      console.error('Erro ao criar assinatura ou assinatura nula', insertError);
      setUpdatingPlan(false);
      return;
    }

    // Atualiza tabela profiles
    await supabase
      .from('profiles')
      .update({ plan_id: selectedPlan, plan_active: true })
      .eq('id', userId);

    // Atualiza estado local
    const rel = Array.isArray((newSub as any).subscription_plans)
      ? (newSub as any).subscription_plans[0]
      : (newSub as any).subscription_plans;
    setCurrentSub({
      id: newSub.id,
      profile_id: newSub.profile_id,
      plan_id: newSub.plan_id,
      started_at: newSub.started_at,
      expires_at: newSub.expires_at,
      canceled_at: newSub.canceled_at,
      subscription_plan: rel,
    });
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === userId
          ? { ...p, plan_id: selectedPlan, plan_active: true, subscription_plan: { key: plan.key, name: plan.name } }
          : p
      )
    );
    setUpdatingPlan(false);
  };

  // Define plano a exibir: assinatura ativa ou perfil
  const mostrarPlano = currentSub?.subscription_plan || profile.subscription_plan;

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        <BackButton />
        <h1 className="text-2xl font-bold">Detalhes do Usuário</h1>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Perfil */}
          <div className="flex-1 bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Informações</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>Nome:</span>
                <span>{profile.first_name} {profile.last_name}</span>
              </li>
              <li className="flex justify-between">
                <span>Username:</span>
                <span>{profile.username || '—'}</span>
              </li>
              <li className="flex justify-between">
                <span>Email:</span>
                <span>{profile.email}</span>
              </li>
              <li className="flex justify-between">
                <span>Criado em:</span>
                <span>{formatDate(profile.created_at!)}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Admin:</span>
                <button onClick={toggleAdmin} disabled={updatingAdmin} className={`relative inline-flex h-6 w-12 rounded-full ${profile.is_admin ? 'bg-blue-500' : 'bg-gray-300'}`}>                
                  <span className={`block w-5 h-5 bg-white rounded-full transform ${profile.is_admin ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </li>
            </ul>
          </div>

          {/* Assinatura */}
          <div className="flex-1 bg-white p-6 rounded shadow flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Assinatura Atual</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Plano:</strong> {mostrarPlano.name || '—'}</p>
                <p className="text-xs text-gray-500">Key: {mostrarPlano.key || '—'}</p>
                <p className="text-gray-600">
                  {currentSub
                    ? `De ${formatDate(currentSub.started_at)} até ${formatDate(currentSub.expires_at)}`
                    : profile.plan_active
                      ? 'Plano ativo sem datas registradas'
                      : 'Nenhuma assinatura ativa'}
                </p>
                <div className="mt-2 flex justify-between items-center">
                  <span>Plano ativo:</span>
                  <button onClick={togglePlanActive} disabled={updatingPlan} className={`relative inline-flex h-6 w-12 rounded-full ${profile.plan_active ? 'bg-green-500' : 'bg-gray-300'}`}>                  
                    <span className={`block w-5 h-5 bg-white rounded-full transform ${profile.plan_active ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full border rounded p-2 text-sm"
              >
                <option value="" disabled>
                  Escolha um plano
                </option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — {plan.interval_count}×{plan.interval} ({plan.price.toFixed(2)} {plan.currency})
                  </option>
                ))}
              </select>
              <button
                onClick={handleChangePlan}
                disabled={!selectedPlan || updatingPlan}
                className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
              >
                {updatingPlan ? 'Alterando…' : 'Alterar plano'}
              </button>
            </div>
          </div>
        </div>

        {/* Providers Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Lojas</h2>
          <div className="space-y-4">
            {providers.length > 0 ? (
              providers.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/lojas/${p.id}`}
                  className="flex items-center bg-white p-4 rounded shadow-sm"
                >
                  <img
                    src={p.provider_images?.[0]?.image_url || '/default-shop.png'}
                    alt={p.name}
                    className="w-12 h-12 rounded mr-3"
                  />
                  <p className="font-medium">{p.name}</p>
                </Link>
              ))
            ) : (
              <p className="text-gray-500">Nenhuma loja encontrada.</p>
            )}
          </div>
        </section>
        {/* Vehicles Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Veículos</h2>
          <div className="space-y-4">
            {vehicles.length > 0 ? (
              vehicles.map((v) => (
                <div key={v.id} className="flex items-center bg-white p-4 rounded shadow-sm">
                  <img
                    src={v.vehicle_images?.[0]?.image_url ?? '/default-car.png'}
                    alt={`${v.brand} ${v.model}`}
                    className="w-12 h-12 rounded mr-3"
                  />
                  <p className="font-medium">{v.brand} {v.model} ({v.year})</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum veículo encontrado.</p>
            )}
          </div>
        </section>
      </div>
    </AdminGuard>
  );
}
