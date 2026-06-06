package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"

	appErrors "github.com/traffic-analytics/server/internal/shared/errors"
	"github.com/traffic-analytics/server/internal/shared/logger"
)

type RateLimiter struct {
	rdb *redis.Client
}

func NewRateLimiter(rdb *redis.Client) *RateLimiter {
	return &RateLimiter{rdb: rdb}
}

func (rl *RateLimiter) Middleware(limit int, window time.Duration, keyPrefix string) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		key := fmt.Sprintf("rate_limit:%s:%s", keyPrefix, ip)

		ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
		defer cancel()

		count, err := rl.rdb.Incr(ctx, key).Result()
		if err != nil {
			logger.S.Warnw("rate limiter redis error, allowing request", "error", err.Error())
			c.Next()
			return
		}

		if count == 1 {
			rl.rdb.Expire(ctx, key, window)
		}

		c.Header("X-RateLimit-Limit", fmt.Sprintf("%d", limit))
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", max(0, int64(limit)-count)))

		if count > int64(limit) {
			ttl, _ := rl.rdb.TTL(ctx, key).Result()
			c.Header("Retry-After", fmt.Sprintf("%d", max(1, int64(ttl.Seconds()))))
			appErrors.AbortWithAppError(c, appErrors.RateLimitError())
			return
		}

		c.Next()
	}
}

func (rl *RateLimiter) GeneralLimiter() gin.HandlerFunc {
	return rl.Middleware(100, time.Minute, "general")
}

func (rl *RateLimiter) IngestLimiter() gin.HandlerFunc {
	return func(c *gin.Context) {
		if !strings.HasPrefix(c.Request.URL.Path, "/api/ingest") {
			rl.Middleware(100, time.Minute, "general")(c)
			return
		}
		rl.Middleware(1000, time.Minute, "ingest")(c)
	}
}

func NewRedisClient(redisURL string) *redis.Client {
	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		logger.S.Fatalf("failed to parse redis URL: %v", err)
	}

	opts.MaxRetries = 3
	opts.DialTimeout = 5 * time.Second
	opts.ReadTimeout = 3 * time.Second
	opts.WriteTimeout = 3 * time.Second

	client := redis.NewClient(opts)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		logger.S.Fatalf("failed to ping redis: %v", err)
	}

	logger.S.Info("redis connection established")
	return client
}

func RedisHealthCheck(rdb *redis.Client) map[string]interface{} {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	result := map[string]interface{}{
		"status": "up",
	}

	if err := rdb.Ping(ctx).Err(); err != nil {
		result["status"] = "down"
		result["error"] = err.Error()
		return result
	}

	info, err := rdb.Info(ctx, "server").Result()
	if err == nil {
		for _, line := range strings.Split(info, "\n") {
			if strings.HasPrefix(line, "redis_version:") {
				result["version"] = strings.TrimSpace(strings.TrimPrefix(line, "redis_version:"))
				break
			}
		}
	}

	return result
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

var _ = http.StatusContinue
