import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { TrafficMetrics, Site } from '@/types';

interface AnalyticsOverview {
  metrics: TrafficMetrics;
  site: Site;
}

export function useAnalyticsOverview(
  siteId: string | undefined,
  startDate: string,
  endDate: string,
) {
  return useQuery<AnalyticsOverview>({
    queryKey: ['analytics', 'overview', siteId, startDate, endDate],
    queryFn: () =>
      apiClient.get<AnalyticsOverview>(
        `/api/sites/${siteId}/analytics/overview?start=${startDate}&end=${endDate}`,
      ),
    enabled: !!siteId,
  });
}

interface ComparisonData {
  current: TrafficMetrics;
  previous: TrafficMetrics;
}

export function useComparisonData(
  siteId: string | undefined,
  currentPeriod: { start: string; end: string },
  previousPeriod: { start: string; end: string },
) {
  return useQuery<ComparisonData>({
    queryKey: [
      'analytics',
      'comparison',
      siteId,
      currentPeriod,
      previousPeriod,
    ],
    queryFn: () =>
      apiClient.get<ComparisonData>(
        `/api/sites/${siteId}/analytics/comparison?currentStart=${currentPeriod.start}&currentEnd=${currentPeriod.end}&previousStart=${previousPeriod.start}&previousEnd=${previousPeriod.end}`,
      ),
    enabled: !!siteId,
  });
}
