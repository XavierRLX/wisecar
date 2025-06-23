//components/RoleGuard.tsx
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

  // Enquanto carrega perfil
  if (loading) {
    return <LoadingState message="Verificando permissões…" />;
  }

  // Se não autenticado
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

  // Extrai o “baseKey” (seller, provider ou full) de chaves como "seller_plus"
  const rawKey = subscription_plan.key ?? '';
  const baseKey = rawKey.split('_')[0]; // ex: "provider_basic" -> "provider"
  const isProvider = baseKey === 'provider' || baseKey === 'full';
  const isSeller   = baseKey === 'seller'   || baseKey === 'full';

  // Admin sempre liberado, se permitir
  if (allowAdmin && is_admin) {
    return <>{children}</>;
  }

  // Bloqueia providers/sellers inativos (exceto admin)
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

  // Valida acesso por papel
  const hasProviderAccess = allowProvider && isProvider;
  const hasSellerAccess   = allowSeller   && isSeller;
  if (hasProviderAccess || hasSellerAccess) {
    return <>{children}</>;
  }

  // Sem permissão
  const fallback = renderFallback ?? (
    <RestrictedAccessAlert
      message="Área restrita. Assine o plano adequado."
      buttonText="Ver Planos"
      onButtonClick={() => router.push('/planos')}
    />
  );
  return <>{fallback}</>;
}
