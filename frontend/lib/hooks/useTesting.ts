'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { TestingPayload } from '@/lib/types';

export function useTesting() {
  return useApi<TestingPayload>('testing');
}
