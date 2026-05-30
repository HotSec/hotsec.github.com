import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { Calendar, Download, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { Eye, Users, Clock, MousePointerClick } from 'lucide-react';
import {
  useTimeSeries,
  useTopPages,
  useTrafficSources,
  useGeoData,
} from '@/hooks/useTraffic';
import { useComparisonData } from '@/hooks/useAnalytics';
import type { Site, TimePeriod } from '@/types';

interface OutletContext {
  selectedSite: Site | null;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

export default function Analytics() {
  const { selectedSite } = useOutletContext<OutletContext>();
  const siteId = selectedSite?.id;

  const today = new Date();
  const [endDate, setEndDate] = useState(format(today, 'yyyy-MM-dd'));
  const [startDate, setStartDate] = useState(format(subDays(today, 30), 'yyyy-MM-dd'));
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [comparisonMode, setComparisonMode] = useState(false);

  const daysDiff = Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const previousStart = format(
    subDays(new Date(startDate), daysDiff),
    'yyyy-MM-dd',
  );
  const previousEnd = startDate;

  const timeSeriesQuery = useTimeSeries(siteId, period);
  const topPagesQuery = useTopPages(siteId, period);
  const sourcesQuery = useTrafficSources(siteId, period);
  const geoQuery = useGeoData(siteId, period);

  const comparisonQuery = useComparisonData(
    siteId,
    { start: startDate, end: endDate },
    { start: previousStart, end: previousEnd },
  );

  const currentMetrics = comparisonQuery.data?.current;
  const previousMetrics = comparisonQuery.data?.previous;

  const chartData = (timeSeriesQuery.data || []).map((point) => ({
    timestamp: format(parseISO(point.timestamp), 'MMM d'),
    views: point.value,
  }));

  const sourceChartData = (sourcesQuery.data || []).map((s) => ({
    name: s.source,
    views: s.views,
    percentage: s.percentage,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detailed traffic analysis and comparisons
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-0 bg-transparent text-sm text-gray-200 focus:outline-none"
            />
            <span className="text-gray-500">→</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-0 bg-transparent text-sm text-gray-200 focus:outline-none"
            />
          </div>

          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              comparisonMode
                ? 'border-primary-600 bg-primary-600/20 text-primary-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Compare
          </button>

          <button className="btn-secondary gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Comparison Metrics */}
      {comparisonMode && comparisonQuery.data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ComparisonCard
            title="Total Views"
            current={currentMetrics?.totalViews}
            previous={previousMetrics?.totalViews}
            format={formatNumber}
            icon={Eye}
          />
          <ComparisonCard
            title="Unique Visitors"
            current={currentMetrics?.uniqueVisitors}
            previous={previousMetrics?.uniqueVisitors}
            format={formatNumber}
            icon={Users}
          />
          <ComparisonCard
            title="Avg Duration"
            current={currentMetrics?.avgDuration}
            previous={previousMetrics?.avgDuration}
            format={formatDuration}
            icon={Clock}
          />
          <ComparisonCard
            title="Bounce Rate"
            current={currentMetrics?.bounceRate}
            previous={previousMetrics?.bounceRate}
            format={(v) => `${v.toFixed(1)}%`}
            icon={MousePointerClick}
          />
        </div>
      )}

      {/* Non-comparison metrics */}
      {!comparisonMode && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Views"
            value={currentMetrics ? formatNumber(currentMetrics.totalViews) : '—'}
            changePercent={currentMetrics?.viewsChangePercent}
            icon={Eye}
            loading={comparisonQuery.isLoading}
          />
          <MetricCard
            title="Unique Visitors"
            value={currentMetrics ? formatNumber(currentMetrics.uniqueVisitors) : '—'}
            changePercent={currentMetrics?.visitorsChangePercent}
            icon={Users}
            loading={comparisonQuery.isLoading}
          />
          <MetricCard
            title="Avg Duration"
            value={currentMetrics ? formatDuration(currentMetrics.avgDuration) : '—'}
            icon={Clock}
            loading={comparisonQuery.isLoading}
          />
          <MetricCard
            title="Bounce Rate"
            value={currentMetrics ? `${currentMetrics.bounceRate.toFixed(1)}%` : '—'}
            icon={MousePointerClick}
            loading={comparisonQuery.isLoading}
          />
        </div>
      )}

      {/* Period selector */}
      <div className="flex gap-1">
        {(['1h', '24h', '7d', '30d'] as TimePeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p
                ? 'bg-primary-600/20 text-primary-400'
                : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
            }`}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Traffic Chart */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-gray-200">Page Views Over Time</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#4b5563" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#analyticsGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source bar chart */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-gray-200">Traffic Sources Breakdown</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sourceChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" stroke="#4b5563" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#4b5563" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }} />
              <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Pages Table */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-gray-200">Top Pages</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="table-header text-left">Page URL</th>
                <th className="table-header text-right">Views</th>
                <th className="table-header text-right">Unique Visitors</th>
                <th className="table-header text-right">Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              {(topPagesQuery.data || []).map((page, idx) => (
                <tr key={`${page.url}-${idx}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="table-cell max-w-xs truncate font-medium text-gray-200">{page.url}</td>
                  <td className="table-cell text-right tabular-nums">{page.views.toLocaleString()}</td>
                  <td className="table-cell text-right tabular-nums">{page.uniqueVisitors.toLocaleString()}</td>
                  <td className="table-cell text-right tabular-nums">{formatDuration(page.avgDuration)}</td>
                </tr>
              ))}
              {(!topPagesQuery.data || topPagesQuery.data.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geo */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-gray-200">Geographic Distribution</h3>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(geoQuery.data || []).map((item) => (
            <div key={item.country} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/30 px-3 py-2">
              <span className="text-lg">🌍</span>
              <span className="flex-1 text-sm text-gray-300">{item.country}</span>
              <span className="text-sm tabular-nums text-gray-400">{item.views.toLocaleString()}</span>
              <span className="text-xs tabular-nums text-gray-500">{item.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonCard({
  title,
  current,
  previous,
  format: fmt,
  icon: Icon,
}: {
  title: string;
  current?: number;
  previous?: number;
  format: (v: number) => string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const hasData = current !== undefined && previous !== undefined;
  const change = hasData && previous !== 0 ? ((current! - previous!) / previous!) * 100 : undefined;
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <div className="rounded-lg bg-gray-800 p-2">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-3">
        <p className="text-2xl font-bold text-white">
          {current !== undefined ? fmt(current) : '—'}
        </p>
        {previous !== undefined && (
          <p className="text-sm text-gray-500 line-through">{fmt(previous)}</p>
        )}
      </div>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-accent-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-rose-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-accent-500' : 'text-rose-500'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
