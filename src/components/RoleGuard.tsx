// components/RoleGuard.tsx
"use client";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "./LoadingState";
import { useUserProfile } from "@/hooks/useUserProfile";

interface RoleGuardProps {
  children: ReactNode;
  allowAdmin?: boolean;
  allowProvider?: boolean;
  allowSeller?: boolean;
  /** Se true, em vez de redirecionar, exibe um fallback (ex.: RestrictedAccessAlert). */
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

  if (loading) return <LoadingState message="Verificando permissões…" />;
  if (!profile) {
    router.push("/login");
    return null;
  }

  const hasAccess =
    (allowAdmin && profile.is_admin) ||
    (allowProvider && profile.is_provider) ||
    (allowSeller && profile.is_seller);

  if (!hasAccess) {
    if (renderFallback) {
      return <>{renderFallback}</>;
    }
    router.push("/");
    return null;
  }

  return <>{children}</>;
}
