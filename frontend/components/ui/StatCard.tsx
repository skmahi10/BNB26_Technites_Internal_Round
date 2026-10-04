import { Icon, type IconName } from '@/components/ui/Icons';
import { formatCount } from '@/lib/utils/format';
import type { DashboardMetrics } from '@/lib/types';

const definitions: Array<{ key: keyof DashboardMetrics; label: string; icon: IconName; color?: string }> = [
  { key: 'totalModels', label: 'Total models', icon: 'cube' },
  { key: 'trustedModels', label: 'Verified / trusted', icon: 'shield', color: 'green' },
  { key: 'modelsRequiringAttention', label: 'Requiring attention', icon: 'alert', color: 'amber' },
  { key: 'testingPending', label: 'Testing pending', icon: 'flask', color: 'blue' },
  { key: 'approvedModels', label: 'Approved models', icon: 'check', color: 'green' },
  { key: 'rejectedModels', label: 'Rejected models', icon: 'warning' },
];

export function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: IconName; color?: string }) {
  return <article className="metric-card"><div className="metric-top"><span className="metric-label">{label}</span><span className={`metric-mark ${color ?? ''}`}><Icon name={icon} size={13} /></span></div><div className="metric-value">{typeof value === 'number' ? formatCount(value) : value}</div><div className="metric-note">From the configured backend response</div></article>;
}

export function MetricCards({ metrics }: { metrics: DashboardMetrics }) {
  const available = definitions.filter((item) => metrics[item.key] !== undefined && metrics[item.key] !== null);
  if (!available.length) return <div className="state-panel"><span className="state-icon"><Icon name="info" size={16} /></span><div className="state-copy"><strong>No dashboard metrics reported</strong><p>The configured dashboard response did not include metric values.</p></div></div>;
  return <section className="metric-grid" aria-label="Backend-reported model metrics">{available.map((item) => <StatCard key={item.key} label={item.label} value={metrics[item.key] as number | string} icon={item.icon} color={item.color} />)}</section>;
}
