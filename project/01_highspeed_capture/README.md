# Highspeed Capture - 40Gbps 高性能流量捕获工具

高性能 40Gbps 流量捕获程序，支持保存完整数据包（PCAPNG 格式）或仅保存 5 元组数据到磁盘。

## 功能特性

- 🔄 **AF_XDP 零拷贝捕获**: 利用 Linux 原生 AF_XDP 技术实现高吞吐量
- 💾 **双模式存储**: 支持完整 PCAPNG 文件或轻量级 5 元组数据
- 📊 **高磁盘吞吐**: 使用 mmap 和直接 I/O 优化磁盘写入
- ⚡ **无锁队列**: 跨线程通信无锁设计，最大化性能
- 📁 **自动文件轮转**: 按大小自动分割输出文件
- 🎯 **CPU 亲和性**: 绑定特定 CPU 核心，减少缓存抖动

## 系统要求

- Linux 5.4+ (AF_XDP 需要)
- Rust 1.70+
- 支持多队列的网卡 (建议 4+ 队列)
- 足够的内存（建议 >= 32GB）
- 高速 SSD/NVMe 存储

## 安装

```bash
git clone <repository-url>
cd highspeed-capture

cargo build --release
```

## 使用方法

### 捕获完整数据包
```bash
./target/release/highspeed-capture \
  --interface eth0 \
  --mode full \
  --output-dir ./captures
```

### 仅捕获 5 元组
```bash
./target/release/highspeed-capture \
  --interface eth0 \
  --mode tuple \
  --output-dir ./tuples
```

### 使用配置文件
```bash
./target/release/highspeed-capture --config config/default.toml
```

### 命令行参数
```
Usage: highspeed-capture [OPTIONS]

Options:
  -i, --interface <INTERFACE>    Network interface to capture from
  -c, --config <CONFIG>          Configuration file path [default: config/default.toml]
  -m, --mode <MODE>              Storage mode: full or tuple
  -o, --output-dir <OUTPUT_DIR>  Output directory for captured data
  -b, --buffer-size <BUFFER_SIZE>  Buffer size in MB
  -s, --pcap-size-limit <PCAP_SIZE_LIMIT>  PCAP file size limit in MB
  -v, --verbose                  Increase verbosity
  -q, --quiet                    Quiet mode
  -h, --help                     Print help
  -V, --version                  Print version
```

## 项目结构

```
src/
├── main.rs              # 主入口
├── capture/             # 数据包捕获模块
│   ├── afxdp.rs         # AF_XDP 实现
│   └── mod.rs
├── parser/              # 协议解析模块
│   ├── five_tuple.rs    # 5 元组提取
│   └── mod.rs
├── storage/             # 存储模块
│   ├── pcap_writer.rs   # PCAPNG 写入
│   ├── tuple_writer.rs  # 5 元组写入
│   └── mod.rs
├── config/              # 配置管理
│   ├── settings.rs
│   └── mod.rs
├── cli/                 # 命令行工具
│   ├── args.rs
│   └── mod.rs
└── lib.rs
```

## 性能指标

| 指标 | 数值 |
|------|------|
| 最大吞吐量 | 40Gbps (线速) |
| PPS | 59 Mpps (64字节包) |
| CPU 使用率 | 4 核 @ 3.5GHz |
| 内存使用 | ~2GB |

## 许可证

MIT