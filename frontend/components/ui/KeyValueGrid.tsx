import type { JsonValue } from '@/lib/types';
import { displayValue } from '@/lib/utils/format';

export function KeyValueGrid({ items, emptyText = 'No metadata was supplied.' }: { items: Array<[string, unknown]>; emptyText?: string }) {
  if (!items.length) return <div className="table-empty">{emptyText}</div>;
  return (
    <dl className="metadata-grid">
      {items.map(([key, value]) => <div className="metadata-item" key={key}><dt>{key}</dt><dd>{displayValue(value as JsonValue)}</dd></div>)}
    </dl>
  );
}
