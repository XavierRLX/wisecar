// app/admin/page.tsx
"use client";

import Link from "next/link";
import AdminGuard from "@/components/AdminGuard";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Escolha uma das áreas de gerenciamento abaixo.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/admin/users"
              className="block px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Gerenciar Usuários
            </Link>
            <Link
              href="/admin/lojas"
              className="block px-6 py-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              Gerenciar Lojas
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
);
}
