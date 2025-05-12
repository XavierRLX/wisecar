// app/manutencoes/page.tsx
import { Suspense } from 'react';
import LoadingState from '@/components/LoadingState';
import AllMaintenanceClient from './AllMaintenanceClient';

export default function AllMaintenancePage() {
  return (
    <Suspense fallback={<LoadingState message="Carregando manutenções…" />}>
      <AllMaintenanceClient />
    </Suspense>
  );
}
