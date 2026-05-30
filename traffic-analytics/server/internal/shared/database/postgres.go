package database

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/traffic-analytics/server/internal/shared/logger"
)

func NewPostgresPool(databaseURL string) *pgxpool.Pool {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		logger.S.Fatalf("failed to parse database URL: %v", err)
	}

	config.MaxConns = 20
	config.MinConns = 5
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = 30 * time.Minute
	config.HealthCheckPeriod = 30 * time.Second

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		logger.S.Fatalf("failed to create postgres pool: %v", err)
	}

	if err := pool.Ping(ctx); err != nil {
		logger.S.Fatalf("failed to ping postgres: %v", err)
	}

	logger.S.Info("postgres connection pool established")
	return pool
}

func PostgresHealthCheck(pool *pgxpool.Pool) map[string]interface{} {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result := map[string]interface{}{
		"status": "up",
	}

	if err := pool.Ping(ctx); err != nil {
		result["status"] = "down"
		result["error"] = err.Error()
		return result
	}

	stat := pool.Stat()
	result["total_conns"] = stat.TotalConns()
	result["idle_conns"] = stat.IdleConns()
	result["acquired_conns"] = stat.AcquiredConns()
	result["max_conns"] = fmt.Sprintf("%d", stat.MaxConns())

	return result
}
