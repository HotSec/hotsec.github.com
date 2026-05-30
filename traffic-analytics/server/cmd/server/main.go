package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/traffic-analytics/server/internal/alert"
	"github.com/traffic-analytics/server/internal/analytics"
	"github.com/traffic-analytics/server/internal/auth"
	"github.com/traffic-analytics/server/internal/config"
	"github.com/traffic-analytics/server/internal/dashboard"
	"github.com/traffic-analytics/server/internal/middleware"
	"github.com/traffic-analytics/server/internal/shared/database"
	"github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
	"github.com/traffic-analytics/server/internal/sites"
	"github.com/traffic-analytics/server/internal/traffic"
	"github.com/traffic-analytics/server/internal/ws"
)

func main() {
	cfg := config.Load()

	appLogger := logger.Init(cfg.GinMode)
	defer logger.Sync()

	appLogger.Infow("starting traffic analytics server", "port", cfg.Port, "mode", cfg.GinMode)

	pgPool := database.NewPostgresPool(cfg.DatabaseURL)
	defer pgPool.Close()

	chConn := database.NewClickHouseConn(cfg.ClickHouseURL)
	defer chConn.Close()

	rdb := middleware.NewRedisClient(cfg.RedisURL)
	defer rdb.Close()

	hub := ws.NewHub()
	go hub.Run()

	authRepo := auth.NewPostgresAuthRepository(pgPool)
	authService := auth.NewAuthService(authRepo, cfg)
	authHandler := auth.NewAuthHandler(authService)

	trafficRepo := traffic.NewTrafficRepository(chConn)
	trafficService := traffic.NewTrafficService(trafficRepo, hub)
	trafficHandler := traffic.NewTrafficHandler(trafficService)

	dashboardService := dashboard.NewDashboardService(chConn)
	dashboardHandler := dashboard.NewDashboardHandler(dashboardService)

	analyticsService := analytics.NewAnalyticsService(chConn)
	analyticsHandler := analytics.NewAnalyticsHandler(analyticsService)

	sitesRepo := sites.NewSitesRepository(pgPool)
	sitesService := sites.NewSitesService(sitesRepo)
	sitesHandler := sites.NewSitesHandler(sitesService)

	alertRepo := alert.NewAlertRepository(pgPool)
	alertService := alert.NewAlertService(alertRepo, chConn, hub)
	alertHandler := alert.NewAlertHandler(alertService)

	rateLimiter := middleware.NewRateLimiter(rdb)

	gin.SetMode(cfg.GinMode)
	router := gin.New()

	router.Use(middleware.RequestID())
	router.Use(logger.RequestLogger())
	router.Use(middleware.CORS(cfg))
	router.Use(gin.Recovery())
	router.Use(errors.ErrorHandler())
	router.Use(rateLimiter.IngestLimiter())
	router.Use(middleware.Auth(cfg))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	router.GET("/ready", func(c *gin.Context) {
		checks := gin.H{
			"database":  database.PostgresHealthCheck(pgPool),
			"clickhouse": database.ClickHouseHealthCheck(chConn),
			"redis":     middleware.RedisHealthCheck(rdb),
		}

		allOk := true
		for _, v := range checks {
			if m, ok := v.(map[string]interface{}); ok {
				if m["status"] != "up" {
					allOk = false
					break
				}
			}
		}

		status := http.StatusOK
		if !allOk {
			status = http.StatusServiceUnavailable
		}

		c.JSON(status, gin.H{
			"status": func() string {
				if allOk {
					return "ok"
				}
				return "degraded"
			}(),
			"checks": checks,
		})
	})

	router.GET("/ws", ws.HandleWebSocket(hub, cfg))

	api := router.Group("/api")
	{
		authHandler.RegisterRoutes(api)
		trafficHandler.RegisterRoutes(api)
		dashboardHandler.RegisterRoutes(api)
		analyticsHandler.RegisterRoutes(api)
		sitesHandler.RegisterRoutes(api)
		alertHandler.RegisterRoutes(api)
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		appLogger.Infow("server listening", "port", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Fatalf("server failed to start: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Infow("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		appLogger.Errorw("server forced to shutdown", "error", err)
	}

	appLogger.Infow("server exited gracefully")
}
