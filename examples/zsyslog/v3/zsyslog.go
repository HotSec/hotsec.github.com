package main

import (
	"fmt"

	"github.com/influxdata/go-syslog/v3"
	"github.com/influxdata/go-syslog/v3/rfc5424"
)

func main() {
	// 1. 创建用于接收日志的通道
	channel := make(syslog.LogPartsChannel)

	// 2. 创建处理器，将日志发送到通道
	handler := syslog.NewChannelHandler(channel)

	// 3. 创建服务器实例
	server := syslog.NewServer()

	// 4. 设置服务器使用的日志格式（此处以RFC5424为例）
	server.SetFormat(rfc5424.NewParser())

	// 5. 设置服务器的处理器
	server.SetHandler(handler)

	// 6. 配置服务器监听的地址和端口
	server.ListenUDP("0.0.0.0:514")

	// 7. 启动服务器
	server.Boot()

	// 8. 在一个独立的goroutine中处理日志
	go func(channel syslog.LogPartsChannel) {
		for logParts := range channel {
			// 打印完整的原始日志（已解析为map）
			fmt.Printf("Received: %v\n", logParts)
		}
	}(channel)

	// 9. 阻塞等待服务器停止
	server.Wait()
}
