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

  if (loading) {
    return <LoadingState message="Verificando permissões…" />;
  }
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
  const isAdmin    = !!profile.is_admin;
  const isSeller   = profile.is_seller  || key === 'seller'   || key === 'full';
  const isProvider = profile.is_provider|| key === 'provider' || key === 'full';

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

  return <>{children}</>;
}
