# memos

## 源码安装

`https://github.com/usememos/memos.git`

```bash
cd proto && buf generate

go run ./cmd/memos --mode dev --port 8081  

cd web && pnpm dev       
```

## 目录

## cmd/memos/main.go

- viper 配置文件
- cobra 命令行
- slog 日志

###  启动流程

- 初始化阶段
  - 创建配置实例并验证
  - 初始化数据库驱动
  - 创建数据存储实例
  - 执行数据库迁移
  - 创建服务器实例
- 运行阶段
  - 启动HTTP服务器
  - 设置信号处理（SIGINT/SIGTERM）
  - 实现优雅关闭


## server

- 一个基于echo框架的grpc-http混合服务器


