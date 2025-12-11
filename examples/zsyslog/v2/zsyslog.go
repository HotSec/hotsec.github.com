package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"sync"
	"syscall"

	"log/slog"

	"github.com/nsqio/go-nsq"
	"github.com/spf13/viper"
	"gopkg.in/mcuadros/go-syslog.v2"
	"gopkg.in/natefinch/lumberjack.v2"
)

// 配置相关结构体
type Config struct {
	Syslog SyslogConfig `mapstructure:"syslog"`
	Nsq    NsqConfig    `mapstructure:"nsq"`
	Batch  BatchConfig  `mapstructure:"batch"`
	Log    LogConfig    `mapstructure:"log"`
}

type SyslogConfig struct {
	Addr  string `mapstructure:"addr"`
	Proto string `mapstructure:"proto"`
	TLS   bool   `mapstructure:"tls"`
	Cert  string `mapstructure:"cert"`
	Key   string `mapstructure:"key"`
}

type NsqConfig struct {
	Nsqd    string `mapstructure:"nsqd"`
	Topic   string `mapstructure:"topic"`
	Channel string `mapstructure:"channel"`
}

type BatchConfig struct {
	Size    int `mapstructure:"size"`
	Timeout int `mapstructure:"timeout"`
}

type LogConfig struct {
	File       string `mapstructure:"file"`
	MaxSize    int    `mapstructure:"maxsize"`
	MaxBackups int    `mapstructure:"maxbackups"`
	MaxAge     int    `mapstructure:"maxage"`
}

// 设置默认配置
func setDefaults(v *viper.Viper) {
	v.SetDefault("syslog.addr", "0.0.0.0:514")
	v.SetDefault("syslog.proto", "udp")
	v.SetDefault("nsq.nsqd", "127.0.0.1:4150")
	v.SetDefault("nsq.topic", "syslog")
	v.SetDefault("nsq.channel", "es")
	v.SetDefault("syslog.tls", false)
	v.SetDefault("syslog.cert", "")
	v.SetDefault("syslog.key", "")
	v.SetDefault("batch.size", 100)
	v.SetDefault("batch.timeout", 1)
	v.SetDefault("log.file", "./logs/zsyslog.log")
	v.SetDefault("log.maxsize", 100)
	v.SetDefault("log.maxbackups", 3)
	v.SetDefault("log.maxage", 28)
}

// 加载配置
func loadConfig() (*Config, error) {
	v := viper.New()
	v.SetConfigFile("./conf/config.yaml")
	setDefaults(v)

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			slog.Info("Using default config")
		} else {
			return nil, fmt.Errorf("error reading config file: %w", err)
		}
	}

	var conf Config
	if err := v.Unmarshal(&conf); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	slog.Info("Loaded configuration", "config", &conf)
	return &conf, nil
}

// 初始化日志记录器
func initLogger(cfg *Config) (*slog.Logger, error) {
	// 确保日志目录存在
	if err := os.MkdirAll(filepath.Dir(cfg.Log.File), 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}

	writer := &lumberjack.Logger{
		Filename:   cfg.Log.File,
		MaxSize:    cfg.Log.MaxSize,
		MaxBackups: cfg.Log.MaxBackups,
		MaxAge:     cfg.Log.MaxAge,
		Compress:   true,
	}

	handler := slog.NewJSONHandler(writer, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})

	return slog.New(handler), nil
}

// 创建NSQ生产者
func newNSQProducer(addr string) (*nsq.Producer, error) {
	config := nsq.NewConfig()
	producer, err := nsq.NewProducer(addr, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create NSQ producer: %w", err)
	}

	// 等待生产者连接
	err = producer.Ping()
	if err != nil {
		return nil, fmt.Errorf("failed to ping NSQ server: %w", err)
	}

	return producer, nil
}

// 设置syslog服务器
func setupSyslogServer(addr string) (syslog.LogPartsChannel, error) {
	logPartsChannel := make(syslog.LogPartsChannel)
	server := syslog.NewServer()
	server.SetFormat(syslog.Automatic)
	server.SetHandler(syslog.NewChannelHandler(logPartsChannel))

	// 根据配置监听UDP和TCP
	if err := server.ListenUDP(addr); err != nil {
		return nil, fmt.Errorf("failed to listen on UDP: %w", err)
	}

	if err := server.ListenTCP(addr); err != nil {
		return nil, fmt.Errorf("failed to listen on TCP: %w", err)
	}

	if err := server.Boot(); err != nil {
		return nil, fmt.Errorf("failed to boot syslog server: %w", err)
	}

	return logPartsChannel, nil
}

// 处理日志消息
func processLogMessages(ctx context.Context, logPartsChannel syslog.LogPartsChannel, producer *nsq.Producer, topic string) {
	for {
		select {
		case <-ctx.Done():
			return
		case logParts := <-logPartsChannel:
			if err := processLogEntry(producer, topic, logParts); err != nil {
				slog.Error("Failed to process log entry", "error", err)
			}
		}
	}
}

// 处理单个日志条目
func processLogEntry(producer *nsq.Producer, topic string, logParts map[string]interface{}) error {
	slog.Info("Received log entry", slog.Any("log", logParts))
	buf, err := json.Marshal(logParts)
	if err != nil {
		return fmt.Errorf("JSON marshal error: %w", err)
	}

	if err := producer.MultiPublish(topic, [][]byte{buf}); err != nil {
		return fmt.Errorf("NSQ publish error: %w", err)
	}

	slog.Debug("Processed log entry", "log", logParts)
	return nil
}

func main() {
	// 加载配置
	cfg, err := loadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// 初始化日志
	logger, err := initLogger(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	slog.SetDefault(logger)

	slog.Info("Starting zsyslog", "config", cfg)

	// 创建上下文用于优雅关闭
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 设置信号处理
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// 创建NSQ生产者
	producer, err := newNSQProducer(cfg.Nsq.Nsqd)
	if err != nil {
		log.Fatalf("Failed to create NSQ producer: %v", err)
	}
	defer producer.Stop()

	// 设置syslog服务器
	logPartsChannel, err := setupSyslogServer(cfg.Syslog.Addr)
	if err != nil {
		log.Fatalf("Failed to setup syslog server: %v", err)
	}

	// 启动日志处理协程
	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		processLogMessages(ctx, logPartsChannel, producer, cfg.Nsq.Topic)
	}()

	// 等待信号
	<-sigChan
	slog.Info("Shutting down gracefully...")

	// 取消上下文，触发优雅关闭
	cancel()

	// 等待处理协程完成
	wg.Wait()
	slog.Info("Shutdown complete")
}
