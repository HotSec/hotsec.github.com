package dashboard

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

type DashboardService struct {
	conn clickhouse.Conn
}

func NewDashboardService(conn clickhouse.Conn) *DashboardService {
	return &DashboardService{conn: conn}
}

func (s *DashboardService) GetRealtimeMetrics(ctx context.Context, siteID string) (RealtimeMetrics, error) {
	now := time.Now()
	currentStart := now.Add(-1 * time.Hour)
	prevStart := now.Add(-2 * time.Hour)
	prevEnd := now.Add(-1 * time.Hour)

	current, err := s.queryMetrics(ctx, siteID, currentStart, now)
	if err != nil {
		return RealtimeMetrics{}, err
	}

	previous, err := s.queryMetrics(ctx, siteID, prevStart, prevEnd)
	if err != nil {
		return RealtimeMetrics{}, err
	}

	var viewsChange, visitorsChange float64
	if previous.TotalViews > 0 {
		viewsChange = float64(current.TotalViews-previous.TotalViews) / float64(previous.TotalViews) * 100
	}
	if previous.UniqueVisitors > 0 {
		visitorsChange = float64(current.UniqueVisitors-previous.UniqueVisitors) / float64(previous.UniqueVisitors) * 100
	}

	return RealtimeMetrics{
		TotalViews:            current.TotalViews,
		UniqueVisitors:        current.UniqueVisitors,
		AvgDuration:           current.AvgDuration,
		BounceRate:            current.BounceRate,
		ViewsChangePercent:    round2(viewsChange),
		VisitorsChangePercent: round2(visitorsChange),
	}, nil
}

type metricsRow struct {
	TotalViews     int64
	UniqueVisitors int64
	AvgDuration    float64
	BounceRate     float64
}

func (s *DashboardService) queryMetrics(ctx context.Context, siteID string, start, end time.Time) (metricsRow, error) {
	var m metricsRow

	row := s.conn.QueryRow(ctx, `
		SELECT
			COUNT(*) as total_views,
			uniqExact(session_id) as unique_visitors,
			avg(duration_ms) as avg_duration
		FROM page_views
		WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
	`,
		siteID, start, end,
	)

	if err := row.Scan(&m.TotalViews, &m.UniqueVisitors, &m.AvgDuration); err != nil {
		logger.S.Errorw("failed to query realtime metrics", "error", err)
		return metricsRow{}, errors.InternalError("failed to query metrics")
	}

	var totalSessions int64
	var bouncedSessions int64

	sessionRow := s.conn.QueryRow(ctx, `
		SELECT
			COUNT(*) as total_sessions,
			SUM(CASE WHEN page_count = 1 THEN 1 ELSE 0 END) as bounced_sessions
		FROM (
			SELECT session_id, COUNT(*) as page_count
			FROM page_views
			WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
			GROUP BY session_id
		)
	`,
		siteID, start, end,
	)

	if err := sessionRow.Scan(&totalSessions, &bouncedSessions); err != nil {
		logger.S.Errorw("failed to query bounce rate", "error", err)
		return metricsRow{}, errors.InternalError("failed to query bounce rate")
	}

	if totalSessions > 0 {
		m.BounceRate = round2(float64(bouncedSessions) / float64(totalSessions) * 100)
	}

	return m, nil
}

func (s *DashboardService) GetTimeSeries(ctx context.Context, siteID string, period string) ([]TimeSeriesPoint, error) {
	interval, start, err := parsePeriod(period)
	if err != nil {
		return nil, err
	}

	query := fmt.Sprintf(`
		SELECT
			toTimeStart(timestamp, INTERVAL %s) as bucket,
			COUNT(*) as value
		FROM page_views
		WHERE site_id = ? AND timestamp >= ?
		GROUP BY bucket
		ORDER BY bucket
	`, interval)

	rows, err := s.conn.Query(ctx, query, siteID, start)
	if err != nil {
		logger.S.Errorw("failed to query time series", "error", err)
		return nil, errors.InternalError("failed to query time series")
	}
	defer rows.Close()

	var points []TimeSeriesPoint
	for rows.Next() {
		var p TimeSeriesPoint
		if err := rows.Scan(&p.Timestamp, &p.Value); err != nil {
			logger.S.Errorw("failed to scan time series row", "error", err)
			continue
		}
		points = append(points, p)
	}

	return points, nil
}

func (s *DashboardService) GetTopPages(ctx context.Context, siteID string, period string, limit int) ([]TopPage, error) {
	_, start, err := parsePeriod(period)
	if err != nil {
		return nil, err
	}

	if limit <= 0 {
		limit = 10
	}

	rows, err := s.conn.Query(ctx, `
		SELECT
			page_url,
			COUNT(*) as views,
			uniqExact(session_id) as unique_visitors,
			avg(duration_ms) as avg_duration
		FROM page_views
		WHERE site_id = ? AND timestamp >= ?
		GROUP BY page_url
		ORDER BY views DESC
		LIMIT ?
	`,
		siteID, start, uint64(limit),
	)
	if err != nil {
		logger.S.Errorw("failed to query top pages", "error", err)
		return nil, errors.InternalError("failed to query top pages")
	}
	defer rows.Close()

	var pages []TopPage
	for rows.Next() {
		var p TopPage
		if err := rows.Scan(&p.URL, &p.Views, &p.UniqueVisitors, &p.AvgDuration); err != nil {
			logger.S.Errorw("failed to scan top page row", "error", err)
			continue
		}
		pages = append(pages, p)
	}

	return pages, nil
}

func (s *DashboardService) GetTrafficSources(ctx context.Context, siteID string, period string) ([]TrafficSource, error) {
	_, start, err := parsePeriod(period)
	if err != nil {
		return nil, err
	}

	rows, err := s.conn.Query(ctx, `
		SELECT
			CASE WHEN referrer = '' THEN 'direct' ELSE domain(referrer) END as source,
			COUNT(*) as views
		FROM page_views
		WHERE site_id = ? AND timestamp >= ?
		GROUP BY source
		ORDER BY views DESC
	`,
		siteID, start,
	)
	if err != nil {
		logger.S.Errorw("failed to query traffic sources", "error", err)
		return nil, errors.InternalError("failed to query traffic sources")
	}
	defer rows.Close()

	var sources []TrafficSource
	var totalViews int64

	for rows.Next() {
		var src TrafficSource
		if err := rows.Scan(&src.Source, &src.Views); err != nil {
			logger.S.Errorw("failed to scan traffic source row", "error", err)
			continue
		}
		totalViews += src.Views
		sources = append(sources, src)
	}

	for i := range sources {
		if totalViews > 0 {
			sources[i].Percentage = round2(float64(sources[i].Views) / float64(totalViews) * 100)
		}
	}

	return sources, nil
}

func (s *DashboardService) GetGeoData(ctx context.Context, siteID string, period string) ([]GeoData, error) {
	_, start, err := parsePeriod(period)
	if err != nil {
		return nil, err
	}

	rows, err := s.conn.Query(ctx, `
		SELECT
			country,
			COUNT(*) as views
		FROM page_views
		WHERE site_id = ? AND timestamp >= ?
		GROUP BY country
		ORDER BY views DESC
	`,
		siteID, start,
	)
	if err != nil {
		logger.S.Errorw("failed to query geo data", "error", err)
		return nil, errors.InternalError("failed to query geo data")
	}
	defer rows.Close()

	var geoData []GeoData
	var totalViews int64

	for rows.Next() {
		var g GeoData
		if err := rows.Scan(&g.Country, &g.Views); err != nil {
			logger.S.Errorw("failed to scan geo data row", "error", err)
			continue
		}
		totalViews += g.Views
		geoData = append(geoData, g)
	}

	for i := range geoData {
		if totalViews > 0 {
			geoData[i].Percentage = round2(float64(geoData[i].Views) / float64(totalViews) * 100)
		}
	}

	return geoData, nil
}

func (s *DashboardService) GetDeviceStats(ctx context.Context, siteID string, period string) ([]DeviceStats, error) {
	_, start, err := parsePeriod(period)
	if err != nil {
		return nil, err
	}

	rows, err := s.conn.Query(ctx, `
		SELECT
			device_type,
			browser,
			os,
			COUNT(*) as views
		FROM page_views
		WHERE site_id = ? AND timestamp >= ?
		GROUP BY device_type, browser, os
		ORDER BY views DESC
	`,
		siteID, start,
	)
	if err != nil {
		logger.S.Errorw("failed to query device stats", "error", err)
		return nil, errors.InternalError("failed to query device stats")
	}
	defer rows.Close()

	var stats []DeviceStats
	for rows.Next() {
		var d DeviceStats
		if err := rows.Scan(&d.DeviceType, &d.Browser, &d.OS, &d.Views); err != nil {
			logger.S.Errorw("failed to scan device stats row", "error", err)
			continue
		}
		stats = append(stats, d)
	}

	return stats, nil
}

func parsePeriod(period string) (string, time.Time, error) {
	now := time.Now()

	switch strings.ToLower(period) {
	case "1h":
		return "1 MINUTE", now.Add(-1 * time.Hour), nil
	case "24h":
		return "1 HOUR", now.Add(-24 * time.Hour), nil
	case "7d":
		return "1 HOUR", now.Add(-7 * 24 * time.Hour), nil
	case "30d":
		return "1 DAY", now.Add(-30 * 24 * time.Hour), nil
	default:
		return "", time.Time{}, errors.ValidationError([]errors.FieldError{
			{Field: "period", Message: "invalid period, must be one of: 1h, 24h, 7d, 30d"},
		})
	}
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
