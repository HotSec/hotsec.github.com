# zap 日志库

zap 是 Uber 开源的高性能日志库，具有零分配和极快的性能。

---

## 一、安装

```bash
go get go.uber.org/zap
```

---

## 二、基本用法

### 2.1 预设 Logger

```go
import "go.uber.org/zap"

func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    logger.Info("hello",
        zap.String("key", "value"),
        zap.Int("count", 42),
    )
}
```

### 2.2 预设类型

```go
zap.NewProduction()
zap.NewDevelopment()
zap.NewExample()
```

### 2.3 Sugar Logger

```go
logger, _ := zap.NewProduction()
defer logger.Sync()
sugar := logger.Sugar()

sugar.Infow("hello",
    "key", "value",
    "count", 42,
)
sugar.Infof("hello %s", "world")
```

---

## 三、配置

### 3.1 自定义配置

```go
config := zap.Config{
    Level:       zap.NewAtomicLevelAt(zap.InfoLevel),
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
    OutputPaths:      []string{"stdout", "/var/log/app.log"},
    ErrorOutputPaths: []string{"stderr"},
}

logger, _ := config.Build()
```

### 3.2 输出到文件

```go
logger, _ := zap.Config{
    OutputPaths: []string{"app.log"},
}.Build()
```

### 3.3 日志轮转（配合 lumberjack）

```go
import "gopkg.in/natefinch/lumberjack.v2"

w := &lumberjack.Logger{
    Filename:   "app.log",
    MaxSize:    100,
    MaxBackups: 3,
    MaxAge:     28,
    Compress:   true,
}

core := zapcore.NewCore(
    zapcore.NewJSONEncoder(zap.NewProductionEncoderConfig()),
    zapcore.AddSync(w),
    zap.InfoLevel,
)

logger := zap.New(core)
```

---

## 四、字段类型

### 4.1 基本类型

```go
zap.String("key", "value")
zap.Int("count", 42)
zap.Bool("enabled", true)
zap.Float64("ratio", 3.14)
zap.Duration("elapsed", time.Second)
zap.Time("timestamp", time.Now())
```

### 4.2 复杂类型

```go
zap.Any("data", map[string]int{"a": 1})
zap.Reflect("data", structData)
zap.Error(err)
zap.NamedError("cause", err)
zap.Stack("stack")
```

### 4.3 延迟计算

```go
zap.Any("expensive", zap.Lazy(func() any {
    return computeExpensiveValue()
}))
```

---

## 五、日志级别

```go
logger.Debug("debug message")
logger.Info("info message")
logger.Warn("warn message")
logger.Error("error message")
logger.DPanic("panic in development")
logger.Panic("panic message")
logger.Fatal("fatal message")
```

动态调整级别：

```go
var level = zap.NewAtomicLevelAt(zap.InfoLevel)

config := zap.Config{
    Level: level,
}

level.SetLevel(zap.DebugLevel)
```

---

## 六、与 Gin 集成

```go
import (
    "go.uber.org/zap"
    "github.com/gin-gonic/gin"
)

func ZapLogger(logger *zap.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        query := c.Request.URL.RawQuery

        c.Next()

        logger.Info("request",
            zap.Int("status", c.Writer.Status()),
            zap.String("method", c.Request.Method),
            zap.String("path", path),
            zap.String("query", query),
            zap.String("ip", c.ClientIP()),
            zap.Duration("latency", time.Since(start)),
            zap.String("user-agent", c.Request.UserAgent()),
        )
    }
}

func main() {
    logger, _ := zap.NewProduction()
    defer logger.Sync()

    r := gin.New()
    r.Use(ZapLogger(logger))
    r.Use(gin.Recovery())

    r.Run(":8080")
}
```

---

## 七、全局 Logger

```go
zap.ReplaceGlobals(logger)

zap.L().Info("using global logger")
zap.S().Info("using global sugar")
```

---

## 八、性能特点

| 特性 | zap | logrus | log15 |
|------|-----|--------|-------|
| 分配 | 0 | 23 | 19 |
| 性能 | 极快 | 较慢 | 较慢 |

- 结构化日志，零分配
- 类型安全的字段
- 支持多种编码格式
