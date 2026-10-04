import type { ReactNode } from 'react';
import { statusClass } from '@/lib/utils/status';

export function Badge({ value, children }: { value?: string; children?: ReactNode }) {
  const text = children ?? value ?? 'Not reported';
  return <span className={`status-badge ${statusClass(value ?? (typeof text === 'string' ? text : undefined))}`}>{text}</span>;
}

export const StatusBadge = Badge;
