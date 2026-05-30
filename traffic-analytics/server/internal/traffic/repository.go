package traffic

import (
	"context"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"

	"github.com/traffic-analytics/server/internal/shared/logger"
)

type TrafficRepository struct {
	conn clickhouse.Conn
}

func NewTrafficRepository(conn clickhouse.Conn) *TrafficRepository {
	return &TrafficRepository{conn: conn}
}

func (r *TrafficRepository) Insert(ctx context.Context, event IngestRequest) error {
	return r.conn.Exec(ctx, `
		INSERT INTO page_views (timestamp, site_id, session_id, page_url, referrer, utm_source, utm_medium, utm_campaign, country, city, device_type, browser, os, duration_ms)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`,
		time.Now(),
		event.SiteID,
		event.SessionID,
		event.PageURL,
		event.Referrer,
		event.UTMSource,
		event.UTMMedium,
		event.UTMCampaign,
		event.Country,
		event.City,
		event.DeviceType,
		event.Browser,
		event.OS,
		event.DurationMs,
	)
}

func (r *TrafficRepository) InsertBatch(ctx context.Context, events []IngestRequest) error {
	batch, err := r.conn.PrepareBatch(ctx, `
		INSERT INTO page_views (timestamp, site_id, session_id, page_url, referrer, utm_source, utm_medium, utm_campaign, country, city, device_type, browser, os, duration_ms)
	`)
	if err != nil {
		logger.S.Errorw("failed to prepare clickhouse batch", "error", err)
		return err
	}

	now := time.Now()
	for _, event := range events {
		if err := batch.Append(
			now,
			event.SiteID,
			event.SessionID,
			event.PageURL,
			event.Referrer,
			event.UTMSource,
			event.UTMMedium,
			event.UTMCampaign,
			event.Country,
			event.City,
			event.DeviceType,
			event.Browser,
			event.OS,
			event.DurationMs,
		); err != nil {
			logger.S.Errorw("failed to append event to batch", "error", err)
			return err
		}
	}

	if err := batch.Send(); err != nil {
		logger.S.Errorw("failed to send clickhouse batch", "error", err)
		return err
	}

	return nil
}
