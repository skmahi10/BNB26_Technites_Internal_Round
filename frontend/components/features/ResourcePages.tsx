'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ApiNotice, EmptyState, ResourceBoundary } from '@/components/ui/States';
import { Card } from '@/components/ui/Card';
import { EvidenceGroups } from '@/components/ui/EvidenceItem';
import { Button } from '@/components/ui/Button';
import type { ApiState } from '@/lib/hooks/useApi';
import { useApi } from '@/lib/hooks/useApi';
import { useActivity } from '@/lib/hooks/useActivity';
import { useArtifacts } from '@/lib/hooks/useArtifacts';
import { useModels } from '@/lib/hooks/useModels';
import { useProvenance } from '@/lib/hooks/useProvenance';
import { useTesting } from '@/lib/hooks/useTesting';
import { Icon, type IconName } from '@/components/ui/Icons';
import { listFromPayload } from '@/lib/api/client';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProvenanceExplorer } from '@/components/ui/ProvenanceExplorer';
import { RiskChart } from '@/components/ui/RiskChart';
import { StatusBadge } from '@/components/ui/Badge';
import type {
  ActivityEvent, ApiResourceKey, ArtifactRecord, LifecycleEvent,
  ModelRecord, TestingRecord, VerificationRecord, VersionHistoryEvent,
} from '@/lib/types';
import { displayValue, formatCount, formatDate, shortHash } from '@/lib/utils/format';
import { statusClass } from '@/lib/utils/status';

interface TableColumn<T> { key: string; label: string; render: (record: T) => ReactNode; }

function ResponseShapeError({ resource }: { resource: string }) {
  return <div className="state-panel error" role="alert"><span className="state-icon"><Icon name="warning" size={16} /></span><div className="state-copy"><strong>Backend response needs an adapter</strong><p>The configured {resource} endpoint returned a JSON shape that this view cannot display. Map its documented response to the frontend view type in <code>lib/types/index.ts</code> and <code>lib/api/client.ts</code>; the backend contract is not changed here.</p></div></div>;
}

function RecordTable<T>({
  records,
  total,
  columns,
  getId,
  searchText,
  getStatus,
  emptyMessage,
  minWidth = 760,
  initialSearch = '',
  sortValue,
}: {
  records: T[];
  total?: number;
  columns: TableColumn<T>[];
  getId: (record: T) => string;
  searchText: (record: T) => string;
  getStatus?: (record: T) => string | undefined;
  emptyMessage: string;
  minWidth?: number;
  initialSearch?: string;
  sortValue?: (record: T) => string | number | undefined;
}) {
  const [query, setQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const statusOptions = useMemo(() => [...new Set(records.map((record) => getStatus?.(record)).filter((value): value is string => Boolean(value)))], [records, getStatus]);
  const filtered = useMemo(() => records.filter((record) => {
    const matchesQuery = !query.trim() || searchText(record).toLowerCase().includes(query.trim().toLowerCase());
    const statusValue = getStatus?.(record);
    const matchesStatus = statusFilter === 'all' || statusValue?.toLowerCase() === statusFilter.toLowerCase();
    return matchesQuery && matchesStatus;
  }), [records, query, statusFilter, searchText, getStatus]);
  const ordered = useMemo(() => {
    if (!sortValue) return filtered;
    return [...filtered].sort((left, right) => {
      const a = sortValue(left);
      const b = sortValue(right);
      const comparison = typeof a === 'number' && typeof b === 'number'
        ? (Number.isFinite(a) ? a : 0) - (Number.isFinite(b) ? b : 0)
        : String(a ?? '').localeCompare(String(b ?? ''));
      return sortOrder === 'newest' ? -comparison : comparison;
    });
  }, [filtered, sortValue, sortOrder]);

  return (
    <>
      <div className="table-toolbar">
        <div className="toolbar-left">
          {getStatus ? <>
            <button type="button" className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>All<span className="filter-count">{records.length}</span></button>
            {statusOptions.map((value) => <button type="button" key={value} className={`filter-pill ${statusFilter === value ? 'active' : ''}`} onClick={() => setStatusFilter(value)}>{value}<span className="filter-count">{records.filter((record) => getStatus(record) === value).length}</span></button>)}
          </> : <span className="section-label">Backend records</span>}
        </div>
        <div className="toolbar-right">
          <label className="input-wrap"><Icon name="search" size={13} /><input className="text-input" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search files, models, hashes…" aria-label="Filter loaded records" /></label>
          {sortValue ? <label className="sort-control"><span className="sr-only">Sort records</span><select className="select-input" value={sortOrder} onChange={(event) => setSortOrder(event.target.value as 'newest' | 'oldest')}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select></label> : null}
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table" style={{ minWidth }}>
          <thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
          <tbody>
            {ordered.length ? ordered.map((record) => <tr key={getId(record)}>{columns.map((column) => <td key={`${getId(record)}-${column.key}`}>{column.render(record)}</td>)}</tr>) : <tr><td colSpan={columns.length} className="table-empty">{records.length ? 'No loaded records match these filters.' : emptyMessage}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="table-footer"><span>Showing {ordered.length} loaded records{total !== undefined ? ` · backend total ${total}` : ''}</span><span>Backend records only</span></div>
    </>
  );
}

function ListPage<T>({
  resource,
  state,
  title,
  eyebrow,
  description,
  columns,
  getId,
  searchText,
  getStatus,
  emptyMessage,
  minWidth,
  initialSearch,
}: {
  resource: ApiResourceKey;
  state: ApiState<unknown>;
  title: string;
  eyebrow: string;
  description: string;
  columns: TableColumn<T>[];
  getId: (record: T) => string;
  searchText: (record: T) => string;
  getStatus?: (record: T) => string | undefined;
  emptyMessage: string;
  minWidth?: number;
  initialSearch?: string;
}) {
  return <>
    <PageHeader eyebrow={eyebrow} title={title} description={description} />
    <ResourceBoundary state={state} loadingLabel={`Loading ${title.toLowerCase()} from backend`}>
      {(payload) => {
        const parsed = listFromPayload<T>(payload);
        if (!parsed) return <ResponseShapeError resource={resource} />;
        return <Card title={title} subtitle="Returned records are preserved as history; no client-side result is fabricated.">
          <RecordTable records={parsed.items} total={parsed.total} columns={columns} getId={getId} searchText={searchText} getStatus={getStatus} emptyMessage={emptyMessage} minWidth={minWidth} initialSearch={initialSearch} />
        </Card>;
      }}
    </ResourceBoundary>
  </>;
}

const modelHref = (id: string) => `/models/${encodeURIComponent(id)}`;
const artifactHref = (id: string) => `/artifacts/${encodeURIComponent(id)}`;

export function ModelsPage({ initialSearch = '' }: { initialSearch?: string }) {
  const state = useModels();
  const columns: TableColumn<ModelRecord>[] = [
    { key: 'name', label: 'MODEL', render: (item) => <Link className="row-link" href={modelHref(item.modelId)}>{item.name || item.modelId}</Link> },
    { key: 'id', label: 'MODEL ID', render: (item) => <span className="mono">{item.modelId}</span> },
    { key: 'owner', label: 'CREATOR / OWNER', render: (item) => displayValue(item.creator || item.owner) },
    { key: 'version', label: 'CURRENT VERSION', render: (item) => displayValue(item.currentVersion) },
    { key: 'hash', label: 'MODEL HASH', render: (item) => <span className="mono hash" title={item.modelHash}>{shortHash(item.modelHash)}</span> },
    { key: 'trust', label: 'TRUST', render: (item) => <StatusBadge value={item.verificationStatus || item.integrityStatus} /> },
    { key: 'lifecycle', label: 'LIFECYCLE', render: (item) => <StatusBadge value={item.lifecycleStatus} /> },
    { key: 'registered', label: 'REGISTERED', render: (item) => <span className="date">{formatDate(item.registeredAt)}</span> },
  ];
  return <ListPage<ModelRecord> state={state} resource="models" eyebrow="Trust · model registry" title="Models" description="Model identity, ownership, immutable version history, trust state, and linked evidence—displayed from backend records." columns={columns} getId={(item) => item.modelId} searchText={(item) => [item.modelId, item.name, item.creator, item.owner, item.currentVersion, item.modelHash].filter(Boolean).join(' ')} getStatus={(item) => item.verificationStatus || item.integrityStatus} emptyMessage="No models were returned by the backend." minWidth={1180} initialSearch={initialSearch} />;
}

export function ArtifactsPage({ initialSearch = '' }: { initialSearch?: string }) {
  const state = useArtifacts();
  const parsed = state.data !== null ? listFromPayload<ArtifactRecord>(state.data) : null;
  const records = parsed?.items ?? [];
  const countBy = (kind: string) => parsed ? records.filter((item) => statusClass(item.integrityStatus || item.verificationStatus) === kind).length : undefined;
  const summary = [
    { label: 'Registry coverage', icon: 'layers' as const, value: parsed ? parsed.total ?? records.length : undefined, note: parsed?.total !== undefined ? 'Backend total' : 'Records in response' },
    { label: 'Verified / trusted', icon: 'shield' as const, value: countBy('verified'), note: 'Among returned records', tone: 'green' },
    { label: 'Needs review', icon: 'alert' as const, value: countBy('pending') === undefined ? undefined : (countBy('pending') ?? 0) + (countBy('unverifiable') ?? 0), note: 'Among returned records', tone: 'amber' },
    { label: 'Conflicts detected', icon: 'close' as const, value: countBy('conflict'), note: 'Among returned records', tone: 'red' },
  ];
  const columns: TableColumn<ArtifactRecord>[] = [
    { key: 'artifact', label: 'ARTIFACT', render: (item) => <ArtifactRegistryCell item={item} /> },
    { key: 'type', label: 'TYPE', render: (item) => <span className="type-label"><Icon name={mediaIcon(item.mediaType)} size={13} />{displayValue(item.mediaType)}</span> },
    { key: 'model', label: 'CLAIMED MODEL', render: (item) => item.modelId ? <Link className="row-link" href={modelHref(item.modelId)}>{item.modelId}{item.modelVersion ? ` · ${item.modelVersion}` : ''}</Link> : '—' },
    { key: 'status', label: 'TRUST STATUS', render: (item) => <StatusBadge value={item.integrityStatus || item.verificationStatus} /> },
    { key: 'hash', label: 'SHA-256 HASH', render: (item) => <span className="mono hash" title={item.hash}>{shortHash(item.hash)}</span> },
    { key: 'created', label: 'CREATED', render: (item) => <span className="date">{formatDate(item.createdAt)}</span> },
  ];

  return <>
    <PageHeader eyebrow="Registry · evidence records" title="Artifact registry" description="Every registered file, its claimed model, and the evidence returned to support or challenge its provenance." actions={<>
      <Link className="btn" href="/verification"><Icon name="shield" size={13} />Verify artifact</Link>
      <Button variant="primary" type="button" disabled title="Artifact registration becomes available after its FastAPI action and schema are documented."><Icon name="plus" size={13} />Register artifact</Button>
    </>} />
    <ApiNotice state={state} resource="artifacts" />
    {state.data !== null && !parsed ? <ResponseShapeError resource="artifacts" /> : null}

    <section className="summary-grid artifact-summary" aria-label="Artifact registry summary">
      {summary.map((item) => <article className="summary-card" key={item.label}>
        <div className="summary-card-top"><span>{item.label}</span><span className={`summary-icon ${item.tone ?? ''}`}><Icon name={item.icon} size={14} /></span></div>
        <strong>{state.loading ? ' ' : formatCount(item.value)}</strong>
        <small>{parsed ? item.note : 'Waiting for backend data'}</small>
      </article>)}
    </section>

    <Card title="Artifact records" subtitle="Search and filter the records returned by the backend">
      <RecordTable<ArtifactRecord>
        records={records}
        total={parsed?.total}
        columns={columns}
        getId={(item) => item.artifactId}
        searchText={(item) => [item.artifactId, item.name, item.modelId, item.modelVersion, item.hash, item.mediaType].filter(Boolean).join(' ')}
        getStatus={(item) => item.integrityStatus || item.verificationStatus}
        emptyMessage={state.error ? 'No artifact records are available until the backend endpoint is configured.' : 'No artifact records were returned by the backend.'}
        minWidth={1040}
        initialSearch={initialSearch}
        sortValue={(item) => item.createdAt ? Date.parse(item.createdAt) : undefined}
      />
    </Card>
  </>;
}

function mediaIcon(mediaType?: string): IconName {
  const media = mediaType?.toLowerCase() ?? '';
  if (media.includes('image')) return 'image';
  if (media.includes('video')) return 'video';
  return 'document';
}

function ArtifactRegistryCell({ item }: { item: ArtifactRecord }) {
  return <span className="artifact-cell"><span className="file-thumb"><Icon name={mediaIcon(item.mediaType)} size={15} /></span><span className="artifact-cell-copy"><Link className="row-link" href={artifactHref(item.artifactId)}>{item.name}</Link><small className="mono">{item.artifactId}</small></span></span>;
}

export function VerificationPage() {
  const router = useRouter();
  const state = useApi<unknown>('verifications');
  const [selectedId, setSelectedId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const artifactInputRef = useRef<HTMLInputElement>(null);
  const parsed = state.data !== null ? listFromPayload<VerificationRecord>(state.data) : null;
  const records = parsed?.items ?? [];
  const selected = records.find((item) => item.verificationId === selectedId) ?? records[0];
  const evidence = selected?.evidence ?? [];
  const aiEvidenceCount = evidence.filter((item) => item.type.toLowerCase() === 'ai').length;

  const openArtifactPicker = () => {
    setUploadError(null);
    artifactInputRef.current?.click();
  };

  const uploadArtifact = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('claimed_model', `model_frontend_${Date.now()}`);
      formData.append('artifact_type', file.type || 'file');

      const response = await fetch('http://127.0.0.1:8000/api/artifacts', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const message = await response.text().catch(() => '');
        throw new Error(message || `Artifact upload failed with status ${response.status}`);
      }

      const payload = await response.json() as { artifactId?: string };
      if (!payload.artifactId) throw new Error('Artifact upload succeeded, but no artifactId was returned.');

      router.push(artifactHref(payload.artifactId));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Artifact upload failed. Please try again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return <>
    <PageHeader eyebrow="Verification center · evidence-first results" title="Verify an artifact" description="A clear trust decision backed by inspectable evidence—not a black-box score." actions={<>
      <input ref={artifactInputRef} type="file" onChange={uploadArtifact} className="sr-only" aria-label="Choose artifact file" />
      <Button type="button" onClick={openArtifactPicker} disabled={uploading}><Icon name="upload" size={13} />{uploading ? 'Uploading...' : 'Choose artifact'}</Button>
    </>} />
    <ApiNotice state={state} resource="verification" />
    {uploadError ? <div className="state-panel error" role="alert"><span className="state-icon"><Icon name="warning" size={16} /></span><div className="state-copy"><strong>Artifact upload failed</strong><p>{uploadError}</p></div></div> : null}
    {state.data !== null && !parsed ? <ResponseShapeError resource="verifications" /> : null}

    {records.length > 1 ? <div className="verification-select-row"><label htmlFor="verificationSelect">Backend verification record</label><select id="verificationSelect" className="select-input" value={selected?.verificationId ?? ''} onChange={(event) => setSelectedId(event.target.value)}>{records.map((item) => <option key={item.verificationId} value={item.verificationId}>{item.verificationId}</option>)}</select></div> : null}

    <section className={`result-hero${selected ? ` ${statusClass(selected.result)}` : ' is-empty'}`}>
      <div className="result-hero-top"><span className="section-label">{selected ? 'Backend verification record' : 'Verification result'}</span><span className="mono result-id">{selected?.verificationId ?? 'No record selected'}</span></div>
      <div className="result-hero-main">
        <span className="result-icon"><Icon name={selected ? 'shield' : 'info'} size={24} /></span>
        <div className="result-title"><h2>{selected ? displayValue(selected.result) : 'No verification result returned'}</h2><p>{selected ? 'The displayed outcome and evidence below are from the backend response.' : 'Connect the documented verification endpoint to display a result. No sample verification is included.'}</p></div>
        <div className="result-quick-stats"><div><strong>{selected ? evidence.length : '—'}</strong><span>Evidence items</span></div><div><strong>{selected ? aiEvidenceCount : '—'}</strong><span>AI supporting items</span></div></div>
      </div>
      <div className="result-artifact-row"><span className="file-thumb"><Icon name="document" size={16} /></span><span><strong>{selected?.artifactId ? <Link className="row-link" href={artifactHref(selected.artifactId)}>{selected.artifactId}</Link> : 'Artifact identity not returned'}</strong><small>{selected?.modelId ? `Model ${selected.modelId}${selected.version ? ` · ${selected.version}` : ''}` : 'Artifact and model metadata are shown only when returned.'}</small></span><span className="result-side-note">{selected?.checkedAt ? formatDate(selected.checkedAt) : 'No timestamp supplied'}</span></div>
    </section>

    <section className="trust-state-section">
      <div className="trust-state-heading"><div className="section-label">Evidence interpretation</div><span>Guidance only · the backend determines each result</span></div>
      <div className="trust-state-grid">
        <div className="trust-state-item verified"><span className="trust-state-icon"><Icon name="check" size={13} /></span><span><strong>Verified / trusted</strong><small>Evidence supports the returned claim</small></span></div>
        <div className="trust-state-item asserted"><span className="trust-state-icon"><Icon name="info" size={13} /></span><span><strong>Self-asserted</strong><small>Claim supplied without independent proof</small></span></div>
        <div className="trust-state-item unavailable"><span className="trust-state-icon"><Icon name="alert" size={13} /></span><span><strong>Unverifiable</strong><small>Required evidence is unavailable</small></span></div>
        <div className="trust-state-item conflict"><span className="trust-state-icon"><Icon name="close" size={13} /></span><span><strong>Tampered / conflict</strong><small>Returned evidence indicates a conflict</small></span></div>
      </div>
    </section>

    <div className="verification-detail-grid">
      <Card title="Evidence behind this result" subtitle="Each item is displayed as returned; cryptographic and AI evidence remain separate">
        {evidence.length ? <EvidenceGroups evidence={evidence} /> : <div className="panel-body"><EmptyState title="No evidence items returned" description="Evidence details will appear here when included in the backend response." /></div>}
      </Card>
      <Card title="What this result means" subtitle="Plain-language interpretation">
        <div className="interpretation-body"><div className="interpretation-callout"><span className="interpretation-icon"><Icon name="shield" size={14} /></span><div><strong>{selected ? 'Backend-reported decision' : 'No decision available'}</strong><p>{selected ? `The backend returned “${displayValue(selected.result)}”. Review the evidence items alongside the result.` : 'A trust decision cannot be shown until the verification endpoint returns one.'}</p></div></div>
          <div className="evidence-hierarchy"><div className="section-label">Evidence hierarchy</div><div><Icon name="hash" size={13} /><span><strong>Primary · hash and ledger</strong><small>Use returned cryptographic records as the authoritative source.</small></span></div><div><Icon name="spark" size={13} /><span><strong>Supporting · AI analysis</strong><small>AI analysis is contextual and is not cryptographic proof.</small></span></div></div>
        </div>
      </Card>
    </div>

    <div className="verify-another"><span className="verify-another-icon"><Icon name="upload" size={15} /></span><span><strong>Verify another artifact</strong><small>Upload an artifact through FastAPI to register it, run analysis, anchor evidence, and inspect the returned artifact page.</small></span><Button size="sm" type="button" onClick={openArtifactPicker} disabled={uploading}><Icon name="upload" size={12} />{uploading ? 'Uploading...' : 'Choose file'}</Button></div>
  </>;
}

export function ProvenancePage() {
  const state = useProvenance();
  const graph = state.data;
  return <>
    <PageHeader eyebrow="Provenance · linked records" title="The full creation chain" description="Follow each model, transformation, and artifact through the lineage returned by your backend." actions={<Button type="button" disabled title="Sharing is enabled after a documented backend route is supplied."><Icon name="external" size={13} />Share chain</Button>} />
    <ApiNotice state={state} resource="provenance" />
    {graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) ? <Card title="Artifact provenance graph" subtitle="Connections and nodes are displayed from the backend response; no chain links are inferred."><div className="panel-body"><ProvenanceExplorer graph={graph} /></div></Card> : state.error || state.loading ? <Card title="Artifact provenance graph" subtitle="Lineage will appear when the backend returns nodes and edges"><div className="panel-body"><EmptyState title={state.loading ? 'Loading provenance records' : 'No graph available'} description={state.loading ? 'Waiting for the configured FastAPI endpoint.' : 'No graph data is shown until a documented endpoint returns it.'} /></div></Card> : <ResponseShapeError resource="provenance" />}
  </>;
}

export function TestingPage() {
  const state = useTesting();
  return <>
    <PageHeader eyebrow="Testing & handling · results" title="Testing" description="Review recorded test types, timestamps, outcomes, quality metrics, risk metrics, and approval decisions returned by the backend." />
    <ResourceBoundary state={state} loadingLabel="Loading test records">
      {(payload) => {
        if (!payload || !Array.isArray(payload.records)) return <ResponseShapeError resource="testing" />;
        const columns: TableColumn<TestingRecord>[] = [
          { key: 'id', label: 'TEST RECORD', render: (item) => <span className="mono">{item.testId}</span> },
          { key: 'model', label: 'MODEL', render: (item) => <Link className="row-link" href={modelHref(item.modelId)}>{item.modelId}</Link> },
          { key: 'version', label: 'VERSION', render: (item) => displayValue(item.modelVersion) },
          { key: 'type', label: 'TEST TYPE', render: (item) => item.testType },
          { key: 'result', label: 'RESULT', render: (item) => displayValue(item.result) },
          { key: 'decision', label: 'DECISION', render: (item) => <StatusBadge value={item.decision || item.status} /> },
          { key: 'tested', label: 'TESTED', render: (item) => <span className="date">{formatDate(item.testedAt)}</span> },
          { key: 'metrics', label: 'QUALITY / RISK', render: (item) => <span title={metricsText(item.qualityMetrics, item.riskMetrics)}>{metricCount(item.qualityMetrics)} quality · {metricCount(item.riskMetrics)} risk</span> },
        ];
        return <>
          <div className="panel-grid grid-2">
            <Card title="Risk distribution" subtitle="Only returned backend metrics are plotted">
              {payload.riskDistribution?.length ? <RiskChart data={payload.riskDistribution} /> : <div className="panel-body"><EmptyState title="No risk distribution returned" description="No chart is drawn until the backend supplies measured risk data." /></div>}
            </Card>
            <Card title="Quality metrics" subtitle="Backend-reported measures">
              {payload.qualityMetrics?.length ? <div className="panel-body">{payload.qualityMetrics.map((metric) => <div className="detail-field" key={metric.label}><dt>{metric.label}</dt><dd>{displayValue(metric.value)}</dd></div>)}</div> : <div className="panel-body"><EmptyState title="No quality metrics returned" description="Quality metrics will appear here when supplied by test records." /></div>}
            </Card>
          </div>
          <div style={{ height: 14 }} />
          <Card title="Testing records" subtitle="Test history is preserved across model versions">
            <RecordTable records={payload.records} columns={columns} getId={(item) => item.testId} searchText={(item) => [item.testId, item.modelId, item.modelVersion, item.testType, item.result, item.decision, item.status].filter(Boolean).join(' ')} getStatus={(item) => item.decision || item.status} emptyMessage="No testing records were returned by the backend." minWidth={1180} />
          </Card>
        </>;
      }}
    </ResourceBoundary>
  </>;
}

export function LifecyclePage() {
  const state = useApi<unknown>('lifecycle');
  const columns: TableColumn<LifecycleEvent>[] = [
    { key: 'event', label: 'LIFECYCLE EVENT', render: (item) => <strong>{item.summary || item.status}</strong> },
    { key: 'model', label: 'MODEL', render: (item) => <Link className="row-link" href={modelHref(item.modelId)}>{item.modelId}</Link> },
    { key: 'version', label: 'VERSION', render: (item) => displayValue(item.version) },
    { key: 'status', label: 'STATUS', render: (item) => <StatusBadge value={item.status} /> },
    { key: 'actor', label: 'RECORDED BY', render: (item) => displayValue(item.actor) },
    { key: 'date', label: 'TIMESTAMP', render: (item) => <span className="date">{formatDate(item.occurredAt)}</span> },
  ];
  return <ListPage<LifecycleEvent> state={state} resource="lifecycle" eyebrow="Testing & handling · lifecycle" title="Model lifecycle" description="Follow submitted, tested, approved, rejected, and updated states using events returned by the backend. No lifecycle event is inferred or fabricated." columns={columns} getId={(item) => item.eventId} searchText={(item) => [item.eventId, item.modelId, item.version, item.status, item.summary, item.actor].filter(Boolean).join(' ')} getStatus={(item) => item.status} emptyMessage="No lifecycle events were returned by the backend." minWidth={1000} />;
}

function PropertyChanges({ changes }: { changes?: VersionHistoryEvent['propertyChanges'] }) {
  if (!changes?.length) return <span className="muted">No property changes returned</span>;
  return <details><summary className="row-link" style={{ cursor: 'pointer' }}>{changes.length} change{changes.length === 1 ? '' : 's'}</summary><div style={{ position: 'absolute', zIndex: 5, width: 270, marginTop: 6, padding: 10, border: '1px solid #49382b', borderRadius: 8, background: '#fffaf1', boxShadow: '3px 3px 0 rgba(43,33,24,.5)', whiteSpace: 'normal' }}>{changes.map((change) => <div className="version-row" key={change.property}><span className="version-label">{change.property}</span><span className="version-copy"><strong>{displayValue(change.previousValue)} → {displayValue(change.newValue)}</strong></span></div>)}</div></details>;
}

export function HistoryPage() {
  const state = useApi<unknown>('history');
  const columns: TableColumn<VersionHistoryEvent>[] = [
    { key: 'event', label: 'HISTORY EVENT', render: (item) => <strong>{item.eventType}</strong> },
    { key: 'model', label: 'MODEL', render: (item) => <Link className="row-link" href={modelHref(item.modelId)}>{item.modelId}</Link> },
    { key: 'version', label: 'VERSION', render: (item) => displayValue(item.version) },
    { key: 'summary', label: 'CHANGE SUMMARY', render: (item) => displayValue(item.summary) },
    { key: 'changes', label: 'PROPERTY CHANGES', render: (item) => <PropertyChanges changes={item.propertyChanges} /> },
    { key: 'date', label: 'RECORDED', render: (item) => <span className="date">{formatDate(item.occurredAt)}</span> },
  ];
  return <ListPage<VersionHistoryEvent> state={state} resource="history" eyebrow="Trust · immutable history" title="Version history" description="Inspect prior versions and property changes without overwriting earlier model records." columns={columns} getId={(item) => item.eventId} searchText={(item) => [item.eventId, item.modelId, item.version, item.eventType, item.summary].filter(Boolean).join(' ')} emptyMessage="No version history was returned by the backend." minWidth={1100} />;
}

export function ActivityPage() {
  const state = useActivity();
  const [typeFilter, setTypeFilter] = useState('all');
  const parsed = state.data !== null ? listFromPayload<ActivityEvent>(state.data) : null;
  const events = parsed?.items ?? [];
  const types = [...new Set(events.map((event) => event.type).filter(Boolean))];
  const filtered = typeFilter === 'all' ? events : events.filter((event) => event.type === typeFilter);
  const timestamped = events.filter((event) => event.occurredAt && !Number.isNaN(Date.parse(event.occurredAt))).length;
  const aiEvents = events.filter((event) => event.evidenceType?.toLowerCase() === 'ai').length;

  return <>
    <PageHeader eyebrow="Audit trail · event history" title="Activity & audit trail" description="A time-ordered view of registration, verification, provenance, and integrity events as supplied by the backend." actions={<Button type="button" disabled title="Audit export requires a documented FastAPI endpoint."><Icon name="download" size={13} />Export log</Button>} />
    <ApiNotice state={state} resource="activity" />
    {state.data !== null && !parsed ? <ResponseShapeError resource="activity" /> : null}

    <div className="activity-layout">
      <Card title="Workspace event log" subtitle="Events remain in the order returned by the backend" action={<span className="section-label">Backend records</span>}>
        <div className="activity-filter-row"><div className="activity-filter-group">
          <button type="button" className={`filter-pill${typeFilter === 'all' ? ' active' : ''}`} onClick={() => setTypeFilter('all')}>All events<span className="filter-count">{events.length}</span></button>
          {types.map((type) => <button type="button" key={type} className={`filter-pill${typeFilter === type ? ' active' : ''}`} onClick={() => setTypeFilter(type)}>{type}<span className="filter-count">{events.filter((event) => event.type === type).length}</span></button>)}
        </div></div>
        {filtered.length ? <div className="event-timeline">{filtered.map((event) => <article className="event-row" key={event.eventId}>
          <span className={`event-icon ${statusClass(event.evidenceType)}`}><Icon name={event.evidenceType?.toLowerCase() === 'ai' ? 'spark' : event.type.toLowerCase().includes('verify') ? 'shield' : 'activity'} size={14} /></span>
          <div className="event-copy"><strong>{event.type}</strong><p>{event.summary}</p><div className="event-tags">{event.modelId ? <Link href={modelHref(event.modelId)}>{event.modelId}{event.version ? ` · ${event.version}` : ''}</Link> : null}{event.actor ? <span>Actor · {event.actor}</span> : null}{event.evidenceType ? <span>Evidence · {event.evidenceType}</span> : null}</div></div>
          <time>{formatDate(event.occurredAt)}</time>
        </article>)}</div> : <div className="panel-body"><EmptyState title={events.length ? 'No matching events' : 'No activity records returned'} description={events.length ? 'Choose a different event filter.' : 'Audit events will appear here when the configured backend returns them.'} /></div>}
        <div className="table-footer"><span>Showing {filtered.length} loaded events{parsed?.total !== undefined ? ` · backend total ${parsed.total}` : ''}</span><span>Export is unavailable until configured</span></div>
      </Card>

      <aside className="activity-side-stack">
        <Card title="Audit integrity" subtitle="Integrity summaries are backend-owned">
          <div className="audit-integrity-head"><span className="audit-shield"><Icon name="shield" size={18} /></span><span><strong>Not reported</strong><small>No integrity summary was included in the response.</small></span></div>
          <div className="audit-check-row"><span><Icon name="info" size={12} />Event-order validation</span><strong>Not supplied</strong></div>
          <div className="audit-check-row"><span><Icon name="info" size={12} />Ledger checkpoint status</span><strong>Not supplied</strong></div>
          <div className="audit-check-row"><span><Icon name="info" size={12} />Audit export status</span><strong>Not supplied</strong></div>
        </Card>
        <Card title="Returned activity" subtitle="Counts calculated only from records currently loaded">
          <div className="activity-count-grid">
            <div><strong>{parsed ? events.length : '—'}</strong><span>Events returned</span></div>
            <div><strong>{parsed ? timestamped : '—'}</strong><span>With timestamps</span></div>
            <div><strong>{parsed ? events.filter((event) => Boolean(event.actor)).length : '—'}</strong><span>With actor</span></div>
            <div><strong>{parsed ? aiEvents : '—'}</strong><span>AI-labelled events</span></div>
          </div>
          <div className="inline-note"><Icon name="info" size={12} />AI-labelled events are supporting analysis, not cryptographic evidence.</div>
        </Card>
      </aside>
    </div>
  </>;
}

function metricCount(metrics?: Record<string, number | string>): string {
  return metrics ? String(Object.keys(metrics).length) : '—';
}
function metricsText(...groups: Array<Record<string, number | string> | undefined>): string {
  return groups.flatMap((group) => Object.entries(group ?? {}).map(([key, value]) => `${key}: ${value}`)).join(' · ');
}
