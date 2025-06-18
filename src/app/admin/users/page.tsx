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

  // Aplica filtros e ordena
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
      .sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [profiles, search, filterAdmin, filterPlanId, filterActive]);

  // Toggle admin flag
  const toggleAdmin = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: value })
      .eq('id', id);

    if (!error) {
      setProfiles(prev =>
        prev.map(p => (p.id === id ? { ...p, is_admin: value } : p))
      );
    } else {
      console.error('Erro ao atualizar Admin:', error.message);
    }
  };

  if (loadingProfiles || loadingPlans) {
    return <LoadingState message="Carregando usuários e planos…" />;
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <BackButton className="mb-2" />
        <h1 className="text-3xl font-bold text-gray-800">Painel de Usuários</h1>

        {/* Busca + Filtro Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <input
            type="text"
            placeholder="Buscar por nome, usuário ou email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:flex-1 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilterAdmin(f => !f)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              filterAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Apenas Admins
          </button>
        </div>

        {/* Filtros por Plano + Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <select
            value={filterPlanId}
            onChange={e => setFilterPlanId(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none"
          >
            <option value="">Todos os Planos</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>

          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value as any)}
            className="w-full sm:w-1/2 px-4 py-2 border rounded-lg focus:outline-none"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        {/* Contagem */}
        <div className="text-sm text-gray-600">
          {displayed.length} usuário{displayed.length !== 1 ? 's' : ''}
        </div>

        {/* Lista de Cards */}
        <div className="space-y-4">
          {displayed.length > 0 ? (
            displayed.map(user => {
              const userPlan = plans.find(pl => pl.id === user.plan_id);
              return (
                <Link
                  key={user.id}
                  href={`/admin/users/${user.id}`}
                  className="block hover:shadow-md transition"
                >
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Cabeçalho */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={user.avatar_url ?? '/default-avatar.png'}
                          alt={`${user.first_name} avatar`}
                          className="w-8 h-8 rounded-full object-cover bg-gray-200"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.first_name} {user.last_name}
                          </div>
                          {user.username && (
                            <div className="text-xs text-gray-500 truncate">
                              @{user.username}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Toggles e Info */}
                      <div className="flex space-x-6">
                        {/* Admin Toggle */}
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">Admin</span>
                          <button
                            onClick={e => {
                              e.preventDefault();
                              toggleAdmin(user.id, !user.is_admin);
                            }}
                            className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                              user.is_admin ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transform transition-transform ${
                                user.is_admin ? 'translate-x-5' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Plano Ativo */}
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">Status</span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.plan_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.plan_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>

                        {/* Nome do Plano */}
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium">Plano</span>
                          <span className="text-xs text-gray-700 truncate">
                            {userPlan?.name || '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rodapé */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="text-gray-600 truncate">{user.email}</div>
                      {user.created_at && (
                        <div className="text-[10px] text-gray-400 whitespace-nowrap">
                          Criado: {formatDate(user.created_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="text-center text-gray-500">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
