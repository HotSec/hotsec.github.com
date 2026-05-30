import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { wsManager } from '@/lib/ws';
import type {
  TrafficMetrics,
  TimeSeriesPoint,
  TopPage,
  TrafficSource,
  GeoData,
  DeviceStats,
  TimePeriod,
  WsTrafficEvent,
} from '@/types';

export function useRealtimeMetrics(siteId: string | undefined) {
  const queryClient = useQueryClient();

  const handleWsMessage = useCallback(
    (event: WsTrafficEvent) => {
      if (event.siteId === siteId && event.type === 'metrics_update') {
        queryClient.setQueryData(
          ['traffic', 'metrics', siteId],
          event.payload as TrafficMetrics,
        );
      }
    },
    [siteId, queryClient],
  );

  useEffect(() => {
    if (!siteId) return;
    const unsubscribe = wsManager.subscribe(handleWsMessage);
    wsManager.connect();
    return unsubscribe;
  }, [siteId, handleWsMessage]);

  return useQuery<TrafficMetrics>({
    queryKey: ['traffic', 'metrics', siteId],
    queryFn: () => apiClient.get<TrafficMetrics>(`/api/sites/${siteId}/metrics`),
    enabled: !!siteId,
    refetchInterval: 30_000,
  });
}

export function useTimeSeries(siteId: string | undefined, period: TimePeriod) {
  return useQuery<TimeSeriesPoint[]>({
    queryKey: ['traffic', 'timeseries', siteId, period],
    queryFn: () =>
      apiClient.get<TimeSeriesPoint[]>(
        `/api/sites/${siteId}/timeseries?period=${period}`,
      ),
    enabled: !!siteId,
    refetchInterval: 60_000,
  });
}

export function useTopPages(siteId: string | undefined, period: TimePeriod) {
  return useQuery<TopPage[]>({
    queryKey: ['traffic', 'top-pages', siteId, period],
    queryFn: () =>
      apiClient.get<TopPage[]>(
        `/api/sites/${siteId}/top-pages?period=${period}`,
      ),
    enabled: !!siteId,
  });
}

export function useTrafficSources(siteId: string | undefined, period: TimePeriod) {
  return useQuery<TrafficSource[]>({
    queryKey: ['traffic', 'sources', siteId, period],
    queryFn: () =>
      apiClient.get<TrafficSource[]>(
        `/api/sites/${siteId}/sources?period=${period}`,
      ),
    enabled: !!siteId,
  });
}

export function useGeoData(siteId: string | undefined, period: TimePeriod) {
  return useQuery<GeoData[]>({
    queryKey: ['traffic', 'geo', siteId, period],
    queryFn: () =>
      apiClient.get<GeoData[]>(`/api/sites/${siteId}/geo?period=${period}`),
    enabled: !!siteId,
  });
}

export function useDeviceStats(siteId: string | undefined, period: TimePeriod) {
  return useQuery<DeviceStats[]>({
    queryKey: ['traffic', 'devices', siteId, period],
    queryFn: () =>
      apiClient.get<DeviceStats[]>(
        `/api/sites/${siteId}/devices?period=${period}`,
      ),
    enabled: !!siteId,
  });
}
