'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ActivityEvent, ListPayload } from '@/lib/types';

export function useActivity() {
  return useApi<ListPayload<ActivityEvent>>('activity');
}
