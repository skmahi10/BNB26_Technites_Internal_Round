'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ProvenanceGraph } from '@/lib/types';

export function useProvenance(params?: Record<string, string>) {
  return useApi<ProvenanceGraph>('provenance', params);
}
