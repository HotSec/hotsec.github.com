import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import clsx from 'clsx';
import type { TopPage } from '@/types';

interface TopPagesTableProps {
  data: TopPage[] | undefined;
  loading?: boolean;
}

type SortKey = 'url' | 'views' | 'uniqueVisitors' | 'avgDuration';
type SortDir = 'asc' | 'desc';

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function TopPagesTable({ data, loading }: TopPagesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('views');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...(data || [])].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: 'url', label: 'Page URL' },
    { key: 'views', label: 'Views', align: 'text-right' },
    { key: 'uniqueVisitors', label: 'Unique Visitors', align: 'text-right' },
    { key: 'avgDuration', label: 'Avg Duration', align: 'text-right' },
  ];

  if (loading) {
    return (
      <div className="chart-container">
        <div className="h-5 w-32 animate-skeleton rounded bg-gray-700" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-4 w-64 animate-skeleton rounded bg-gray-700" />
              <div className="h-4 w-16 animate-skeleton rounded bg-gray-700" />
              <div className="h-4 w-16 animate-skeleton rounded bg-gray-700" />
              <div className="h-4 w-16 animate-skeleton rounded bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-gray-200">Top Pages</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={clsx(
                    'table-header cursor-pointer select-none',
                    col.align,
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown
                      className={clsx(
                        'h-3 w-3',
                        sortKey === col.key
                          ? 'text-primary-400'
                          : 'text-gray-600',
                      )}
                    />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((page, idx) => (
              <tr
                key={`${page.url}-${idx}`}
                className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/30"
              >
                <td className="table-cell max-w-xs truncate font-medium text-gray-200">
                  {page.url}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {page.views.toLocaleString()}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {page.uniqueVisitors.toLocaleString()}
                </td>
                <td className="table-cell text-right tabular-nums">
                  {formatDuration(page.avgDuration)}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-gray-500"
                >
                  No page data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
