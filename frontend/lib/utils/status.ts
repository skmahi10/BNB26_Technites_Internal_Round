export function statusClass(value?: string): string {
  const normalized = (value ?? '').toLowerCase().replace(/[_\s/]+/g, '-').replace(/-+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (normalized.includes('tamper') || normalized.includes('conflict') || normalized.includes('reject') || normalized.includes('fail') || normalized === 'error') return 'conflict';
  if (normalized.includes('unverifiable') || normalized.includes('unknown') || normalized.includes('not-started') || normalized.includes('not-available')) return 'unverifiable';
  if (normalized.includes('verified') || normalized.includes('trusted') || normalized.includes('approved') || normalized.includes('passed') || normalized.includes('complete')) return 'verified';
  if (normalized.includes('self-asserted') || normalized.includes('pending') || normalized.includes('submitted') || normalized.includes('review') || normalized.includes('awaiting')) return 'pending';
  if (normalized.includes('testing') || normalized.includes('in-progress') || normalized.includes('running')) return 'testing';
  return '';
}
