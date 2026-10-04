'use client';

import Link from 'next/link';
import { EmptyState, ResourceBoundary } from '@/components/ui/States';
import { DataTable } from '@/components/ui/Table';
import { Card } from '@/components/ui/Card';
import { EvidenceGroups } from '@/components/ui/EvidenceItem';
import { useApi } from '@/lib/hooks/useApi';
import { Icon } from '@/components/ui/Icons';
import { KeyValueGrid } from '@/components/ui/KeyValueGrid';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProvenanceExplorer } from '@/components/ui/ProvenanceExplorer';
import { StatusBadge } from '@/components/ui/Badge';
import type { ArtifactDetailPayload, BlockchainEvidence, ModelDetailPayload, ModelVersion, TestingRecord } from '@/lib/types';
import { displayValue, formatDate, shortHash } from '@/lib/utils/format';

export function ModelDetailPage({ modelId }: { modelId: string }) {
  const state = useApi<ModelDetailPayload>('modelDetail', { modelId });
  return <>
    <PageHeader eyebrow="Trust · model identity" title="Model details" description="Identity, integrity, version history, provenance, testing, related artifacts, and blockchain evidence returned for this model." actions={<Link className="btn btn-sm" href="/models"><Icon name="arrow" size={13} />Back to models</Link>} />
    <ResourceBoundary state={state} loadingLabel="Loading model detail">
      {(payload) => payload?.model ? <ModelDetailContent payload={payload} /> : <div className="state-panel error"><span className="state-icon"><Icon name="warning" size={16} /></span><div className="state-copy"><strong>Model details were not returned</strong><p>The configured detail endpoint did not return a model record for this ID.</p></div></div>}
    </ResourceBoundary>
  </>;
}

function ModelDetailContent({ payload }: { payload: ModelDetailPayload }) {
  const model = payload.model;
  const versionRows = (payload.versions ?? []).map((version: ModelVersion) => ({
    id: version.version,
    cells: [
      <strong key="version">{version.version}</strong>,
      <span className="mono hash" key="hash" title={version.modelHash}>{shortHash(version.modelHash)}</span>,
      displayValue(version.changeSummary), displayValue(version.createdBy), <StatusBadge value={version.integrityStatus} key="status" />,
      <span className="date" key="created">{formatDate(version.createdAt)}</span>,
    ],
  }));
  const testRows = (payload.tests ?? []).map((test: TestingRecord) => ({
    id: test.testId,
    cells: [<span className="mono" key="id">{test.testId}</span>, displayValue(test.modelVersion), test.testType, displayValue(test.result), <StatusBadge value={test.decision || test.status} key="decision" />, <span className="date" key="time">{formatDate(test.testedAt)}</span>],
  }));
  const chainRows = (payload.blockchainEvidence ?? []).map((record: BlockchainEvidence, index) => ({
    id: `${record.transactionHash ?? 'evidence'}-${index}`,
    cells: [displayValue(record.network), <span className="mono hash" key="tx" title={record.transactionHash}>{shortHash(record.transactionHash)}</span>, displayValue(record.block), displayValue(record.contract), <StatusBadge value={record.transactionStatus || record.verificationResult} key="status" />, <span className="date" key="time">{formatDate(record.timestamp)}</span>],
  }));

  return <>
    <section className="panel" style={{ marginBottom: 14 }}>
      <div className="panel-header">
        <div className="panel-heading"><div className="eyebrow">Model identity</div><h2 className="panel-title" style={{ fontSize: 15 }}>{model.name || model.modelId}</h2><p className="panel-subtitle mono">{model.modelId}</p></div>
        <div className="page-actions"><StatusBadge value={model.verificationStatus || model.integrityStatus} /><StatusBadge value={model.lifecycleStatus} /></div>
      </div>
      <div className="detail-fields">
        <div className="detail-field"><dt>Creator / owner</dt><dd>{displayValue(model.creator || model.owner)}</dd></div>
        <div className="detail-field"><dt>Current version</dt><dd>{displayValue(model.currentVersion)}</dd></div>
        <div className="detail-field"><dt>Model hash</dt><dd className="mono">{model.modelHash || '—'}</dd></div>
        <div className="detail-field"><dt>Registered</dt><dd>{formatDate(model.registeredAt)}</dd></div>
        <div className="detail-field"><dt>Integrity status</dt><dd><StatusBadge value={model.integrityStatus} /></dd></div>
        <div className="detail-field"><dt>Verification status</dt><dd><StatusBadge value={model.verificationStatus} /></dd></div>
      </div>
      <div className="section-label" style={{ padding: '0 15px 7px' }}>Metadata</div>
      <KeyValueGrid items={Object.entries(model.metadata ?? {})} emptyText="No model metadata was returned." />
    </section>

    <div className="detail-grid">
      <Card title="Version history" subtitle="Earlier versions are retained; the UI never overwrites prior records" className="full-width">
        {versionRows.length ? <DataTable minWidth={900} columns={[{ key: 'version', label: 'VERSION' }, { key: 'hash', label: 'MODEL HASH' }, { key: 'change', label: 'PROPERTY / CHANGE SUMMARY' }, { key: 'creator', label: 'CREATED BY' }, { key: 'status', label: 'INTEGRITY' }, { key: 'created', label: 'TIMESTAMP' }]} rows={versionRows} emptyMessage="No versions were returned." /> : <div className="panel-body"><EmptyState title="No version history returned" description="Version records will appear when supplied by the backend." /></div>}
      </Card>
      <Card title="Testing records" subtitle="Quality, risk, results, and decisions for this model">
        {testRows.length ? <DataTable minWidth={760} columns={[{ key: 'id', label: 'TEST ID' }, { key: 'version', label: 'VERSION' }, { key: 'type', label: 'TYPE' }, { key: 'result', label: 'RESULT' }, { key: 'decision', label: 'DECISION' }, { key: 'time', label: 'TESTED' }]} rows={testRows} emptyMessage="No testing records were returned." /> : <div className="panel-body"><EmptyState title="No testing records returned" description="Test results appear when the backend links them to this model." /></div>}
      </Card>
      <Card title="Related artifacts" subtitle="Evidence associated with this model and its versions">
        {payload.relatedArtifacts?.length ? <div className="panel-body">{payload.relatedArtifacts.map((artifact) => <div className="version-row" key={artifact.artifactId}>
          <span className="version-label"><Icon name="file" size={13} /></span>
          <span className="version-copy"><strong><Link className="row-link" href={`/artifacts/${encodeURIComponent(artifact.artifactId)}`}>{artifact.name}</Link></strong><span className="mono">{artifact.artifactId}{artifact.modelVersion ? ` · ${artifact.modelVersion}` : ''}</span><span className="mono">{shortHash(artifact.hash)}</span></span>
          <StatusBadge value={artifact.integrityStatus || artifact.verificationStatus} />
        </div>)}</div> : <div className="panel-body"><EmptyState title="No related artifacts returned" description="Artifacts linked to this model will appear here." /></div>}
      </Card>
      <Card title="Provenance" subtitle="Model/version lineage returned by the backend" className="full-width">
        {payload.provenance?.nodes?.length ? <div className="panel-body"><ProvenanceExplorer graph={payload.provenance} /></div> : <div className="panel-body"><EmptyState title="No provenance graph returned" description="The backend did not provide provenance nodes for this model." /></div>}
      </Card>
      <Card title="Blockchain evidence" subtitle="Network, transaction, contract, and verification details as returned">
        {chainRows.length ? <DataTable minWidth={800} columns={[{ key: 'network', label: 'NETWORK' }, { key: 'tx', label: 'TRANSACTION' }, { key: 'block', label: 'BLOCK' }, { key: 'contract', label: 'CONTRACT' }, { key: 'status', label: 'STATUS' }, { key: 'time', label: 'TIMESTAMP' }]} rows={chainRows} emptyMessage="No blockchain evidence was returned." /> : <div className="panel-body"><EmptyState title="No blockchain evidence returned" description="The frontend does not query a chain directly." /></div>}
      </Card>
    </div>
  </>;
}

export function ArtifactDetailPage({ artifactId }: { artifactId: string }) {
  const state = useApi<ArtifactDetailPayload>('artifactDetail', { artifactId });
  return <>
    <PageHeader eyebrow="Trust · artifact evidence" title="Artifact details" description="Inspect the artifact identity, linked model/version, integrity, verification evidence, provenance, and ledger evidence returned by the backend." actions={<Link className="btn btn-sm" href="/artifacts"><Icon name="arrow" size={13} />Back to artifacts</Link>} />
    <ResourceBoundary state={state} loadingLabel="Loading artifact detail">
      {(payload) => payload?.artifact ? <ArtifactDetailContent payload={payload} /> : <div className="state-panel error"><span className="state-icon"><Icon name="warning" size={16} /></span><div className="state-copy"><strong>Artifact details were not returned</strong><p>The configured detail endpoint did not return an artifact record for this ID.</p></div></div>}
    </ResourceBoundary>
  </>;
}

function ArtifactDetailContent({ payload }: { payload: ArtifactDetailPayload }) {
  const artifact = payload.artifact;
  const chainRows = (payload.blockchainEvidence ?? []).map((record: BlockchainEvidence, index) => ({
    id: `${record.transactionHash ?? 'evidence'}-${index}`,
    cells: [displayValue(record.network), <span className="mono hash" key="tx">{shortHash(record.transactionHash)}</span>, displayValue(record.block), displayValue(record.contract), <StatusBadge value={record.transactionStatus || record.verificationResult} key="status" />, <span className="date" key="time">{formatDate(record.timestamp)}</span>],
  }));
  const versionRows = (payload.versions ?? []).map((version: ModelVersion) => ({
    id: version.version,
    cells: [displayValue(version.version), <span className="mono hash" key="hash">{shortHash(version.modelHash)}</span>, displayValue(version.changeSummary), <StatusBadge value={version.integrityStatus} key="status" />, <span className="date" key="time">{formatDate(version.createdAt)}</span>],
  }));

  return <>
    <section className="panel" style={{ marginBottom: 14 }}>
      <div className="panel-header">
        <div className="panel-heading"><div className="eyebrow">Artifact identity</div><h2 className="panel-title" style={{ fontSize: 15 }}>{artifact.name}</h2><p className="panel-subtitle mono">{artifact.artifactId}</p></div>
        <StatusBadge value={artifact.integrityStatus || artifact.verificationStatus} />
      </div>
      <div className="detail-fields">
        <div className="detail-field"><dt>Linked model</dt><dd>{payload.model ? <Link className="row-link" href={`/models/${encodeURIComponent(payload.model.modelId)}`}>{payload.model.name || payload.model.modelId}</Link> : artifact.modelId || '—'}</dd></div>
        <div className="detail-field"><dt>Model version</dt><dd>{displayValue(artifact.modelVersion)}</dd></div>
        <div className="detail-field"><dt>Media type</dt><dd>{displayValue(artifact.mediaType)}</dd></div>
        <div className="detail-field"><dt>Created</dt><dd>{formatDate(artifact.createdAt)}</dd></div>
        <div className="detail-field"><dt>Artifact hash</dt><dd className="mono">{artifact.hash || '—'}</dd></div>
        <div className="detail-field"><dt>Verification result</dt><dd><StatusBadge value={payload.verification?.result} /></dd></div>
      </div>
    </section>
    <div className="detail-grid">
      <Card title="Verification evidence" subtitle="Trust and provenance checks are distinct from AI supporting analysis">
        {payload.verification?.evidence?.length ? <EvidenceGroups evidence={payload.verification.evidence} /> : <div className="panel-body"><EmptyState title="No verification evidence returned" description="No evidence details were included for this artifact." /></div>}
      </Card>
      <Card title="Model identity" subtitle="Linked model information returned by the backend">
        {payload.model ? <div className="panel-body"><div className="detail-field"><dt>Model ID</dt><dd><Link className="row-link" href={`/models/${encodeURIComponent(payload.model.modelId)}`}>{payload.model.modelId}</Link></dd></div><div className="detail-field"><dt>Owner</dt><dd>{displayValue(payload.model.creator || payload.model.owner)}</dd></div><div className="detail-field"><dt>Current version</dt><dd>{displayValue(payload.model.currentVersion)}</dd></div><div className="detail-field"><dt>Model hash</dt><dd className="mono">{payload.model.modelHash || '—'}</dd></div></div> : <div className="panel-body"><EmptyState title="No model details returned" description="The backend did not include the associated model record." /></div>}
      </Card>
      <Card title="Model version history" subtitle="Version identity and important changes">
        {versionRows.length ? <DataTable minWidth={720} columns={[{ key: 'version', label: 'VERSION' }, { key: 'hash', label: 'HASH' }, { key: 'change', label: 'CHANGES' }, { key: 'status', label: 'INTEGRITY' }, { key: 'time', label: 'CREATED' }]} rows={versionRows} emptyMessage="No versions were returned." /> : <div className="panel-body"><EmptyState title="No version history returned" description="Version records were not included for this artifact." /></div>}
      </Card>
      <Card title="Provenance" subtitle="Linked event history returned by the backend">
        {payload.provenance?.nodes?.length ? <div className="panel-body"><ProvenanceExplorer graph={payload.provenance} /></div> : <div className="panel-body"><EmptyState title="No provenance graph returned" description="The frontend does not infer parent relationships." /></div>}
      </Card>
      <Card title="Blockchain evidence" subtitle="Backend-returned ledger metadata; network is not hardcoded">
        {chainRows.length ? <DataTable minWidth={790} columns={[{ key: 'network', label: 'NETWORK' }, { key: 'tx', label: 'TRANSACTION' }, { key: 'block', label: 'BLOCK' }, { key: 'contract', label: 'CONTRACT' }, { key: 'status', label: 'STATUS' }, { key: 'time', label: 'TIMESTAMP' }]} rows={chainRows} emptyMessage="No blockchain evidence was returned." /> : <div className="panel-body"><EmptyState title="No blockchain evidence returned" description="The frontend does not call a blockchain directly." /></div>}
      </Card>
    </div>
  </>;
}

