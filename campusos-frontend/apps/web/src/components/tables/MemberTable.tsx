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
    return <p className="py-6 text-center text-sm font-semibold" style={{ color: '#555555' }}>{emptyMessage}</p>;
  }

  return (
    <div
      style={{
        border: '2px solid #0A0A0A',
        boxShadow: '4px 4px 0px #0A0A0A',
        borderRadius: 0,
        overflowX: 'auto',
      }}
    >
      <table className="min-w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#0A0A0A' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  color: '#C8F135',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  padding: '12px 16px',
                  border: '1px solid #0A0A0A',
                  textAlign: 'left',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const isEven = index % 2 === 1;
            return (
              <tr
                key={getRowKey(row)}
                style={{
                  backgroundColor: isEven ? '#F5F0E8' : '#FFFFFF',
                  borderBottom: '1px solid #0A0A0A',
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      padding: '12px 16px',
                      borderRight: '1px solid #0A0A0A',
                      verticalAlign: 'middle',
                    }}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
