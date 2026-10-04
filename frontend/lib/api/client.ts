import type { ApiResourceKey } from '@/lib/types';

const endpointConfig: Record<ApiResourceKey, { path: string | undefined; envName: string }> = {
  dashboard: { path: process.env.NEXT_PUBLIC_API_DASHBOARD_PATH, envName: 'NEXT_PUBLIC_API_DASHBOARD_PATH' },
  models: { path: process.env.NEXT_PUBLIC_API_MODELS_PATH, envName: 'NEXT_PUBLIC_API_MODELS_PATH' },
  modelDetail: { path: process.env.NEXT_PUBLIC_API_MODEL_DETAIL_PATH, envName: 'NEXT_PUBLIC_API_MODEL_DETAIL_PATH' },
  artifacts: { path: process.env.NEXT_PUBLIC_API_ARTIFACTS_PATH, envName: 'NEXT_PUBLIC_API_ARTIFACTS_PATH' },
  artifactDetail: { path: process.env.NEXT_PUBLIC_API_ARTIFACT_DETAIL_PATH, envName: 'NEXT_PUBLIC_API_ARTIFACT_DETAIL_PATH' },
  verifications: { path: process.env.NEXT_PUBLIC_API_VERIFICATIONS_PATH, envName: 'NEXT_PUBLIC_API_VERIFICATIONS_PATH' },
  provenance: { path: process.env.NEXT_PUBLIC_API_PROVENANCE_PATH, envName: 'NEXT_PUBLIC_API_PROVENANCE_PATH' },
  testing: { path: process.env.NEXT_PUBLIC_API_TESTING_PATH, envName: 'NEXT_PUBLIC_API_TESTING_PATH' },
  lifecycle: { path: process.env.NEXT_PUBLIC_API_LIFECYCLE_PATH, envName: 'NEXT_PUBLIC_API_LIFECYCLE_PATH' },
  history: { path: process.env.NEXT_PUBLIC_API_HISTORY_PATH, envName: 'NEXT_PUBLIC_API_HISTORY_PATH' },
  activity: { path: process.env.NEXT_PUBLIC_API_ACTIVITY_PATH, envName: 'NEXT_PUBLIC_API_ACTIVITY_PATH' },
};

export class ApiConfigurationError extends Error {
  readonly kind = 'configuration';
  constructor(message: string) {
    super(message);
    this.name = 'ApiConfigurationError';
  }
}

export class ApiRequestError extends Error {
  readonly kind = 'request';
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

function replacePathParams(template: string, params: Record<string, string> = {}): string {
  return template.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = params[key];
    if (value === undefined || value.length === 0) {
      throw new ApiConfigurationError(`The configured endpoint requires the path parameter "${key}".`);
    }
    return encodeURIComponent(value);
  });
}

export function configuredEndpoint(resource: ApiResourceKey, params: Record<string, string> = {}): string {
  const { path, envName } = endpointConfig[resource];
  if (!path?.trim()) {
    throw new ApiConfigurationError(`Set ${envName} to the endpoint documented for this resource.`);
  }

  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  const browserBase = typeof window !== 'undefined' ? window.location.origin : '';
  const resolvedBase = base || browserBase;
  if (!resolvedBase) {
    throw new ApiConfigurationError('Set NEXT_PUBLIC_API_BASE_URL, or use a same-origin API reverse proxy.');
  }

  let url: URL;
  try {
    const normalizedPath = replacePathParams(path.trim(), params);
    url = new URL(normalizedPath, resolvedBase.endsWith('/') ? resolvedBase : `${resolvedBase}/`);
  } catch (error) {
    if (error instanceof ApiConfigurationError) throw error;
    throw new ApiConfigurationError('The configured API base URL or resource path is not a valid URL.');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new ApiConfigurationError('The API base URL must use HTTP or HTTPS.');
  }
  return url.toString();
}

export async function requestJson<T>(
  resource: ApiResourceKey,
  options: { params?: Record<string, string>; signal?: AbortSignal } = {},
): Promise<T> {
  const url = configuredEndpoint(resource, options.params);
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
      signal: options.signal,
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new ApiRequestError('Could not reach the configured FastAPI endpoint. Check the service and CORS settings.');
  }

  if (!response.ok) {
    const statusMessage = response.status === 401 || response.status === 403
      ? 'The backend did not authorize this request. Check the signed-in session.'
      : `The backend returned HTTP ${response.status}.`;
    throw new ApiRequestError(statusMessage, response.status);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new ApiRequestError('The backend response was not valid JSON.');
  }
}

export function listFromPayload<T>(payload: unknown): { items: T[]; total?: number } | null {
  if (Array.isArray(payload)) return { items: payload as T[] };
  if (payload && typeof payload === 'object' && Array.isArray((payload as { items?: unknown }).items)) {
    const candidate = payload as { items: T[]; total?: number };
    return { items: candidate.items, total: candidate.total };
  }
  return null;
}
