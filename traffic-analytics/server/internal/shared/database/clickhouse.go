package database

import (
	"context"
	"time"

	"github.com/ClickHouse/clickhouse-go/v2"

	"github.com/traffic-analytics/server/internal/shared/logger"
)

func NewClickHouseConn(clickhouseURL string) clickhouse.Conn {
	options, err := clickhouse.ParseDSN(clickhouseURL)
	if err != nil {
		logger.S.Fatalf("failed to parse clickhouse URL: %v", err)
	}

	options.DialTimeout = 10 * time.Second
	options.MaxOpenConns = 10
	options.MaxIdleConns = 5
	options.ConnMaxLifetime = time.Hour
	options.BlockBufferSize = 2

	if options.Auth.Database == "" {
		options.Auth.Database = "traffic_analytics"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	conn, err := clickhouse.Open(options)
	if err != nil {
		logger.S.Fatalf("failed to open clickhouse connection: %v", err)
	}

	if err := conn.Ping(ctx); err != nil {
		logger.S.Fatalf("failed to ping clickhouse: %v", err)
	}

	logger.S.Info("clickhouse connection established")
	return conn
}

func ClickHouseHealthCheck(conn clickhouse.Conn) map[string]interface{} {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result := map[string]interface{}{
		"status": "up",
	}

	if err := conn.Ping(ctx); err != nil {
		result["status"] = "down"
		result["error"] = err.Error()
		return result
	}

	version, err := conn.ServerVersion()
	if err == nil {
		result["version"] = version.String()
		result["name"] = version.String()
	}

	return result
}
