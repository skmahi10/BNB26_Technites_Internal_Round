import type { ReactNode } from 'react';
import { ApiConfigurationError, ApiRequestError } from '@/lib/api/client';
import type { ApiState } from '@/lib/hooks/useApi';
import { Icon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';

export function ResourceBoundary<T>({
  state,
  children,
  loadingLabel = 'Loading backend data',
}: {
  state: ApiState<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
}) {
  if (state.loading) {
    return <div className="panel" aria-busy="true" aria-label={loadingLabel}><div className="panel-body"><div className="loading-grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div></div></div>;
  }
  if (state.error) {
    const configuration = state.error instanceof ApiConfigurationError;
    const request = state.error instanceof ApiRequestError;
    return <div className={`state-panel ${configuration ? 'setup' : 'error'}`} role="alert">
      <span className="state-icon"><Icon name={configuration ? 'info' : 'warning'} size={16} /></span>
      <div className="state-copy">
        <strong>{configuration ? 'Backend endpoint not configured' : 'Backend data could not be loaded'}</strong>
        <p>{state.error.message}</p>
        {configuration ? <p>Copy <code>.env.example</code> to <code>.env.local</code> and use the exact endpoint path from the backend contract. No sample records are shown.</p> : null}
        {request ? <p>Check the FastAPI service, session, response schema, and CORS policy, then retry.</p> : null}
      </div>
      <Button className="retry-btn" size="sm" type="button" icon={<Icon name="refresh" size={13} />} onClick={state.reload}>Retry</Button>
    </div>;
  }
  if (state.data === null) return <EmptyState title="No response data" description="The backend returned an empty response." />;
  return <>{children(state.data)}</>;
}

export function ApiNotice<T>({ state, resource }: { state: ApiState<T>; resource: string }) {
  if (state.loading) return <div className="api-notice is-loading" role="status"><span className="notice-mark"><Icon name="database" size={14} /></span><span>Connecting to the configured FastAPI {resource} endpoint…</span></div>;
  if (!state.error) return null;

  const configuration = state.error instanceof ApiConfigurationError;
  const description = configuration
    ? `Configure the documented ${resource} path in .env.local. No sample data is being shown.`
    : state.error.message;

  return <div className={`api-notice ${configuration ? 'is-setup' : 'is-error'}`} role="alert">
    <span className="notice-mark"><Icon name={configuration ? 'info' : 'warning'} size={14} /></span>
    <span className="notice-copy"><strong>{configuration ? 'Backend endpoint not configured' : 'Backend data unavailable'}</strong><span>{description}</span></span>
    <Button className="notice-retry" size="sm" type="button" icon={<Icon name="refresh" size={12} />} onClick={state.reload}>Retry</Button>
  </div>;
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="state-panel"><span className="state-icon"><Icon name="empty" size={16} /></span><div className="state-copy"><strong>{title}</strong><p>{description}</p></div></div>;
}
