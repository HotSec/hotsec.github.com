package main

import (
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net"
	"os"
	"syscall"
	"time"

	"os/signal"

	"gopkg.in/natefinch/lumberjack.v2"

	"github.com/influxdata/go-syslog/v3"
	"github.com/influxdata/go-syslog/v3/rfc3164"
	"github.com/influxdata/go-syslog/v3/rfc5424"
	"github.com/nsqio/go-nsq"
	"github.com/spf13/viper"
)

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

var Conf = new(Config)

func loadConfig() *Config {
	v := viper.New()
	v.SetConfigFile("./conf/config.yaml")
	// 设置默认值
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
	v.SetDefault("log.file", "/var/log/zsyslog/zsyslog.log")
	v.SetDefault("log.maxsize", 100)
	v.SetDefault("log.maxbackups", 3)
	v.SetDefault("log.maxage", 28)

	// 读取配置文件
	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Println("Using default config")
		} else {
			log.Fatalf("Error reading config file: %v", err)
		}
	}
	fmt.Printf("All settings: %+v\n", v.AllSettings())

	// 解析到结构体
	if err := v.Unmarshal(Conf); err != nil {
		log.Fatalf("解析配置失败：%v", err)
	}

	// 在返回前添加调试信息
	fmt.Printf("Parsed config: %+v\n", Conf)

	return Conf
}

func initLogger(cfg *Config) *slog.Logger {
	// 创建日志文件滚动配置
	writer := &lumberjack.Logger{
		Filename:   cfg.Log.File,
		MaxSize:    cfg.Log.MaxSize, // MB
		MaxBackups: cfg.Log.MaxBackups,
		MaxAge:     cfg.Log.MaxAge, // days
		Compress:   true,
	}

	// 创建slog处理器
	handler := slog.NewJSONHandler(writer, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	})

	return slog.New(handler)
}

func main() {
	c := make(chan os.Signal, 1)
	signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)

	// 1. 解析配置
	loadConfig()

	// 2. 初始化日志
	logger := initLogger(Conf)
	slog.SetDefault(logger)
	slog.Info("zsyslog 启动中。。。。")
	slog.Info("当前配置", "config", Conf)
	// 3. 初始化NSQ生产者
	producer := newNSQProducer(Conf)
	defer producer.Stop()

	// // 发送测试消息
	// err := producer.Publish(Conf.Nsq.Topic, []byte("Hello, NSQ!"))
	// if err != nil {
	// 	slog.Error("发送测试消息失败", "error", err)
	// }

	// 创建UDP服务器实例
	server := NewUDPSyslogServer(Conf.Syslog.Addr)
	server.nsqProducer = producer

	// 启动服务器
	go func() {
		if err := server.Start(); err != nil {
			slog.Error("Server error", "error", err)
			os.Exit(1)
		}
	}()

	// 阻塞主进程
	<-c
	slog.Info("Shutting down server")
	fmt.Println("bye")
	os.Exit(0)
}

func newNSQProducer(cfg *Config) *nsq.Producer {
	config := nsq.NewConfig()

	producer, err := nsq.NewProducer(cfg.Nsq.Nsqd, config)
	if err != nil {
		log.Fatalf("Failed to create NSQ producer: %v", err)
	}
	return producer
}

type UDPSyslogServer struct {
	address      string
	parser       syslog.Machine
	parser2      syslog.Machine
	conn         *net.UDPConn
	nsqProducer  *nsq.Producer
	messageCount int64
	startTime    time.Time
}

func NewUDPSyslogServer(address string) *UDPSyslogServer {
	// 创建RFC5424解析器
	parser := rfc3164.NewParser(
		rfc3164.WithBestEffort(),         // 启用最佳努力解析
		rfc3164.WithTimezone(time.Local), // 使用本地时区
	)
	parser2 := rfc5424.NewParser(
		rfc5424.WithBestEffort(),
	)
	return &UDPSyslogServer{
		address:   address,
		parser:    parser,
		parser2:   parser2,
		startTime: time.Now(),
	}
}

func (s *UDPSyslogServer) Start() error {
	// 解析UDP地址
	addr, err := net.ResolveUDPAddr("udp", s.address)
	if err != nil {
		return fmt.Errorf("failed to resolve UDP address: %v", err)
	}

	// 创建UDP监听器
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		return fmt.Errorf("failed to listen on UDP: %v", err)
	}
	s.conn = conn

	log.Printf("UDP Syslog server started on %s", s.address)

	// 设置读取缓冲区大小
	buf := make([]byte, 8192)

	for {
		n, clientAddr, err := conn.ReadFromUDP(buf)
		if err != nil {
			log.Printf("Error reading from UDP: %v", err)
			continue
		}

		// 处理接收到的消息
		go s.handleMessage(buf[:n], clientAddr)
	}
}

func (s *UDPSyslogServer) handleMessage(data []byte, clientAddr *net.UDPAddr) {
	// 解析syslog消息
	slog.Debug(string(data))
	message, err := s.parser.Parse(data)
	if err != nil {
		// 尝试使用rfc5424进行解析
		message, err = s.parser2.Parse(data)
		if err != nil {
			slog.Error("syslog消息解析失败",
				"client", clientAddr.String(),
				"data", string(data),
				"error", err)
		}
	}

	// 处理消息
	s.processMessage(message, clientAddr, string(data))
}

func (s *UDPSyslogServer) processMessage(message syslog.Message, clientAddr *net.UDPAddr, raw string) {
	s.messageCount++
	if s.messageCount%100 == 0 {
		duration := time.Since(s.startTime).Seconds()
		speed := float64(s.messageCount) / duration
		slog.Info("处理速度统计",
			"total_messages", s.messageCount,
			"duration_seconds", duration,
			"messages_per_second", speed)
	}
	// 将消息转换为JSON格式
	jsonMsg, err := json.Marshal(struct {
		Client  string
		Raw     string
		Message syslog.Message
	}{
		Client:  clientAddr.String(),
		Raw:     raw,
		Message: message,
	})
	if err != nil {
		slog.Info("Error marshaling message", "err", err)
		return
	}

	// 在实际应用中，这里可以将消息发送到消息队列、数据库等
	slog.Debug("接收到syslog消息 ", "message", jsonMsg, "raw", raw)
	s.nsqProducer.Publish(Conf.Nsq.Topic, jsonMsg)
}
