import type { JsonValue } from '@/lib/types';

export function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return '—';
  }
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(date);
}

export function formatCount(value?: number): string {
  if (value === undefined || value === null || !Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

export function shortHash(value?: string, visible = 18): string {
  if (!value) return '—';
  if (value.length <= visible) return value;
  const head = Math.max(6, Math.floor((visible - 1) / 2));
  const tail = Math.max(4, visible - head - 1);
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function metadataEntries(metadata?: Record<string, JsonValue>): Array<[string, JsonValue]> {
  if (!metadata) return [];
  return Object.entries(metadata);
}
