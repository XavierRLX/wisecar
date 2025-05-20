"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto space-y-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">
            Escolha uma das áreas de gerenciamento abaixo.
          </p>
          <div className="space-y-4">
            <Link
              href="/admin/users"
              className="block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Gerenciar Usuários
            </Link>
            <Link
              href="/admin/lojas"
              className="block w-full px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              Gerenciar Lojas
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
