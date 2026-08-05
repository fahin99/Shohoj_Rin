import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  /** Right-align numeric/financial columns. */
  numeric?: boolean;
  /** Hide on small screens when the value is duplicated elsewhere. */
  hideBelow?: 'sm' | 'md' | 'lg';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  empty?: ReactNode;
}

const hideClass = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' };

/**
 * Calm, scannable financial table. Scrolls horizontally inside its own
 * container on small screens so the page itself never scrolls sideways.
 */
export function DataTable<T>({ caption, columns, rows, rowKey, empty }: DataTableProps<T>) {
  if (rows.length === 0 && empty) {
    return <div className="p-6">{empty}</div>;
  }

  return (
    <div className="table-scroll w-full">
      <table className="w-full min-w-[36rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-stone-200 bg-stone-50">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={`whitespace-nowrap px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500 ${
                  c.numeric ? 'text-right' : ''
                } ${c.hideBelow ? hideClass[c.hideBelow] : ''}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`px-4 py-3 align-middle text-sm text-navy ${
                    c.numeric ? 'font-mono-sr text-right' : ''
                  } ${c.hideBelow ? hideClass[c.hideBelow] : ''}`}
                >
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
