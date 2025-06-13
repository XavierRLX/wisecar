// app/admin/users/page.tsx
'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { formatDate } from '@/lib/formatters';
import AdminGuard from '@/components/AdminGuard';
import LoadingState from '@/components/LoadingState';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at?: string;
}

export default function AdminUsersPage() {
  const [profiles, setProfiles]       = useState<Profile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterAdmin, setFilterAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, email, avatar_url, is_admin, created_at');
      if (error) {
        console.error('Erro ao carregar profiles:', error);
      } else {
        setProfiles(data as Profile[]);
      }
      setLoading(false);
    })();
  }, []);

  const toggleAdmin = async (id: string, value: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: value })
      .eq('id', id);
    if (error) {
      console.error('Erro ao atualizar perfil:', error.message);
      return;
    }
    setProfiles(prev =>
      prev.map(p => p.id === id ? { ...p, is_admin: value } : p)
    );
  };

  const displayed = useMemo(() => {
    const term = search.toLowerCase().trim();
    return profiles
      .filter(p =>
        !term
        || p.first_name.toLowerCase().includes(term)
        || p.last_name.toLowerCase().includes(term)
        || p.username?.toLowerCase().includes(term)
        || p.email.toLowerCase().includes(term)
      )
      .filter(p => filterAdmin ? !!p.is_admin : true)
      .sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }, [profiles, search, filterAdmin]);

  if (loading) return <LoadingState message="Carregando usuários…" />;

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
            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setFilterAdmin(a => !a)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              filterAdmin
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Apenas Administradores
          </button>
        </div>

        {/* Total de usuários filtrados */}
        <div className="text-sm text-gray-600">
          {displayed.length} usuário{displayed.length !== 1 ? 's' : ''}
        </div>

        {/* Lista de cards */}
        <div className="space-y-4">
          {displayed.length > 0 ? (
            displayed.map(user => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block hover:shadow-md transition"
              >
                <div className="bg-white rounded-lg shadow-sm transition p-6">

                  {/* Nome + Username */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={user.avatar_url ?? '/default-avatar.png'}
                        alt={`${user.first_name} avatar`}
                        className="w-8 h-8 rounded-full object-cover bg-gray-200"
                      />
                      <div className="flex flex-col items-center">
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

                    {/* Toggle Admin */}
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-700">Admin</span>
                      <button
                        onClick={e => {
                          e.preventDefault();
                          toggleAdmin(user.id, !user.is_admin);
                        }}
                        className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
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
                  </div>

                  {/* E-mail + Created At */}
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
            ))
          ) : (
            <p className="text-center text-gray-500">
              Nenhum usuário encontrado.
            </p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
