import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

interface MetricCardProps {
  title: string;
  value: string | number;
  changePercent?: number;
  icon: LucideIcon;
  loading?: boolean;
}

export default function MetricCard({
  title,
  value,
  changePercent,
  icon: Icon,
  loading,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="metric-card">
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 animate-skeleton rounded bg-gray-700" />
          <div className="h-8 w-8 animate-skeleton rounded-lg bg-gray-700" />
        </div>
        <div className="mt-3 h-8 w-32 animate-skeleton rounded bg-gray-700" />
        <div className="mt-2 h-4 w-20 animate-skeleton rounded bg-gray-700" />
      </div>
    );
  }

  const isPositive = changePercent !== undefined && changePercent >= 0;

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="rounded-lg bg-gray-800 p-2">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      {changePercent !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-accent-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
          <span
            className={clsx(
              'text-sm font-medium',
              isPositive ? 'text-accent-500' : 'text-rose-500',
            )}
          >
            {isPositive ? '+' : ''}
            {changePercent.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  );
}
