import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { TrafficSource } from '@/types';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4', '#a855f7'];

interface SourceChartProps {
  data: TrafficSource[] | undefined;
  loading?: boolean;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: TrafficSource }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold text-white">{item.source}</p>
      <p className="mt-1 text-xs text-gray-400">
        {item.views.toLocaleString()} views ({item.percentage.toFixed(1)}%)
      </p>
    </div>
  );
}

export default function SourceChart({ data, loading }: SourceChartProps) {
  if (loading) {
    return (
      <div className="chart-container">
        <div className="h-5 w-32 animate-skeleton rounded bg-gray-700" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-20 animate-skeleton rounded bg-gray-700" />
              <div className="h-6 flex-1 animate-skeleton rounded bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const chartData = (data || []).map((item) => ({
    ...item,
    source: item.source.length > 15 ? item.source.slice(0, 15) + '…' : item.source,
  }));

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-gray-200">Traffic Sources</h3>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
          >
            <XAxis
              type="number"
              stroke="#4b5563"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: number) => `${val}%`}
            />
            <YAxis
              type="category"
              dataKey="source"
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(107, 114, 128, 0.1)' }} />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
