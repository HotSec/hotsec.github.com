# Air 热重载

## 一、安装

```bash
go install github.com/air-verse/air@latest
```

## 二、初始化

```bash
cd myproject
air init
```

生成 `.air.toml` 配置文件。

## 三、使用

```bash
air
```

- 自动监听文件变化
- 自动编译运行
- 修改代码后自动重启

## 四、配置文件

```toml
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ."
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  include_file = []
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = true

[screen]
  clear_on_rebuild = false
  keep_scroll = true
```

## 五、Docker 中使用

```dockerfile
FROM golang:1.21-alpine
RUN go install github.com/air-verse/air@latest
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
CMD ["air", "-c", ".air.toml"]
```
