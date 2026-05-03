package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port        string
	DataDir     string
	StaticDir   string
	MarkdownDir string
	JWTSecret   string
	WSReadSize  int
	WSWriteSize int
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8080"),
		DataDir:     getEnv("DATA_DIR", "../data"),
		StaticDir:   getEnv("STATIC_DIR", "../public"),
		MarkdownDir: getEnv("MARKDOWN_DIR", "../../src"),
		JWTSecret:   getEnv("JWT_SECRET", "onlinenote-secret-key-change-in-production"),
		WSReadSize:  getEnvInt("WS_READ_SIZE", 1024*1024),
		WSWriteSize: getEnvInt("WS_WRITE_SIZE", 1024*1024),
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
