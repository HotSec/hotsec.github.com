package config

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                  string
	GinMode               string
	DatabaseURL           string
	ClickHouseURL         string
	RedisURL              string
	JWTSecret             string
	JWTExpiresIn          time.Duration
	JWTRefreshExpiresIn   time.Duration
	CORSAllowedOrigins    []string
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		DatabaseURL:        requiredEnv("DATABASE_URL"),
		ClickHouseURL:      requiredEnv("CLICKHOUSE_URL"),
		RedisURL:           requiredEnv("REDIS_URL"),
		JWTSecret:          requiredEnv("JWT_SECRET"),
		JWTExpiresIn:       parseDuration("JWT_EXPIRES_IN", "15m"),
		JWTRefreshExpiresIn: parseDuration("JWT_REFRESH_EXPIRES_IN", "168h"),
		CORSAllowedOrigins: parseOrigins(getEnv("CORS_ALLOWED_ORIGINS", "")),
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return fallback
}

func requiredEnv(key string) string {
	val, ok := os.LookupEnv(key)
	if !ok || val == "" {
		panic(fmt.Sprintf("required environment variable %s is not set", key))
	}
	return val
}

func parseDuration(envKey, fallback string) time.Duration {
	raw := getEnv(envKey, fallback)
	d, err := time.ParseDuration(raw)
	if err != nil {
		panic(fmt.Sprintf("invalid duration for %s=%q: %v", envKey, raw, err))
	}
	return d
}

func parseOrigins(raw string) []string {
	if raw == "" {
		return []string{}
	}
	parts := strings.Split(raw, ",")
	origins := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}

func (c *Config) IsDevelopment() bool {
	return c.GinMode == "debug" || c.GinMode == ""
}
