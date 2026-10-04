'use client';

import { useState } from 'react';
import type { ProvenanceGraph } from '@/lib/types';
import { formatDate, shortHash } from '@/lib/utils/format';
import { StatusBadge } from '@/components/ui/Badge';
import { Icon, type IconName } from '@/components/ui/Icons';
import { EmptyState } from '@/components/ui/States';

function kindIcon(kind: string): IconName {
  if (kind.toLowerCase().includes('artifact')) return 'document';
  if (kind.toLowerCase().includes('system') || kind.toLowerCase().includes('editor')) return 'spark';
  return 'cube';
}

function kindTone(kind: string): string {
  if (kind.toLowerCase().includes('artifact')) return 'artifact';
  if (kind.toLowerCase().includes('system') || kind.toLowerCase().includes('editor')) return 'system';
  return 'model';
}

export function ProvenanceExplorer({ graph }: { graph: ProvenanceGraph }) {
  const [selectedId, setSelectedId] = useState<string | null>(graph.nodes[0]?.id ?? null);
  const selected = graph.nodes.find((node) => node.id === selectedId) ?? graph.nodes[0] ?? null;

  if (!graph.nodes.length) {
    return <EmptyState title="No provenance nodes returned" description="Graph nodes and edges will appear here when the backend returns linked models, versions, artifacts, and transformations." />;
  }

  return <div className="provenance-workspace">
    <section className="provenance-chain-card" aria-label="Artifact provenance graph">
      <div className="provenance-chain-heading"><div><strong>Artifact provenance graph</strong><span>Connections represent explicit edges in the backend response.</span></div><div className="provenance-legend"><span><i className="legend-dot red" />Model / system</span><span><i className="legend-dot green" />Artifact</span><span className="graph-count">{graph.nodes.length} nodes · {graph.edges.length} edges</span></div></div>
      <div className="provenance-chain-scroll"><div className="provenance-chain">
        {graph.nodes.map((node, index) => <div className="provenance-chain-step" key={node.id}>
          <button type="button" className={`provenance-node ${kindTone(node.kind)}${selected?.id === node.id ? ' selected' : ''}`} onClick={() => setSelectedId(node.id)} aria-pressed={selected?.id === node.id}>
            <span className="provenance-node-top"><span className="provenance-node-icon"><Icon name={kindIcon(node.kind)} size={14} /></span><span className="provenance-node-kind">{node.kind}</span></span>
            <strong>{node.label}</strong>
            <small>{[node.modelId, node.version].filter(Boolean).join(' · ') || 'Identity not supplied'}</small>
            {node.occurredAt ? <time>{formatDate(node.occurredAt)}</time> : null}
          </button>
          {index < graph.nodes.length - 1 ? <span className={`chain-connector ${graph.edges.some((edge) => edge.source === node.id && edge.target === graph.nodes[index + 1]?.id) ? 'is-linked' : ''}`} aria-hidden="true"><Icon name="arrow" size={15} /></span> : null}
        </div>)}
      </div></div>
      <div className="provenance-chain-foot">Nodes are shown in the order returned by the API. Only returned edges are treated as relationships.</div>
    </section>

    <div className="provenance-event-grid">
      <section className="provenance-event-detail">
        <div className="provenance-detail-head"><div><span className="section-label">Selected graph node</span><h3>{selected?.label ?? 'No node selected'}</h3><p>{selected?.details || 'No additional event details were included in the backend response.'}</p></div>{selected?.trustStatus ? <StatusBadge value={selected.trustStatus} /> : null}</div>
        {selected ? <dl className="provenance-detail-list">
          <div><dt>Kind</dt><dd>{selected.kind}</dd></div>
          <div><dt>Model</dt><dd>{selected.modelId || '—'}</dd></div>
          <div><dt>Version</dt><dd>{selected.version || '—'}</dd></div>
          <div><dt>Timestamp</dt><dd>{formatDate(selected.occurredAt)}</dd></div>
          <div className="wide"><dt>SHA-256 hash</dt><dd className="mono">{shortHash(selected.hash, 40)}</dd></div>
        </dl> : null}
      </section>
      <section className="provenance-ledger-detail">
        <div className="provenance-detail-head"><div><span className="section-label">Verification &amp; ledger evidence</span><h3>Evidence attached to this graph</h3><p>Blockchain validation remains a backend responsibility.</p></div><span className="ledger-state"><Icon name="info" size={12} />Data only</span></div>
        <div className="provenance-evidence-note"><span className="ledger-dot"><Icon name="layers" size={13} /></span><span><strong>Ledger evidence not included</strong><small>No transaction or verification evidence was included with this graph response. It is not inferred or queried directly.</small></span></div>
        <div className="provenance-evidence-note"><span className="ledger-dot"><Icon name="git" size={13} /></span><span><strong>Explicit graph links</strong><small>{graph.edges.length} returned relationship{graph.edges.length === 1 ? '' : 's'} connect the nodes shown above.</small></span></div>
      </section>
    </div>
  </div>;
}
