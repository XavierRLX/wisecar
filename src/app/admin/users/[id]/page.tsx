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
import { Profile } from '@/types';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id || '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const { plans, loading: loadingPlans } = useSubscriptionPlans();
  const [loadingData, setLoadingData] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const { providers, loading: loadingProviders, error: errorProviders } =
    useUserProviders(userId);
  const { vehicles, loading: loadingVehicles, error: errorVehicles } =
    useUserVehicles(userId);

  // Carrega perfil do usuário
  useEffect(() => {
    if (!userId) return;
    setLoadingData(true);

    supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        username,
        email,
        avatar_url,
        is_admin,
        created_at,
        plan_id,
        plan_active,
        subscription_plans ( key, name )
      `)
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          const sub =
            Array.isArray(data.subscription_plans) && data.subscription_plans.length > 0
              ? { key: data.subscription_plans[0].key, name: data.subscription_plans[0].name }
              : { key: '', name: '' };

          setProfile({
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username ?? undefined,
            email: data.email,
            avatar_url: data.avatar_url ?? undefined,
            is_admin: data.is_admin ?? false,
            created_at: data.created_at ?? undefined,
            plan_id: data.plan_id,
            plan_active: data.plan_active,
            subscription_plan: sub,
          });
        }
        setLoadingData(false);
      });
  }, [userId]);

  if (loadingData || loadingProviders || loadingVehicles || loadingPlans) {
    return <LoadingState message="Carregando detalhes…" />;
  }

  if (!profile) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-center text-red-600">Perfil não encontrado.</p>
      </div>
    );
  }

  if (errorProviders || errorVehicles) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <p className="text-center text-red-600">
          Erro: {errorProviders || errorVehicles}
        </p>
      </div>
    );
  }

  // Altera o plano do usuário
  const handlePlanChange = async (newPlanId: string) => {
    setUpdatingPlan(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan_id: newPlanId })
      .eq('id', userId);

    if (!error) {
      const newPlan = plans.find((p) => p.id === newPlanId);
      if (newPlan) {
        setProfile((prev) =>
          prev && {
            ...prev,
            plan_id: newPlan.id,
            subscription_plan: { key: newPlan.key, name: newPlan.name },
          }
        );
      }
    }
    setUpdatingPlan(false);
  };

  // Ativa / inativa o plano
  const togglePlanActive = async () => {
    setUpdatingPlan(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan_active: !profile.plan_active })
      .eq('id', userId);

    if (!error) {
      setProfile((prev) => prev && { ...prev, plan_active: !prev.plan_active });
    }
    setUpdatingPlan(false);
  };

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
          Detalhes do Usuário
        </h1>

        {/* Informações e Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card de Informações */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
            <dl className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <dt className="font-medium">Nome</dt>
                <dd>
                  {profile.first_name} {profile.last_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Username</dt>
                <dd>{profile.username || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Criado em</dt>
                <dd>
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleString()
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Admin</dt>
                <dd>{profile.is_admin ? 'Sim' : 'Não'}</dd>
              </div>
            </dl>
          </div>

          {/* Card de Plano */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Plano Atual</h2>
            <p className="mb-4 text-gray-800">
              <span className="font-medium">
                {profile.subscription_plan.name}
              </span>{' '}
              ({profile.subscription_plan.key})
            </p>

            <label className="block font-medium mb-2">Alterar Plano</label>
            <select
              className="w-full border rounded px-3 py-2 focus:ring"
              value={profile.plan_id}
              onChange={(e) => handlePlanChange(e.target.value)}
              disabled={updatingPlan}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({plan.key})
                </option>
              ))}
            </select>
            {updatingPlan && (
              <p className="mt-2 text-sm text-gray-500">Atualizando plano…</p>
            )}

            <div className="mt-4 flex items-center justify-between">
              <span className="font-medium">Status do Plano:</span>
              <button
                onClick={togglePlanActive}
                disabled={updatingPlan}
                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
              >
                {profile.plan_active ? 'Inativar Plano' : 'Ativar Plano'}
              </button>
            </div>
          </div>
        </div>

        {/* Lojas */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Lojas Cadastradas
          </h2>
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {providers.map((p) => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma loja encontrada.</p>
          )}
        </section>

        {/* Veículos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            Veículos Cadastrados
          </h2>
          {vehicles.length > 0 ? (
            <div className="space-y-4">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition p-4"
                >
                  <img
                    src={v.vehicle_images?.[0]?.image_url ?? '/default-car.png'}
                    alt={`${v.brand} ${v.model}`}
                    className="w-14 h-14 object-cover rounded mr-4 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {v.brand} {v.model} ({v.year})
                    </p>
                    <p className="text-sm text-gray-600">Status: {v.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum veículo encontrado.</p>
          )}
        </section>
      </div>
    </AdminGuard>
  );
}
