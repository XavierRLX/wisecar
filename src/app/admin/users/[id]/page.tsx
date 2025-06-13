// app/admin/users/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import BackButton from '@/components/BackButton';
import ProviderCard from '@/components/ProviderCard';
import { useUserProviders } from '@/hooks/useUserProviders';
import { useUserVehicles } from '@/hooks/useUserVehicles';
import { supabase } from '@/lib/supabase';
import { Profile, SubscriptionPlan } from '@/types';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const rawId = id;
  const userId = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const { providers, loading: loadingProviders, error: errorProviders } =
    useUserProviders(userId);
  const { vehicles, loading: loadingVehicles, error: errorVehicles } =
    useUserVehicles(userId);

  useEffect(() => {
    if (!userId) return;
    setLoadingData(true);

    Promise.all([
      supabase
        .from('profiles')
        .select(`*, subscription_plans ( key, name )`)
        .eq('id', userId)
        .single(),
      supabase
        .from('subscription_plans')
        .select('*')
        .order('name'),
    ]).then(([profRes, plansRes]) => {
      if (profRes.error) {
        console.error('Erro ao carregar profile:', profRes.error);
      } else {
        setProfile(profRes.data as Profile);
      }

      if (plansRes.error) {
        console.error('Erro ao carregar planos:', plansRes.error);
      } else {
        setPlans(plansRes.data as SubscriptionPlan[]);
      }

      setLoadingData(false);
    });
  }, [userId]);

  const handlePlanChange = async (newPlanId: string) => {
    if (!profile) return;
    setUpdatingPlan(true);

    const { error } = await supabase
      .from('profiles')
      .update({ plan_id: newPlanId })
      .eq('id', userId);

    setUpdatingPlan(false);

    if (error) {
      console.error('Erro ao atualizar plano:', error);
    } else {
      const newPlan = plans.find(p => p.id === newPlanId)!;
      setProfile({
        ...profile,
        plan_id: newPlan.id,
        subscription_plans: { key: newPlan.key, name: newPlan.name },
      });
    }
  };

  if (!userId || loadingData || loadingProviders || loadingVehicles) {
    return <LoadingState message="Carregando detalhes…" />;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">Perfil não encontrado.</p>
      </div>
    );
  }

  if (errorProviders || errorVehicles) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">Erro: {errorProviders || errorVehicles}</p>
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <BackButton />

        <h1 className="text-3xl font-bold text-gray-800">Detalhes do Usuário</h1>

        <div className="space-y-2">
          <p>
            <strong>Nome:</strong> {profile.first_name} {profile.last_name}
          </p>
          <p>
            <strong>Username:</strong> {profile.username ?? '—'}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Criado em:</strong>{' '}
            {profile.created_at
              ? new Date(profile.created_at).toLocaleString()
              : '—'}
          </p>
          <p>
            <strong>É Admin?:</strong> {profile.is_admin ? 'Sim' : 'Não'}
          </p>
          <p>
            <strong>Plano Atual:</strong> {profile.subscription_plans.name} (
            {profile.subscription_plans.key})
          </p>
        </div>

        <div className="pt-4">
          <label className="block font-medium mb-2">Alterar Plano</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={profile.plan_id}
            onChange={e => handlePlanChange(e.target.value)}
            disabled={updatingPlan}
          >
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.key})
              </option>
            ))}
          </select>
          {updatingPlan && (
            <p className="text-sm text-gray-500 mt-2">Atualizando plano…</p>
          )}
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Lojas cadastradas</h2>
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma loja encontrada.</p>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Veículos cadastrados</h2>
          {vehicles.length > 0 ? (
            vehicles.map(v => (
              <div
                key={v.id}
                className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition p-6"
              >
                <img
                  src={v.vehicle_images?.[0]?.image_url ?? '/default-car.png'}
                  alt={`${v.brand} ${v.model}`}
                  className="w-12 h-12 object-cover rounded mr-4"
                />
                <div className="flex-1">
                  <p className="text-lg font-medium text-gray-900">
                    {v.brand} {v.model} ({v.year})
                  </p>
                  <p className="mt-1 text-sm text-gray-600">Status: {v.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Nenhum veículo encontrado.</p>
          )}
        </section>
      </div>
    </AdminGuard>
  );
}
