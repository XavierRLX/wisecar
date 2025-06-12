'use client';

import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { Users, Store, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Painel de Administração
          </h1>
          <p className="text-gray-600">
            Selecione uma área para gerenciar recursos do sistema.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/admin/users"
              className="flex flex-col items-center justify-center gap-2 px-6 py-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Users className="w-10 h-10 text-blue-600" />
              <span className="mt-2 text-lg font-medium text-gray-900">
                Usuários
              </span>
            </Link>

            <Link
              href="/admin/lojas"
              className="flex flex-col items-center justify-center gap-2 px-6 py-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <Store className="w-10 h-10 text-green-600" />
              <span className="mt-2 text-lg font-medium text-gray-900">
                Lojas
              </span>
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}