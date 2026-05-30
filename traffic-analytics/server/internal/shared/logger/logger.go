package logger

import (
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var S *zap.SugaredLogger

func Init(env string) *zap.SugaredLogger {
	var zapConfig zap.Config

	if env == "production" || env == "release" {
		zapConfig = zap.Config{
			Level:            zap.NewAtomicLevelAt(zapcore.InfoLevel),
			Development:      false,
			Encoding:         "json",
			EncoderConfig:    zap.NewProductionEncoderConfig(),
			OutputPaths:      []string{"stdout"},
			ErrorOutputPaths: []string{"stderr"},
		}
	} else {
		zapConfig = zap.Config{
			Level:            zap.NewAtomicLevelAt(zapcore.DebugLevel),
			Development:      true,
			Encoding:         "json",
			EncoderConfig:    zap.NewDevelopmentEncoderConfig(),
			OutputPaths:      []string{"stdout"},
			ErrorOutputPaths: []string{"stderr"},
		}
	}

	zapConfig.EncoderConfig.TimeKey = "timestamp"
	zapConfig.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder

	logger, err := zapConfig.Build()
	if err != nil {
		panic("failed to initialize logger: " + err.Error())
	}

	S = logger.Sugar()
	return S
}

func Sync() {
	if S != nil {
		_ = S.Sync()
	}
}

func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		c.Next()

		duration := time.Since(start)
		statusCode := c.Writer.Status()
		requestID := c.GetString("request_id")

		fields := []interface{}{
			"method", c.Request.Method,
			"path", path,
			"query", raw,
			"status", statusCode,
			"duration_ms", duration.Milliseconds(),
			"request_id", requestID,
			"client_ip", c.ClientIP(),
			"user_agent", c.Request.UserAgent(),
		}

		if len(c.Errors) > 0 {
			fields = append(fields, "errors", c.Errors.String())
		}

		if statusCode >= 500 {
			S.Errorw("Request completed with server error", fields...)
		} else if statusCode >= 400 {
			S.Warnw("Request completed with client error", fields...)
		} else {
			S.Infow("Request completed", fields...)
		}
	}
}

func init() {
	fallback, _ := zap.NewDevelopment()
	S = fallback.Sugar()
	_ = os.Stdout.Sync()
}
