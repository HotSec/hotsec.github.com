# Viper 配置管理

## 一、安装

```bash
go get github.com/spf13/viper
```

## 二、基本使用

### 2.1 读取配置文件

```go
viper.SetConfigName("config")
viper.SetConfigType("yaml")
viper.AddConfigPath(".")
viper.AddConfigPath("./config")
viper.AddConfigPath("/etc/myapp/")

if err := viper.ReadInConfig(); err != nil {
    panic(fmt.Errorf("read config: %w", err))
}
```

### 2.2 读取配置值

```go
viper.Get("name")
viper.GetString("name")
viper.GetInt("server.port")
viper.GetBool("debug")
viper.GetDuration("timeout")

viper.GetStringMap("database")
viper.GetStringSlice("servers")
```

### 2.3 默认值

```go
viper.SetDefault("server.port", 8080)
viper.SetDefault("debug", false)
viper.SetDefault("timeout", "30s")
```

## 三、配置文件示例

```yaml
name: myapp
debug: false
timeout: 30s

server:
  port: 8080
  host: "0.0.0.0"

database:
  driver: mysql
  dsn: "user:pass@tcp(127.0.0.1:3306)/db?charset=utf8mb4&parseTime=True"
  max_open: 100
  max_idle: 10

redis:
  addr: "127.0.0.1:6379"
  password: ""
  db: 0

log:
  level: info
  format: json
```

## 四、绑定结构体

```go
type Config struct {
    Name    string     `mapstructure:"name"`
    Debug   bool       `mapstructure:"debug"`
    Server  ServerConf `mapstructure:"server"`
    Database DBConf    `mapstructure:"database"`
}

type ServerConf struct {
    Port int    `mapstructure:"port"`
    Host string `mapstructure:"host"`
}

type DBConf struct {
    Driver  string `mapstructure:"driver"`
    DSN     string `mapstructure:"dsn"`
    MaxOpen int    `mapstructure:"max_open"`
    MaxIdle int    `mapstructure:"max_idle"`
}

var cfg Config
if err := viper.Unmarshal(&cfg); err != nil {
    panic(err)
}
```

## 五、环境变量

```go
viper.SetEnvPrefix("MYAPP")
viper.AutomaticEnv()
viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

viper.BindEnv("server.port", "MYAPP_SERVER_PORT")
```

```bash
export MYAPP_SERVER_PORT=9090
```

## 六、命令行参数

```go
pflag.Int("port", 8080, "server port")
pflag.Parse()
viper.BindPFlag("server.port", pflag.Lookup("port"))
```

## 七、热更新

```go
viper.WatchConfig()
viper.OnConfigChange(func(e fsnotify.Event) {
    fmt.Println("config changed:", e.Name)
})
```

## 八、写入配置

```go
viper.Set("server.port", 9090)
viper.WriteConfig()
viper.SafeWriteConfig()
viper.WriteConfigAs("config_new.yaml")
```
