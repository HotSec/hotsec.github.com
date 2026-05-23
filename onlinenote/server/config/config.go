package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	Port           string
	DataDir        string
	StaticDir      string
	MarkdownDir    string
	JWTSecret      string
	WSReadSize     int
	WSWriteSize    int
	CORSOrigins    []string
	ReadTimeout    int
	WriteTimeout   int
	MaxHeaderBytes int
}

func Load() *Config {
	return &Config{
		Port:           getEnv("PORT", "8080"),
		DataDir:        getEnv("DATA_DIR", "../data"),
		StaticDir:      getEnv("STATIC_DIR", "../public"),
		MarkdownDir:    getEnv("MARKDOWN_DIR", "../../src"),
		JWTSecret:      getEnv("JWT_SECRET", "onlinenote-secret-key-change-in-production"),
		WSReadSize:     getEnvInt("WS_READ_SIZE", 1024*1024),
		WSWriteSize:    getEnvInt("WS_WRITE_SIZE", 1024*1024),
		CORSOrigins:    getEnvSlice("CORS_ORIGINS", []string{"*"}),
		ReadTimeout:    getEnvInt("READ_TIMEOUT", 60),
		WriteTimeout:   getEnvInt("WRITE_TIMEOUT", 60),
		MaxHeaderBytes: getEnvInt("MAX_HEADER_BYTES", 1<<20),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvSlice(key string, fallback []string) []string {
	if v := os.Getenv(key); v != "" {
		parts := strings.Split(v, ",")
		result := make([]string, 0, len(parts))
		for _, p := range parts {
			if trimmed := strings.TrimSpace(p); trimmed != "" {
				result = append(result, trimmed)
			}
		}
		if len(result) > 0 {
			return result
		}
	}
	return fallback
}