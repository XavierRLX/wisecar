// components/RoleGuard.tsx
'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import LoadingState from './LoadingState';
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
}: RoleGuardProps) {
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  if (loading) {
    return <LoadingState message="Verificando permissões…" />;
  }
  if (!profile) {
    router.push('/login');
    return null;
  }

  // pega a key do plano
  const planKey = profile.subscription_plans.key;
  const isSellerPlan   = planKey === 'seller'   || planKey === 'full';
  const isProviderPlan = planKey === 'provider' || planKey === 'full';
  const isAdmin        = !!profile.is_admin;

  const hasAccess =
    (allowAdmin    && isAdmin)        ||
    (allowProvider && isProviderPlan) ||
    (allowSeller   && isSellerPlan);

  if (!hasAccess) {
    if (renderFallback) {
      return <>{renderFallback}</>;
    }
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
