import type { EvidenceItem as EvidenceRecord } from '@/lib/types';
import { displayValue } from '@/lib/utils/format';
import { Icon } from '@/components/ui/Icons';

function tone(status?: string): 'warn' | 'fail' | '' {
  const value = (status ?? '').toLowerCase();
  if (value.includes('fail') || value.includes('conflict') || value.includes('mismatch') || value.includes('tamper')) return 'fail';
  if (value.includes('pending') || value.includes('unknown') || value.includes('warn') || value.includes('missing')) return 'warn';
  return '';
}

function groupsFor(evidence: EvidenceRecord[]) {
  return [
    { key: 'trust', title: 'Trust / cryptographic evidence', items: evidence.filter((item) => ['trust', 'blockchain', 'cryptographic', 'ledger'].includes(item.type.toLowerCase())) },
    { key: 'provenance', title: 'Provenance evidence', items: evidence.filter((item) => item.type.toLowerCase() === 'provenance') },
    { key: 'ai', title: 'AI supporting analysis · not proof', items: evidence.filter((item) => item.type.toLowerCase() === 'ai') },
  ].filter((group) => group.items.length);
}

export function EvidenceItem({ item }: { item: EvidenceRecord }) {
  const itemTone = tone(item.status);
  return <div className="evidence-row">
    <span className={`evidence-row-icon ${itemTone}`}><Icon name={itemTone === 'fail' ? 'warning' : 'check'} size={12} /></span>
    <span className="evidence-row-copy"><strong>{item.label}</strong><span>{item.description || displayValue(item.value)}</span></span>
    <span className="evidence-source">{displayValue(item.status)}</span>
  </div>;
}

export function EvidenceGroups({ evidence }: { evidence?: EvidenceRecord[] }) {
  const groups = groupsFor(evidence ?? []);
  if (!groups.length) return <div className="table-empty">No evidence details were returned.</div>;
  return <div>{groups.map((group) => <section className={`evidence-section${group.key === 'ai' ? ' ai' : ''}`} key={group.key}>
    <div className="evidence-section-title">{group.title}</div>
    {group.items.map((item, index) => <EvidenceItem key={`${item.label}-${index}`} item={item} />)}
  </section>)}</div>;
}

export function EvidenceDisclosure({ evidence }: { evidence?: EvidenceRecord[] }) {
  const groups = groupsFor(evidence ?? []);
  if (!groups.length) return <span className="muted">No evidence details returned</span>;
  const count = groups.reduce((sum, group) => sum + group.items.length, 0);
  return <details className="evidence-disclosure">
    <summary className="row-link">{count} evidence items</summary>
    <div className="evidence-disclosure-body">{groups.map((group) => <section className={`evidence-section${group.key === 'ai' ? ' ai' : ''}`} key={group.key}>
      <div className="evidence-section-title">{group.title}</div>
      {group.items.map((item, index) => <EvidenceItem key={`${item.label}-${index}`} item={item} />)}
    </section>)}</div>
  </details>;
}
