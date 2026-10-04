'use client';

import { useEffect, useState } from 'react';
import { requestJson } from '@/lib/api/client';
import type { ApiResourceKey } from '@/lib/types';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

interface StoredState<T> { requestKey: string; data: T | null; error: Error | null; }

export function useApi<T>(resource: ApiResourceKey, params?: Record<string, string>): ApiState<T> {
  const [stored, setStored] = useState<StoredState<T>>({ requestKey: '', data: null, error: null });
  const [revision, setRevision] = useState(0);
  const serializedParams = JSON.stringify(params ?? {});
  const requestKey = `${resource}:${serializedParams}:${revision}`;

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    requestJson<T>(resource, { params: JSON.parse(serializedParams) as Record<string, string>, signal: controller.signal })
      .then((result) => { if (active) setStored({ requestKey, data: result, error: null }); })
      .catch((cause: unknown) => {
        if (!active || controller.signal.aborted) return;
        setStored({ requestKey, data: null, error: cause instanceof Error ? cause : new Error('The backend request failed.') });
      });
    return () => { active = false; controller.abort(); };
  }, [resource, serializedParams, requestKey]);

  const isCurrent = stored.requestKey === requestKey;
  return {
    data: isCurrent ? stored.data : null,
    loading: !isCurrent,
    error: isCurrent ? stored.error : null,
    reload: () => setRevision((current) => current + 1),
  };
}

export const useApiResource = useApi;
