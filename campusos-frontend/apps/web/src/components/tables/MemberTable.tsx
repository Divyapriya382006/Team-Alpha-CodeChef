import type { ReactNode } from "react";

export interface MemberTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface MemberTableProps<T> {
  rows: T[];
  columns: MemberTableColumn<T>[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

// Generic enough to serve both the club roster (name/email/role + promote-demote-remove) and,
// later, a department roster (name only + add/remove) — callers define columns, this just renders.
export function MemberTable<T>({ rows, columns, getRowKey, emptyMessage = "No members yet." }: MemberTableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="surface overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/60">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-mono text-xs font-medium uppercase tracking-wider text-slate-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/70">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="transition hover:bg-slate-900/40">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 align-middle text-slate-300">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
