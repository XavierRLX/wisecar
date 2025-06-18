'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/formatters';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
import { useProfiles } from '@/hooks/useProfiles';
import { useSubscriptionPlans } from '@/hooks/useSubscriptionPlans';

export default function AdminUsersPage() {
  const { profiles, setProfiles, loading: loadingProfiles } = useProfiles();
  const { plans, loading: loadingPlans } = useSubscriptionPlans();

  const [search, setSearch] = useState('');
  const [filterAdmin, setFilterAdmin] = useState(false);
  const [filterPlanId, setFilterPlanId] = useState<string>('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Filtra e ordena
  const displayed = useMemo(() => {
    const term = search.toLowerCase().trim();
    return profiles
      .filter(p =>
        !term ||
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        p.username?.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term)
      )
      .filter(p => (!filterAdmin || p.is_admin))
      .filter(p => (!filterPlanId || p.plan_id === filterPlanId))
      .filter(p =>
        filterActive === 'all' ||
        (filterActive === 'active' && p.plan_active) ||
        (filterActive === 'inactive' && !p.plan_active)
      )
      .sort((a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
      );
  }, [profiles, search, filterAdmin, filterPlanId, filterActive]);

  // Toggle admin
  const toggleAdmin = async (id: string, value: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: value }).eq('id', id);
    if (!error) {
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, is_admin: value } : p));
    }
  };

  if (loadingProfiles || loadingPlans) {
    return <LoadingState message="Carregando usuários…" />;
  }

  return (
    <AdminGuard>
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <BackButton className="mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center sm:text-left">
          Painel de Usuários
        </h1>

        {/* Filtros Card */}
        <div className="bg-white rounded-lg shadow p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="col-span-1 sm:col-span-2">
            <input
              type="text"
              placeholder="Buscar por nome, usuário ou email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {/* Admin Toggle Filter */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterAdmin(a => !a)}
              className={`flex-shrink-0 relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                filterAdmin ? 'bg-indigo-500' : 'bg-gray-300'
              }`}
              aria-label="Filtrar apenas admins"
            >
              <span
                className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                  filterAdmin ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium">Admins</span>
          </div>
          {/* Plan Select */}
          <select
            value={filterPlanId}
            onChange={e => setFilterPlanId(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Todos Planos</option>
            {plans.map(plan => <option key={plan.id} value={plan.id}>{plan.name}</option>)}
          </select>
          {/* Status Select */}
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">Todos Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Contagem */}
        <p className="text-sm text-gray-600 mb-4">
          {displayed.length} usuário{displayed.length !== 1 ? 's' : ''}
        </p>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map(user => {
            const userPlan = plans.find(pl => pl.id === user.plan_id);
            return (
              <Link key={user.id} href={`/admin/users/${user.id}`} className="block">
                <div className="bg-white rounded-2xl shadow hover:shadow-md transition p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={user.avatar_url ?? '/default-avatar.png'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        {user.username && <p className="text-xs text-gray-500 truncate">@{user.username}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 truncate mb-2">{user.email}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={e => { e.preventDefault(); toggleAdmin(user.id, !user.is_admin); }}
                        className={`relative inline-flex items-center h-5 w-10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                          user.is_admin ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                        aria-label="Alternar admin"
                      >
                        <span
                          className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                            user.is_admin ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium">Admin</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-semibold ${user.plan_active ? 'text-green-600' : 'text-red-600'}`}>
                        {user.plan_active ? 'Ativo' : 'Inativo'}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{userPlan?.name || '—'}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-[10px] text-gray-400">
                    Criado: {user.created_at ? formatDate(user.created_at) : '-'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminGuard>
  );
}
