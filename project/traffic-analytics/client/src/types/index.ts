export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Site {
  id: string;
  userId: string;
  domain: string;
  name: string;
  trackingId: string;
}

export interface PageView {
  timestamp: string;
  siteId: string;
  sessionId: string;
  pageUrl: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  os: string;
  durationMs: number;
}

export interface TrafficMetrics {
  totalViews: number;
  uniqueVisitors: number;
  avgDuration: number;
  bounceRate: number;
  viewsChangePercent: number;
  visitorsChangePercent: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

export interface TopPage {
  url: string;
  views: number;
  uniqueVisitors: number;
  avgDuration: number;
}

export interface TrafficSource {
  source: string;
  views: number;
  percentage: number;
}

export interface GeoData {
  country: string;
  views: number;
  percentage: number;
}

export interface DeviceStats {
  deviceType: string;
  browser: string;
  os: string;
  views: number;
}

export interface AlertRule {
  id: string;
  siteId: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq';
  threshold: number;
  enabled: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface IngestPayload {
  siteId: string;
  sessionId: string;
  pageUrl: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  country: string;
  city: string;
  deviceType: string;
  browser: string;
  os: string;
  durationMs: number;
}

export type TimePeriod = '1h' | '24h' | '7d' | '30d';

export interface WsTrafficEvent {
  type: 'pageview' | 'metrics_update';
  siteId: string;
  payload: PageView | TrafficMetrics;
}
