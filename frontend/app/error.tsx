'use client';

import { useEffect } from 'react';
import { Icon } from '@/components/ui/Icons';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Orivyn frontend error', error); }, [error]);
  return <section className="state-panel error" role="alert"><span className="state-icon"><Icon name="warning" size={16} /></span><div className="state-copy"><strong>This view could not be rendered</strong><p>Retry the page. If the problem continues, check the browser console and the backend response shape.</p></div><button className="btn btn-sm" type="button" onClick={reset}><Icon name="refresh" size={13} />Try again</button></section>;
}
