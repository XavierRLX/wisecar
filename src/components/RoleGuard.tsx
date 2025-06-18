// components/RoleGuard.tsx
'use client';

import React, { ReactNode, ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from './LoadingState';
import RestrictedAccessAlert from './RestrictedAccessAlert';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RoleGuardProps {
  children: ReactNode;
  allowAdmin?: boolean;
  allowProvider?: boolean;
  allowSeller?: boolean;
  renderFallback?: ReactNode;
}

export default function RoleGuard({
  children,
  allowAdmin = false,
  allowProvider = false,
  allowSeller = false,
  renderFallback = null,
}: RoleGuardProps): ReactElement {
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  // Enquanto carrega, exibe tela de loading
  if (loading) {
    return <LoadingState message="Verificando permissões…" />;
  }

  // Se não estiver logado, força login
  if (!profile) {
    const fallback = renderFallback ?? (
      <RestrictedAccessAlert
        message="Faça login para acessar."
        buttonText="Entrar"
        onButtonClick={() => router.push('/login')}
      />
    );
    return <>{fallback}</>;
  }

  const key = profile.subscription_plans.key;
  const active = profile.plan_active;

  // Define os papéis apenas via key do plano
  const isAdmin    = !!profile.is_admin;
  const isSeller   = ['seller', 'full'].includes(key);
  const isProvider = ['provider', 'full'].includes(key);

  // Bloqueia acesso a rotas de seller/provider se o plano está inativo
  if (!active && (allowSeller || allowProvider)) {
    const fallback = renderFallback ?? (
      <RestrictedAccessAlert
        message="Seu plano expirou ou está inativo."
        buttonText="Ver Planos"
        onButtonClick={() => router.push('/planos')}
      />
    );
    return <>{fallback}</>;
  }

  // Verifica se tem permissão para entrar
  const hasAccess =
    (allowAdmin    && isAdmin)    ||
    (allowSeller   && isSeller)   ||
    (allowProvider && isProvider);

  if (!hasAccess) {
    const fallback = renderFallback ?? (
      <RestrictedAccessAlert
        message="Área restrita. Assine o plano adequado."
        buttonText="Ver Planos"
        onButtonClick={() => router.push('/planos')}
      />
    );
    return <>{fallback}</>;
  }

  // Se passou em todas as validações, renderiza as children
  return <>{children}</>;
}
