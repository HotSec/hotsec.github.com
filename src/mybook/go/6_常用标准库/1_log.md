# 日志

## 一、标准库 log

```go
log.Println("message")
log.Printf("user %s logged in", name)
log.Fatalln("fatal message")
log.Panicln("panic message")

log.SetFlags(log.LstdFlags | log.Lshortfile)
log.SetPrefix("[myapp] ")
```

## 二、slog（Go 1.21+）

```go
slog.Info("user logged in", "user_id", 123, "ip", "10.0.0.1")
slog.Warn("slow query", "duration", 5*time.Second)
slog.Error("db error", "err", err)

slog.Info("message",
    slog.Int("user_id", 123),
    slog.String("ip", "10.0.0.1"),
)

logger := slog.Default()
logger.Info("hello")

handler := slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
logger = slog.New(handler)
slog.SetDefault(logger)
```

## 三、Zap

### 3.1 安装

```bash
go get go.uber.org/zap
```

### 3.2 Logger（全局）

```go
logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("user logged in",
    zap.String("username", "go"),
    zap.Int("user_id", 123),
    zap.Duration("duration", time.Second),
)

logger.Error("db error",
    zap.Error(err),
    zap.String("query", sql),
)
```

### 3.3 SugaredLogger

```go
logger, _ := zap.NewProduction()
sugar := logger.Sugar()
defer sugar.Sync()

sugar.Infow("user logged in",
    "username", "go",
    "user_id", 123,
)

sugar.Infof("user %s logged in, id=%d", "go", 123)
sugar.Warnw("slow query", "duration", 5*time.Second)
```

### 3.4 自定义配置

```go
cfg := zap.Config{
    Level:       zap.NewAtomicLevelAt(zap.DebugLevel),
    Development: false,
    Encoding:    "json",
    EncoderConfig: zapcore.EncoderConfig{
        TimeKey:        "ts",
        LevelKey:       "level",
        NameKey:        "logger",
        CallerKey:      "caller",
        MessageKey:     "msg",
        StacktraceKey:  "stacktrace",
        LineEnding:     zapcore.DefaultLineEnding,
        EncodeLevel:    zapcore.LowercaseLevelEncoder,
        EncodeTime:     zapcore.ISO8601TimeEncoder,
        EncodeDuration: zapcore.SecondsDurationEncoder,
        EncodeCaller:   zapcore.ShortCallerEncoder,
    },
    OutputPaths:      []string{"stdout", "/var/log/myapp.log"},
    ErrorOutputPaths: []string{"stderr"},
}

logger, _ := cfg.Build()
defer logger.Sync()
```

### 3.5 Gin 集成

```go
func ZapLogger() gin.HandlerFunc {
    logger, _ := zap.NewProduction()
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        logger.Info("request",
            zap.String("method", c.Request.Method),
            zap.String("path", c.Request.URL.Path),
            zap.Int("status", c.Writer.Status()),
            zap.Duration("latency", time.Since(start)),
            zap.String("client_ip", c.ClientIP()),
        )
    }
}
```

## 四、lumberjack 日志轮转

```bash
go get gopkg.in/natefinch/lumberjack.v2
```

```go
w := &lumberjack.Logger{
    Filename:   "/var/log/myapp/app.log",
    MaxSize:    100,
    MaxBackups: 5,
    MaxAge:     30,
    Compress:   true,
    LocalTime:  true,
}

core := zapcore.NewCore(
    zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()),
    zapcore.AddSync(w),
    zapcore.DebugLevel,
)
logger := zap.New(core, zap.AddCaller())
```

## 五、日志格式规范

| 字段 | 说明 |
|------|------|
| `ts` | 时间戳（ISO8601） |
| `level` | 日志级别 |
| `caller` | 调用位置 |
| `msg` | 日志消息 |
| `trace_id` | 链路追踪 ID |
| `error` | 错误信息 |
| `duration` | 耗时 |

- 生产环境使用 JSON 格式
- 开发环境使用 console 格式
- 日志级别：DEBUG < INFO < WARN < ERROR < FATAL
- 敏感信息（密码/token）不应出现在日志中
