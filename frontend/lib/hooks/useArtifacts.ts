'use client';

import { useApi } from '@/lib/hooks/useApi';
import type { ArtifactRecord, ListPayload } from '@/lib/types';

export function useArtifacts() {
  return useApi<ListPayload<ArtifactRecord>>('artifacts');
}
