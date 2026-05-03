# html/template 模板

## 一、基本用法

```go
type User struct {
    Name string
    Age  int
}

t, err := template.New("hello").Parse("Hello, {{.Name}}! You are {{.Age}} years old.")
if err != nil {
    panic(err)
}

u := User{Name: "Go", Age: 18}
err = t.Execute(os.Stdout, u)
```

## 二、模板语法

### 2.1 变量

```
{{.}}
{{.Name}}
{{.Address.City}}
```

### 2.2 管道

```
{{.Name | printf "%s"}}
{{. | printf "%v"}}
```

### 2.3 条件

```
{{if .IsAdmin}}
  <p>Admin Panel</p>
{{else if .IsUser}}
  <p>User Panel</p>
{{else}}
  <p>Guest</p>
{{end}}
```

### 2.4 循环

```
{{range .Items}}
  <li>{{.Name}} - {{.Price}}</li>
{{else}}
  <li>No items</li>
{{end}}
```

- `range` 内 `.` 变为当前迭代元素
- `{{else}}` 在集合为空时执行

### 2.5 with

```
{{with .User}}
  <p>{{.Name}}</p>
{{else}}
  <p>No user</p>
{{end}}
```

- `with` 内 `.` 变为指定值
- 值为空时执行 `else`

### 2.6 自定义变量

```
{{$x := .Name}}
{{$x}}
{{$y := "hello"}}
```

### 2.7 比较函数

| 函数 | 说明 |
|------|------|
| `eq` | == |
| `ne` | != |
| `lt` | < |
| `le` | <= |
| `gt` | > |
| `ge` | >= |

```
{{if eq .Status "active"}}
  <p>Active</p>
{{end}}
```

## 三、自定义函数

```go
funcs := template.FuncMap{
    "toUpper": strings.ToUpper,
    "add":     func(a, b int) int { return a + b },
}

t := template.Must(template.New("test").Funcs(funcs).Parse(
    `{{.Name | toUpper}} {{add .A .B}}`,
))

t.Execute(os.Stdout, struct {
    Name string
    A, B int
}{"hello", 1, 2})
```

## 四、模板嵌套

```go
t := template.Must(template.New("layout").Parse(`
{{define "layout"}}
<html>
<body>{{template "content" .}}</body>
</html>
{{end}}

{{define "content"}}
<h1>Hello, {{.Name}}!</h1>
{{end}}

{{template "layout" .}}
`))

t.Execute(os.Stdout, User{Name: "Go"})
```

## 五、从文件加载

```go
t, err := template.ParseGlob("templates/*.html")
t, err := template.ParseFiles("templates/layout.html", "templates/content.html")

t.ExecuteTemplate(os.Stdout, "layout.html", data)
```

## 六、安全处理

- `html/template` 自动转义 HTML，防止 XSS
- 如需输出原始 HTML：使用 `template.HTML` 类型

```go
type Page struct {
    Content template.HTML
}

p := Page{Content: template.HTML("<b>bold</b>")}
```
