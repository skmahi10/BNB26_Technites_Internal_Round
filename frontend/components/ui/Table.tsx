import type { ReactNode } from 'react';

export function DataTable({
  columns,
  rows,
  emptyMessage,
  minWidth = 720,
}: {
  columns: Array<{ key: string; label: string; className?: string }>;
  rows: Array<{ id: string; cells: ReactNode[]; href?: string }>;
  emptyMessage: string;
  minWidth?: number;
}) {
  return (
    <div className="table-scroll">
      <table className="data-table" style={{ minWidth }}>
        <thead><tr>{columns.map((column) => <th key={column.key} className={column.className}>{column.label}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell, index) => <td key={`${row.id}-${columns[index]?.key ?? index}`}>{cell}</td>)}
            </tr>
          )) : <tr><td colSpan={columns.length} className="table-empty">{emptyMessage}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export const Table = DataTable;
