'use client';

import Link from 'next/link';
import { ApiNotice, EmptyState } from '@/components/ui/States';
import { DataTable } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icons';
import type { ActivityEvent, ArtifactRecord, BlockchainEvidence, DashboardMetrics } from '@/lib/types';
import { displayValue, formatCount, formatDate, shortHash } from '@/lib/utils/format';

const stats: Array<{ key: keyof DashboardMetrics; label: string; icon: IconName; tone?: string }> = [
  { key: 'totalArtifacts', label: 'Total artifacts', icon: 'layers' },
  { key: 'trustedOrVerified', label: 'Trusted / verified', icon: 'shield', tone: 'green' },
  { key: 'selfAsserted', label: 'Self-asserted', icon: 'document', tone: 'amber' },
  { key: 'unverifiable', label: 'Unverifiable', icon: 'alert', tone: 'amber' },
  { key: 'tamperedOrConflict', label: 'Tampered / conflict', icon: 'close', tone: 'red' },
];

export function DashboardPage() {
  const state = useDashboard();
  const data = state.data;
  const metrics = data?.metrics ?? {};
  const recentArtifacts = data?.recentArtifacts ?? [];
  const verificationActivity = data?.recentVerificationActivity ?? [];
  const blockchainActivity = data?.blockchainActivity ?? [];
  const provenanceActivity = data?.provenanceActivity ?? [];
  const percentage = typeof metrics.verifiedPercentage === 'number' && Number.isFinite(metrics.verifiedPercentage)
    ? Math.max(0, Math.min(100, metrics.verifiedPercentage)) : undefined;

  return <>
    <PageHeader
      eyebrow="Workspace overview"
      title="Provenance at a glance"
      description="Track artifact integrity, attribution, and chain-of-custody across your workspace."
      actions={<>
        <Link className="btn" href="/verification"><Icon name="shield" size={14} />Verify artifact</Link>
        <Button variant="primary" type="button" disabled title="Artifact registration becomes available after its FastAPI action and schema are documented."><Icon name="plus" size={14} />Register artifact</Button>
      </>}
    />
    <ApiNotice state={state} resource="dashboard" />

    <section className="metric-grid dashboard-metrics" aria-label="Artifact integrity metrics">
      {stats.map((item) => <article className="metric-card" key={item.key}>
        <div className="metric-top"><span className="metric-label">{item.label}</span><span className={`metric-mark ${item.tone ?? ''}`}><Icon name={item.icon} size={13} /></span></div>
        <div className="metric-value">{state.loading ? <span className="metric-skeleton" aria-label="Loading" /> : formatCount(metrics[item.key] as number | undefined)}</div>
        <div className="metric-note">{metrics[item.key] === undefined ? 'Waiting for backend data' : 'Reported by backend'}</div>
      </article>)}
    </section>

    <div className="dashboard-main-grid">
      <Card title="Recent artifacts" subtitle="Latest registered files and their returned trust state" action={<Link className="panel-action" href="/artifacts">Open registry <Icon name="arrow" size={12} /></Link>}>
        {recentArtifacts.length ? <DataTable
          minWidth={640}
          columns={[{ key: 'artifact', label: 'ARTIFACT' }, { key: 'type', label: 'TYPE' }, { key: 'trust', label: 'TRUST STATUS' }, { key: 'created', label: 'CREATED' }]}
          rows={recentArtifacts.slice(0, 5).map((item) => ({
            id: item.artifactId,
            cells: [<ArtifactName item={item} key="artifact" />, displayValue(item.mediaType), <StatusBadge value={item.integrityStatus || item.verificationStatus} key="trust" />, <span className="date" key="created">{formatDate(item.createdAt)}</span>],
          }))}
          emptyMessage="No artifact records were returned by the backend."
        /> : <div className="panel-body"><EmptyState title="No recent artifacts returned" description="This panel will populate from the documented dashboard response. No sample records are displayed." /></div>}
      </Card>

      <Card title="Verification overview" subtitle="Evidence strength reported for this workspace" action={<Link className="panel-action" href="/verification">Open verify <Icon name="arrow" size={12} /></Link>}>
        <div className="verification-overview">
          <div className={`trust-donut${percentage === undefined ? ' is-empty' : ''}`} style={percentage === undefined ? undefined : { background: `conic-gradient(#5d9473 ${percentage}%, #d7b184 ${percentage}% 100%)` }}>
            <div><strong>{percentage === undefined ? '—' : `${percentage.toFixed(1)}%`}</strong><span>verified</span></div>
          </div>
          <div className="trust-legend">
            <LegendRow tone="green" label="Trusted / verified" value={metrics.trustedOrVerified} />
            <LegendRow tone="amber" label="Self-asserted" value={metrics.selfAsserted} />
            <LegendRow tone="gray" label="Unverifiable" value={metrics.unverifiable} />
            <LegendRow tone="red" label="Tampered / conflict" value={metrics.tamperedOrConflict} />
          </div>
        </div>
        <div className="overview-note"><Icon name="info" size={13} /><span>Results appear here only when supplied by the FastAPI backend.</span></div>
      </Card>
    </div>

    <div className="dashboard-streams">
      <Card title="Recent verification activity" subtitle="Latest checks and trust decisions" action={<Link className="panel-action" href="/activity">View activity <Icon name="arrow" size={12} /></Link>}>
        <ActivityStream events={verificationActivity} emptyTitle="No verification activity returned" emptyDescription="Verification events will appear here when included in the backend response." />
      </Card>
      <Card title="Blockchain activity" subtitle="Ledger records returned by the backend; no network is assumed" action={<Link className="panel-action" href="/activity">View ledger events <Icon name="arrow" size={12} /></Link>}>
        <BlockchainStream events={blockchainActivity} />
      </Card>
      <Card title="Provenance activity" subtitle="Creation and transformation events returned for this workspace" action={<Link className="panel-action" href="/provenance">Explore provenance <Icon name="arrow" size={12} /></Link>}>
        <ActivityStream events={provenanceActivity} emptyTitle="No provenance activity returned" emptyDescription="A provenance timeline is shown only when the backend returns linked events." />
      </Card>
    </div>
  </>;
}

function ArtifactName({ item }: { item: ArtifactRecord }) {
  const media = item.mediaType?.toLowerCase() ?? '';
  const icon = media.includes('image') ? 'image' : media.includes('video') ? 'video' : 'document';
  return <span className="artifact-cell"><span className="file-thumb"><Icon name={icon} size={15} /></span><span className="artifact-cell-copy"><Link className="row-link" href={`/artifacts/${encodeURIComponent(item.artifactId)}`}>{item.name}</Link><small className="mono">{item.artifactId}</small></span></span>;
}

function LegendRow({ tone, label, value }: { tone: string; label: string; value?: number }) {
  return <div className="trust-legend-row"><span className={`legend-dot ${tone}`} /><span>{label}</span><strong>{formatCount(value)}</strong></div>;
}

function ActivityStream({ events, emptyTitle, emptyDescription }: { events: ActivityEvent[]; emptyTitle: string; emptyDescription: string }) {
  if (!events.length) return <div className="panel-body"><EmptyState title={emptyTitle} description={emptyDescription} /></div>;
  return <div className="activity-stream">{events.slice(0, 8).map((event) => <div className="activity-stream-row" key={event.eventId}>
    <span className="activity-marker"><Icon name={event.evidenceType?.toLowerCase() === 'ai' ? 'spark' : 'check'} size={13} /></span>
    <span className="activity-stream-copy"><strong>{displayValue(event.summary)}</strong><small>{[event.modelId, event.version, event.actor].filter(Boolean).join(' · ') || displayValue(event.type)}</small></span>
    <time>{formatDate(event.occurredAt)}</time>
  </div>)}</div>;
}

function BlockchainStream({ events }: { events: BlockchainEvidence[] }) {
  if (!events.length) return <div className="panel-body"><EmptyState title="No ledger events returned" description="Network names, transaction hashes, and block details are never guessed or queried directly by this frontend." /></div>;
  return <div className="ledger-stream">{events.slice(0, 6).map((event, index) => <div className="ledger-stream-row" key={`${event.transactionHash ?? 'ledger'}-${index}`}>
    <span className="ledger-dot"><Icon name="layers" size={13} /></span>
    <span className="ledger-stream-copy"><strong>{displayValue(event.transactionStatus || event.verificationResult)}</strong><small>{[event.network, event.block !== undefined ? `Block ${event.block}` : '', event.contract].filter(Boolean).join(' · ') || 'Ledger metadata not supplied'}</small></span>
    <span className="mono hash">{shortHash(event.transactionHash)}</span><time>{formatDate(event.timestamp)}</time>
  </div>)}</div>;
}
