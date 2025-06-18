//app/admin/users/[id]/page

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

  // Derive profile
  const profile = useMemo(() => profiles.find(p => p.id === userId) ?? null, [profiles, userId]);
  const currentPlan = useMemo(() => plans.find(p => p.id === profile?.plan_id) ?? null, [plans, profile]);

  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [updatingAdmin, setUpdatingAdmin] = useState(false);

  // Global loading
  const isLoading = loadingProfiles || loadingPlans || loadingProviders || loadingVehicles;
  if (isLoading) return <LoadingState message="Carregando detalhes…" />;

  if (!profile) return <div className="max-w-lg mx-auto p-6"><p className="text-center text-red-600">Perfil não encontrado.</p></div>;
  if (errorProviders || errorVehicles) return <div className="max-w-lg mx-auto p-6"><p className="text-center text-red-600">Erro: {errorProviders || errorVehicles}</p></div>;

  // Toggle functions
  const handlePlanChange = async (newPlan: string) => {
    setUpdatingPlan(true);
    const { error } = await supabase.from('profiles').update({ plan_id: newPlan }).eq('id', userId);
    if (!error) setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan_id: newPlan } : p));
    setUpdatingPlan(false);
  };
  const togglePlanActive = async () => {
    if (!profile) return;
    setUpdatingPlan(true);
    const { error } = await supabase.from('profiles').update({ plan_active: !profile.plan_active }).eq('id', userId);
    if (!error) setProfiles(prev => prev.map(p => p.id === userId ? { ...p, plan_active: !p.plan_active } : p));
    setUpdatingPlan(false);
  };
  const toggleAdmin = async () => {
    if (!profile) return;
    setUpdatingAdmin(true);
    const { error } = await supabase.from('profiles').update({ is_admin: !profile.is_admin }).eq('id', userId);
    if (!error) setProfiles(prev => prev.map(p => p.id === userId ? { ...p, is_admin: !p.is_admin } : p));
    setUpdatingAdmin(false);
  };

  return (
    <AdminGuard>
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <BackButton className="mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">Detalhes do Usuário</h1>

        {/* Info & Plan Container */}
        <div className="flex flex-col space-y-6 md:space-y-0 md:flex-row md:space-x-6">
          {/* Profile Info Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4">Informações</h2>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex justify-between"><span>Nome</span><span>{profile.first_name} {profile.last_name}</span></li>
              <li className="flex justify-between"><span>Username</span><span>{profile.username || '—'}</span></li>
              <li className="flex justify-between"><span>Email</span><span>{profile.email}</span></li>
              <li className="flex justify-between"><span>Criado em</span><span>{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</span></li>
              <li className="flex justify-between items-center">
                <span>Admin</span>
                <button
                  onClick={toggleAdmin}
                  disabled={updatingAdmin}
                  className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${profile.is_admin ? 'bg-blue-500' : 'bg-gray-300'}`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${profile.is_admin ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </li>
            </ul>
          </div>

          {/* Plan Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-4">Plano Atual</h2>
              <div className="space-y-2">
                <p className="font-medium text-base">{currentPlan?.name || '—'}</p>
                <p className="text-xs text-gray-500">{currentPlan?.key || '—'}</p>
                {currentPlan?.description && <p className="text-sm text-gray-600">{currentPlan.description}</p>}
                {typeof currentPlan?.price === 'number' && <p className="text-sm font-semibold">R$ {currentPlan.price.toFixed(2)}/mês</p>}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <label className="text-sm">Ativo</label>
                <button
                  onClick={togglePlanActive}
                  disabled={updatingPlan}
                  className={`relative inline-flex items-center h-6 w-12 rounded-full transition-colors ${profile.plan_active ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${profile.plan_active ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
            <div className="mt-6">
              <select
                className="block w-full border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={profile.plan_id}
                onChange={e => handlePlanChange(e.target.value)}
                disabled={updatingPlan}
              >
                {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name} ({plan.key})</option>)}
              </select>
              {updatingPlan && <p className="mt-2 text-xs text-indigo-600">Atualizando…</p>}
            </div>
          </div>
        </div>

        {/* Providers Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Lojas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {providers.length > 0 ? providers.map(p => <ProviderCard key={p.id} provider={p} />) : <p className="text-gray-500">Nenhuma loja encontrada.</p>}
          </div>
        </section>

        {/* Vehicles Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Veículos</h2>
          <div className="space-y-4">
            {vehicles.length > 0 ? vehicles.map(v => (
              <div key={v.id} className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition p-3 sm:p-4">
                <img src={v.vehicle_images?.[0]?.image_url ?? '/default-car.png'} alt="vehicle" className="w-12 h-12 sm:w-14 sm:h-14 rounded mr-3" />
                <div className="flex-1 text-sm sm:text-base">
                  <p className="font-medium truncate">{v.brand} {v.model} ({v.year})</p>
                  <p className="truncate">Status: {v.status}</p>
                </div>
              </div>
            )) : <p className="text-gray-500">Nenhum veículo encontrado.</p>}
          </div>
        </section>
      </div>
    </AdminGuard>
  );
}
