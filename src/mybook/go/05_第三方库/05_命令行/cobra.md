# Cobra CLI 开发

## 一、安装

```bash
go get github.com/spf13/cobra@latest
```

## 二、基本结构

```go
var rootCmd = &cobra.Command{
    Use:   "myapp",
    Short: "My application",
    Long:  `My application is a tool for doing amazing things.`,
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("Hello from myapp!")
    },
}

func main() {
    rootCmd.Execute()
}
```

## 三、子命令

```go
var versionCmd = &cobra.Command{
    Use:   "version",
    Short: "Print version",
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("v1.0.0")
    },
}

var greetCmd = &cobra.Command{
    Use:   "greet [name]",
    Short: "Greet someone",
    Args:  cobra.ExactArgs(1),
    Run: func(cmd *cobra.Command, args []string) {
        name := args[0]
        times, _ := cmd.Flags().GetInt("times")
        for i := 0; i < times; i++ {
            fmt.Printf("Hello, %s!\n", name)
        }
    },
}

func init() {
    greetCmd.Flags().IntP("times", "t", 1, "Number of times to greet")
    rootCmd.AddCommand(versionCmd)
    rootCmd.AddCommand(greetCmd)
}
```

```bash
myapp version
myapp greet Go
myapp greet Go -t 3
myapp greet Go --times 3
```

## 四、持久标志与本地标志

```go
func init() {
    rootCmd.PersistentFlags().StringP("config", "c", "", "config file")
    rootCmd.Flags().BoolP("verbose", "v", false, "verbose output")
}
```

- `PersistentFlags`：子命令也会继承
- `Flags`：仅当前命令可用

## 五、必填标志

```go
func init() {
    rootCmd.Flags().String("name", "", "Your name (required)")
    rootCmd.MarkFlagRequired("name")
}
```

## 六、PreRun 与 PostRun

```go
var startCmd = &cobra.Command{
    Use:   "start",
    Short: "Start the server",
    PreRun: func(cmd *cobra.Command, args []string) {
        fmt.Println("Loading config...")
    },
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Println("Starting server...")
    },
    PostRun: func(cmd *cobra.Command, args []string) {
        fmt.Println("Server started.")
    },
}
```

执行顺序：`PersistentPreRun` → `PreRun` → `Run` → `PostRun` → `PersistentPostRun`

## 七、项目结构

```
myapp/
├── cmd/
│   ├── root.go
│   ├── version.go
│   └── greet.go
├── main.go
└── go.mod
```

## 八、cobra-cli 脚手架

```bash
go install github.com/spf13/cobra-cli@latest
cobra-cli init myapp
cobra-cli add greet
cobra-cli add start
```
