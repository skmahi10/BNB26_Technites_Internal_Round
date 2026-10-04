import Link from 'next/link';
import { Icon } from '@/components/ui/Icons';

export default function NotFound() {
  return <section className="state-panel"><span className="state-icon"><Icon name="empty" size={16} /></span><div className="state-copy"><strong>Page not found</strong><p>This ModelLedger view does not exist.</p><Link className="row-link" href="/dashboard">Return to dashboard</Link></div></section>;
}
