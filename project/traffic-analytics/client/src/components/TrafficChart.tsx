import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { TimeSeriesPoint, TimePeriod } from '@/types';

interface TrafficChartProps {
  data: TimeSeriesPoint[] | undefined;
  loading?: boolean;
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: '1h', label: '1H' },
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
];

function formatTimestamp(timestamp: string, period: TimePeriod): string {
  const date = new Date(timestamp);
  switch (period) {
    case '1h':
      return format(date, 'HH:mm');
    case '24h':
      return format(date, 'HH:mm');
    case '7d':
      return format(date, 'EEE HH:mm');
    case '30d':
      return format(date, 'MMM d');
    default:
      return format(date, 'MMM d HH:mm');
  }
}

function CustomTooltip({
  active,
  payload,
  label,
  period,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  period: TimePeriod;
}) {
  if (!active || !payload?.length || !label) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 shadow-xl">
      <p className="text-xs text-gray-400">
        {formatTimestamp(label, period)}
      </p>
      <p className="mt-1 text-sm font-semibold text-white">
        {payload[0].value.toLocaleString()} views
      </p>
    </div>
  );
}

export default function TrafficChart({
  data,
  loading,
  period,
  onPeriodChange,
}: TrafficChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 animate-skeleton rounded bg-gray-700" />
          <div className="flex gap-1">
            {periods.map((p) => (
              <div
                key={p.value}
                className="h-8 w-12 animate-skeleton rounded-md bg-gray-700"
              />
            ))}
          </div>
        </div>
        <div className="mt-4 h-64 animate-skeleton rounded bg-gray-700/50" />
      </div>
    );
  }

  const chartData = (data || []).map((point) => ({
    ...point,
    timestamp: point.timestamp,
  }));

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Traffic Over Time</h3>
        <div className="flex gap-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                period === p.value
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1f2937"
              vertical={false}
            />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts: string) => formatTimestamp(ts, period)}
              stroke="#4b5563"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#4b5563"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) =>
                val >= 1000 ? `${(val / 1000).toFixed(1)}k` : String(val)
              }
            />
            <Tooltip
              content={<CustomTooltip period={period} />}
              cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#viewGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
