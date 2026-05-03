# flag 命令行参数

## 一、基本用法

```go
var name string
var age int
var married bool

flag.StringVar(&name, "name", "anonymous", "用户名")
flag.IntVar(&age, "age", 18, "年龄")
flag.BoolVar(&married, "married", false, "是否已婚")

flag.Parse()

fmt.Println(name, age, married)
```

```bash
go run main.go -name=Go -age=20 -married
go run main.go -name Go -age 20 -married
go run main.go --help
```

## 二、返回值方式

```go
name := flag.String("name", "anonymous", "用户名")
age := flag.Int("age", 18, "年龄")
married := flag.Bool("married", false, "是否已婚")

flag.Parse()

fmt.Println(*name, *age, *married)
```

## 三、子命令

```go
fooCmd := flag.NewFlagSet("foo", flag.ExitOnError)
fooName := fooCmd.String("name", "foo", "foo name")

barCmd := flag.NewFlagSet("bar", flag.ExitOnError)
barLevel := barCmd.Int("level", 0, "bar level")

if len(os.Args) < 2 {
    fmt.Println("expected 'foo' or 'bar' subcommands")
    os.Exit(1)
}

switch os.Args[1] {
case "foo":
    fooCmd.Parse(os.Args[2:])
    fmt.Println("foo:", *fooName)
case "bar":
    barCmd.Parse(os.Args[2:])
    fmt.Println("bar:", *barLevel)
default:
    fmt.Println("expected 'foo' or 'bar' subcommands")
    os.Exit(1)
}
```

```bash
go run main.go foo -name=myfoo
go run main.go bar -level=5
```

## 四、os.Args

```go
fmt.Println(os.Args)
fmt.Println(os.Args[0])
fmt.Println(os.Args[1:])
```

- `os.Args[0]` 是程序名
- `os.Args[1:]` 是参数列表
- 简单场景可直接使用 `os.Args`，复杂场景推荐 `flag` 或 `cobra`
