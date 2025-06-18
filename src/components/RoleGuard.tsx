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

  const { subscription_plan, plan_active, is_admin } = profile;
  const key = subscription_plan.key;
  const isProvider = ['provider', 'full'].includes(key);
  const isSeller   = ['seller',   'full'].includes(key);

  // 1) Se for admin e permitimos admin, libera de cara:
  if (allowAdmin && is_admin) {
    return <>{children}</>;
  }

  // 2) Bloqueia providers/sellers inativos (admins já liberados acima)
  if (!plan_active && (allowProvider || allowSeller)) {
    const fallback = renderFallback ?? (
      <RestrictedAccessAlert
        message="Seu plano expirou ou está inativo."
        buttonText="Ver Planos"
        onButtonClick={() => router.push('/planos')}
      />
    );
    return <>{fallback}</>;
  }

  // 3) Checa acesso restante (provider ou seller)
  const hasProviderAccess = allowProvider && isProvider;
  const hasSellerAccess   = allowSeller   && isSeller;
  if (hasProviderAccess || hasSellerAccess) {
    return <>{children}</>;
  }

  // 4) Se chegou aqui, não tem acesso
  const fallback = renderFallback ?? (
    <RestrictedAccessAlert
      message="Área restrita. Assine o plano adequado."
      buttonText="Ver Planos"
      onButtonClick={() => router.push('/planos')}
    />
  );
  return <>{fallback}</>;
}
