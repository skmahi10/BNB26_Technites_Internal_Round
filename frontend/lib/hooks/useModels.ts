'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ListPayload, ModelRecord } from '@/lib/types';

export function useModels() {
  return useApi<ListPayload<ModelRecord>>('models');
}
