'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { DashboardPayload } from '@/lib/types';

export function useDashboard() {
  return useApi<DashboardPayload>('dashboard');
}
