import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Eye, Users, Clock, MousePointerClick, Monitor, Smartphone, Tablet } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import TrafficChart from '@/components/TrafficChart';
import TopPagesTable from '@/components/TopPagesTable';
import SourceChart from '@/components/SourceChart';
import GeoMap from '@/components/GeoMap';
import {
  useRealtimeMetrics,
  useTimeSeries,
  useTopPages,
  useTrafficSources,
  useGeoData,
  useDeviceStats,
} from '@/hooks/useTraffic';
import type { Site, TimePeriod } from '@/types';

interface OutletContext {
  selectedSite: Site | null;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function DeviceIcon({ type }: { type: string }) {
  const lower = type.toLowerCase();
  if (lower.includes('mobile') || lower.includes('phone')) return <Smartphone className="h-4 w-4" />;
  if (lower.includes('tablet') || lower.includes('ipad')) return <Tablet className="h-4 w-4" />;
  return <Monitor className="h-4 w-4" />;
}

export default function Dashboard() {
  const { selectedSite } = useOutletContext<OutletContext>();
  const [period, setPeriod] = useState<TimePeriod>('24h');
  const siteId = selectedSite?.id;

  const metricsQuery = useRealtimeMetrics(siteId);
  const timeSeriesQuery = useTimeSeries(siteId, period);
  const topPagesQuery = useTopPages(siteId, period);
  const sourcesQuery = useTrafficSources(siteId, period);
  const geoQuery = useGeoData(siteId, period);
  const devicesQuery = useDeviceStats(siteId, period);

  const metrics = metricsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {selectedSite
            ? `Real-time analytics for ${selectedSite.domain}`
            : 'Select a site to view analytics'}
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value={metrics ? formatNumber(metrics.totalViews) : '—'}
          changePercent={metrics?.viewsChangePercent}
          icon={Eye}
          loading={metricsQuery.isLoading}
        />
        <MetricCard
          title="Unique Visitors"
          value={metrics ? formatNumber(metrics.uniqueVisitors) : '—'}
          changePercent={metrics?.visitorsChangePercent}
          icon={Users}
          loading={metricsQuery.isLoading}
        />
        <MetricCard
          title="Avg Duration"
          value={metrics ? formatDuration(metrics.avgDuration) : '—'}
          icon={Clock}
          loading={metricsQuery.isLoading}
        />
        <MetricCard
          title="Bounce Rate"
          value={metrics ? `${metrics.bounceRate.toFixed(1)}%` : '—'}
          icon={MousePointerClick}
          loading={metricsQuery.isLoading}
        />
      </div>

      {/* Traffic Chart */}
      <TrafficChart
        data={timeSeriesQuery.data}
        loading={timeSeriesQuery.isLoading}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* Top Pages */}
      <TopPagesTable
        data={topPagesQuery.data}
        loading={topPagesQuery.isLoading}
      />

      {/* Sources & Geo side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SourceChart
          data={sourcesQuery.data}
          loading={sourcesQuery.isLoading}
        />
        <GeoMap data={geoQuery.data} loading={geoQuery.isLoading} />
      </div>

      {/* Device Stats */}
      <div className="chart-container">
        <h3 className="text-sm font-semibold text-gray-200">Device Breakdown</h3>
        {devicesQuery.isLoading ? (
          <div className="mt-4 grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-skeleton rounded-lg bg-gray-700" />
            ))}
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aggregateByDevice(devicesQuery.data || []).map((item) => (
              <div
                key={item.deviceType}
                className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-800/30 px-4 py-3"
              >
                <div className="rounded-lg bg-gray-700 p-2 text-gray-400">
                  <DeviceIcon type={item.deviceType} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">
                    {item.deviceType}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.views.toLocaleString()} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function aggregateByDevice(
  devices: { deviceType: string; browser: string; os: string; views: number }[],
) {
  const map = new Map<string, number>();
  for (const d of devices) {
    map.set(d.deviceType, (map.get(d.deviceType) || 0) + d.views);
  }
  return Array.from(map.entries())
    .map(([deviceType, views]) => ({ deviceType, views }))
    .sort((a, b) => b.views - a.views);
}
