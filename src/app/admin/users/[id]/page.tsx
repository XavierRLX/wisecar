'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import BackButton from '@/components/BackButton';
import ProviderCard from '@/components/ProviderCard';
import { useUserProviders } from '@/hooks/useUserProviders';
import { useUserVehicles } from '@/hooks/useUserVehicles';
import { supabase } from '@/lib/supabase';
import { useProfiles } from '@/hooks/useProfiles';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const userId = Array.isArray(id) ? id[0] : id || '';

  // Hooks
  const { profiles, setProfiles, loading: loadingProfiles } = useProfiles();
  const { plans, loading: loadingPlans } = useSubscriptionPlans();
  const { providers, loading: loadingProviders, error: errorProviders } = useUserProviders(userId);
  const { vehicles, loading: loadingVehicles, error: errorVehicles } = useUserVehicles(userId);

  // Deriva o perfil a partir do hook
  const profile = useMemo(() => profiles.find(p => p.id === userId) ?? null, [profiles, userId]);

  // Plano atual completo
  const currentPlan = useMemo(
    () => plans.find(p => p.id === profile?.plan_id) ?? null,
    [plans, profile]
  );

  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  // Loading geral
  const isLoading = loadingProfiles || loadingPlans || loadingProviders || loadingVehicles;
  if (isLoading) return <LoadingState message="Carregando detalhes…" />;

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
        <p className="text-center text-red-600">Erro: {errorProviders || errorVehicles}</p>
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
      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, plan_id: newPlanId } : p)
      );
    }
    setUpdatingPlan(false);
  };

  // Ativa / Inativa o plano usando toggle
  const togglePlanActive = async () => {
    if (!profile) return;
    setUpdatingPlan(true);
    const { error } = await supabase
      .from('profiles')
      .update({ plan_active: !profile.plan_active })
      .eq('id', userId);
    if (!error) {
      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, plan_active: !p.plan_active } : p)
      );
    }
    setUpdatingPlan(false);
  };

  // Ativa / Inativa permissão de admin
  const toggleAdmin = async () => {
    if (!profile) return;
    setUpdatingAdmin(true);
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: !profile.is_admin })
      .eq('id', userId);
    if (!error) {
      setProfiles(prev =>
        prev.map(p => p.id === userId ? { ...p, is_admin: !p.is_admin } : p)
      );
    }
    setUpdatingAdmin(false);
  };

  return (
    <AdminGuard>
      <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
        <BackButton />
        <h1 className="text-3xl font-bold text-gray-800 text-center sm:text-left">
          Detalhes do Usuário
        </h1>

        {/* Seção de Info e Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações Gerais com toggle Admin */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold mb-4">Informações Gerais</h2>
            <dl className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center">
                <dt className="font-medium">Nome</dt>
                <dd>{profile.first_name} {profile.last_name}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium">Username</dt>
                <dd>{profile.username || '—'}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium">Email</dt>
                <dd>{profile.email}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium">Criado em</dt>
                <dd>{profile.created_at ? new Date(profile.created_at).toLocaleString() : '—'}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="font-medium">Admin</dt>
                <dd>
                  <button
                    onClick={toggleAdmin}
                    disabled={updatingAdmin}
                    className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${
                      profile.is_admin ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label="Alternar permissão de admin"
                  >
                    <span
                      className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        profile.is_admin ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </dd>
              </div>
            </dl>
          </div>

          {/* Cartão de Plano */}
          <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Plano Atual</h2>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-medium">{currentPlan?.name || '—'}</p>
                  <p className="text-sm text-gray-500">{currentPlan?.key || '—'}</p>
                  {currentPlan?.description && (
                    <p className="mt-2 text-sm text-gray-600">{currentPlan.description}</p>
                  )}
                  {typeof currentPlan?.price === 'number' && (
                    <p className="mt-1 text-sm font-semibold text-indigo-600">
                      R$ {currentPlan.price.toFixed(2)} / mês
                    </p>
                  )}
                </div>
                {/* Toggle de status do plano */}
                <button
                  onClick={togglePlanActive}
                  disabled={updatingPlan}
                  className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${
                    profile.plan_active ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                  aria-label="Alternar status do plano"
                >
                  <span
                    className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      profile.plan_active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Seletor de planos */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Alterar Plano</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                <p className="mt-2 text-sm text-indigo-500">Atualizando plano…</p>
              )}
            </div>
          </div>
        </div>

        {/* Lojas */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Lojas Cadastradas</h2>
          {providers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {providers.map(p => (
                <ProviderCard key={p.id} provider={p} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma loja encontrada.</p>
          )}
        </section>

        {/* Veículos */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">Veículos Cadastrados</h2>
          {vehicles.length > 0 ? (
            <div className="space-y-4">
              {vehicles.map(v => (
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
                    <p className="font-medium text-gray-900">{v.brand} {v.model} ({v.year})</p>
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
