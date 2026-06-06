package analytics

import (
	"context"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"

	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

type AnalyticsService struct {
	conn clickhouse.Conn
}

func NewAnalyticsService(conn clickhouse.Conn) *AnalyticsService {
	return &AnalyticsService{conn: conn}
}

func (s *AnalyticsService) GetOverview(ctx context.Context, siteID string, startDate, endDate time.Time) (AnalyticsOverview, error) {
	var overview AnalyticsOverview

	row := s.conn.QueryRow(ctx, `
		SELECT
			COUNT(*) as total_views,
			uniqExact(session_id) as unique_visitors,
			avg(duration_ms) as avg_duration
		FROM page_views
		WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
	`,
		siteID, startDate, endDate,
	)

	if err := row.Scan(&overview.TotalViews, &overview.UniqueVisitors, &overview.AvgDuration); err != nil {
		logger.S.Errorw("failed to query analytics overview", "error", err)
		return AnalyticsOverview{}, errors.InternalError("failed to query overview")
	}

	sessionRow := s.conn.QueryRow(ctx, `
		SELECT
			COUNT(*) as total_sessions,
			SUM(CASE WHEN page_count = 1 THEN 1 ELSE 0 END) as bounced_sessions,
			avg(page_count) as avg_pages
		FROM (
			SELECT session_id, COUNT(*) as page_count
			FROM page_views
			WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
			GROUP BY session_id
		)
	`,
		siteID, startDate, endDate,
	)

	var totalSessions int64
	var bouncedSessions int64
	var avgPages float64

	if err := sessionRow.Scan(&totalSessions, &bouncedSessions, &avgPages); err != nil {
		logger.S.Errorw("failed to query session stats", "error", err)
		return AnalyticsOverview{}, errors.InternalError("failed to query session stats")
	}

	overview.TotalSessions = totalSessions
	overview.AvgPagesPerSession = round2(avgPages)

	if totalSessions > 0 {
		overview.BounceRate = round2(float64(bouncedSessions) / float64(totalSessions) * 100)
	}

	return overview, nil
}

func (s *AnalyticsService) GetComparison(ctx context.Context, siteID string, currentStart, currentEnd, prevStart, prevEnd time.Time) (ComparisonData, error) {
	current, err := s.queryMetrics(ctx, siteID, currentStart, currentEnd)
	if err != nil {
		return ComparisonData{}, err
	}

	previous, err := s.queryMetrics(ctx, siteID, prevStart, prevEnd)
	if err != nil {
		return ComparisonData{}, err
	}

	changes := make(map[string]float64)
	if previous.TotalViews > 0 {
		changes["total_views"] = round2(float64(current.TotalViews-previous.TotalViews) / float64(previous.TotalViews) * 100)
	}
	if previous.UniqueVisitors > 0 {
		changes["unique_visitors"] = round2(float64(current.UniqueVisitors-previous.UniqueVisitors) / float64(previous.UniqueVisitors) * 100)
	}
	if previous.AvgDuration > 0 {
		changes["avg_duration"] = round2((current.AvgDuration - previous.AvgDuration) / previous.AvgDuration * 100)
	}
	if previous.BounceRate > 0 {
		changes["bounce_rate"] = round2(current.BounceRate - previous.BounceRate)
	}
	if previous.TotalSessions > 0 {
		changes["total_sessions"] = round2(float64(current.TotalSessions-previous.TotalSessions) / float64(previous.TotalSessions) * 100)
	}

	return ComparisonData{
		Current:  current,
		Previous: previous,
		Changes:  changes,
	}, nil
}

func (s *AnalyticsService) queryMetrics(ctx context.Context, siteID string, start, end time.Time) (RealtimeMetrics, error) {
	var m RealtimeMetrics

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
		logger.S.Errorw("failed to query comparison metrics", "error", err)
		return RealtimeMetrics{}, errors.InternalError("failed to query metrics")
	}

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

	var totalSessions int64
	var bouncedSessions int64

	if err := sessionRow.Scan(&totalSessions, &bouncedSessions); err != nil {
		logger.S.Errorw("failed to query session stats for comparison", "error", err)
		return RealtimeMetrics{}, errors.InternalError("failed to query session stats")
	}

	m.TotalSessions = totalSessions
	if totalSessions > 0 {
		m.BounceRate = round2(float64(bouncedSessions) / float64(totalSessions) * 100)
	}

	return m, nil
}

func (s *AnalyticsService) GetDailyStats(ctx context.Context, siteID string, startDate, endDate time.Time) ([]DailyStats, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT
			toString(toDate(timestamp)) as date,
			COUNT(*) as views,
			uniqExact(session_id) as unique_visitors,
			avg(duration_ms) as avg_duration
		FROM page_views
		WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
		GROUP BY date
		ORDER BY date
	`,
		siteID, startDate, endDate,
	)
	if err != nil {
		logger.S.Errorw("failed to query daily stats", "error", err)
		return nil, errors.InternalError("failed to query daily stats")
	}
	defer rows.Close()

	var stats []DailyStats
	for rows.Next() {
		var ds DailyStats
		if err := rows.Scan(&ds.Date, &ds.Views, &ds.UniqueVisitors, &ds.AvgDuration); err != nil {
			logger.S.Errorw("failed to scan daily stats row", "error", err)
			continue
		}
		stats = append(stats, ds)
	}

	sessionRows, err := s.conn.Query(ctx, `
		SELECT
			toString(toDate(timestamp)) as date,
			COUNT(*) as total_sessions,
			SUM(CASE WHEN page_count = 1 THEN 1 ELSE 0 END) as bounced_sessions
		FROM (
			SELECT timestamp, session_id, COUNT(*) as page_count
			FROM page_views
			WHERE site_id = ? AND timestamp >= ? AND timestamp < ?
			GROUP BY timestamp, session_id
		)
		GROUP BY date
		ORDER BY date
	`,
		siteID, startDate, endDate,
	)
	if err != nil {
		logger.S.Warnw("failed to query daily bounce rate, skipping", "error", err)
		return stats, nil
	}
	defer sessionRows.Close()

	type bounceEntry struct {
		Date           string
		TotalSessions  int64
		BouncedSessions int64
	}
	var bounceEntries []bounceEntry
	for sessionRows.Next() {
		var be bounceEntry
		if err := sessionRows.Scan(&be.Date, &be.TotalSessions, &be.BouncedSessions); err != nil {
			continue
		}
		bounceEntries = append(bounceEntries, be)
	}

	bounceMap := make(map[string]bounceEntry, len(bounceEntries))
	for _, be := range bounceEntries {
		bounceMap[be.Date] = be
	}

	for i := range stats {
		if be, ok := bounceMap[stats[i].Date]; ok && be.TotalSessions > 0 {
			stats[i].BounceRate = round2(float64(be.BouncedSessions) / float64(be.TotalSessions) * 100)
		}
	}

	return stats, nil
}

func round2(v float64) float64 {
	return float64(int(v*100+0.5)) / 100
}
