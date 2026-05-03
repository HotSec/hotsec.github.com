# time 时间包

## 一、时间获取

```go
now := time.Now()
fmt.Println(now)
fmt.Println(now.Year())
fmt.Println(now.Month())
fmt.Println(now.Day())
fmt.Println(now.Hour())
fmt.Println(now.Minute())
fmt.Println(now.Second())
fmt.Println(now.Unix())
fmt.Println(now.UnixMilli())
fmt.Println(now.UnixMicro())
fmt.Println(now.UnixNano())
```

## 二、时间格式化

Go 的参考时间：`2006-01-02 15:04:05 PM Mon Jan`（记忆：12345）

```go
now := time.Now()
fmt.Println(now.Format("2006-01-02 15:04:05"))
fmt.Println(now.Format("2006/01/02 15:04:05"))
fmt.Println(now.Format("2006-01-02"))
fmt.Println(now.Format("15:04:05"))
fmt.Println(now.Format("2006-01-02 15:04:05.000"))

t, _ := time.Parse("2006-01-02 15:04:05", "2024-01-15 10:30:00")
fmt.Println(t)

t2, _ := time.ParseInLocation("2006-01-02 15:04:05", "2024-01-15 10:30:00", time.Local)
fmt.Println(t2)
```

| 格式 | 含义 |
|------|------|
| `2006` | 年 |
| `01` | 月 |
| `02` | 日 |
| `15` | 时（24小时制） |
| `04` | 分 |
| `05` | 秒 |
| `.000` | 毫秒 |
| `.000000` | 微秒 |
| `.000000000` | 纳秒 |
| `PM` | AM/PM |
| `Mon` | 星期缩写 |
| `Jan` | 月份缩写 |
| `-0700` | 时区 |

## 三、时间计算

```go
now := time.Now()
later := now.Add(1 * time.Hour)
fmt.Println(later)

diff := later.Sub(now)
fmt.Println(diff)

t1 := time.Date(2024, 1, 1, 0, 0, 0, 0, time.Local)
t2 := time.Date(2024, 12, 31, 0, 0, 0, 0, time.Local)
fmt.Println(t1.Before(t2))
fmt.Println(t1.After(t2))
fmt.Println(t1.Equal(t2))

d, _ := t2.Sub(t1).MarshalText()
fmt.Println(string(d))
```

## 四、定时器

### 4.1 Timer

```go
timer := time.NewTimer(2 * time.Second)
<-timer.C
fmt.Println("timer expired")

timer2 := time.AfterFunc(2*time.Second, func() {
    fmt.Println("after func")
})
timer2.Stop()
```

### 4.2 Ticker

```go
ticker := time.NewTicker(1 * time.Second)
defer ticker.Stop()

go func() {
    for t := range ticker.C {
        fmt.Println("tick at", t.Format("15:04:05"))
    }
}()

time.Sleep(5 * time.Second)
```

### 4.3 简易定时

```go
time.Sleep(2 * time.Second)

select {
case <-time.After(3 * time.Second):
    fmt.Println("timeout")
}
```

## 五、Duration

```go
d := 2 * time.Second
fmt.Println(d)
fmt.Println(d.Hours())
fmt.Println(d.Minutes())
fmt.Println(d.Seconds())
fmt.Println(d.Milliseconds())
fmt.Println(d.Microseconds())
fmt.Println(d.Nanoseconds())
```

| 常量 | 值 |
|------|-----|
| `time.Nanosecond` | 1ns |
| `time.Microsecond` | 1000ns |
| `time.Millisecond` | 1000μs |
| `time.Second` | 1000ms |
| `time.Minute` | 60s |
| `time.Hour` | 60m |
