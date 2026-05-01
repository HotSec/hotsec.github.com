# encoding/json 详解

## 一、基本序列化与反序列化

```go
type Student struct {
    ID     int    `json:"id"`
    Name   string `json:"name"`
    Age    int    `json:"age,omitempty"`
    Gender string `json:"gender"`
    Email  string `json:"email,omitempty"`
}

s := Student{ID: 1, Name: "Go", Age: 18, Gender: "male"}

data, _ := json.Marshal(s)
fmt.Println(string(data))

var s2 Student
json.Unmarshal(data, &s2)
fmt.Println(s2)
```

## 二、Tag 选项

| Tag | 说明 |
|-----|------|
| `json:"name"` | 指定 JSON 字段名 |
| `json:"name,omitempty"` | 零值时省略 |
| `json:"-"` | 忽略字段 |
| `json:"-,"` | 字段名为 `-` |

```go
type User struct {
    Name     string `json:"name"`
    Password string `json:"-"`
    Age      int    `json:"age,omitempty"`
    Internal string `json:"-,"`
}
```

## 三、自定义 JSON

### 3.1 自定义 MarshalJSON

```go
type Time struct {
    time.Time
}

func (t Time) MarshalJSON() ([]byte, error) {
    formatted := t.Format("2006-01-02 15:04:05")
    return json.Marshal(formatted)
}

func (t *Time) UnmarshalJSON(data []byte) error {
    var s string
    if err := json.Unmarshal(data, &s); err != nil {
        return err
    }
    parsed, err := time.Parse("2006-01-02 15:04:05", s)
    if err != nil {
        return err
    }
    t.Time = parsed
    return nil
}
```

### 3.2 使用 json.RawMessage

```go
type Message struct {
    Type string          `json:"type"`
    Data json.RawMessage `json:"data"`
}

msg := `{"type":"user","data":{"name":"Go","age":18}}`
var m Message
json.Unmarshal([]byte(msg), &m)

if m.Type == "user" {
    var u struct {
        Name string `json:"name"`
        Age  int    `json:"age"`
    }
    json.Unmarshal(m.Data, &u)
    fmt.Println(u)
}
```

## 四、流式编解码

### 4.1 Encoder

```go
file, _ := os.Create("data.json")
defer file.Close()

encoder := json.NewEncoder(file)
encoder.SetIndent("", "  ")
encoder.Encode(s)
```

### 4.2 Decoder

```go
file, _ := os.Open("data.json")
defer file.Close()

decoder := json.NewDecoder(file)
var s Student
decoder.Decode(&s)
```

### 4.3 处理多个 JSON 对象

```go
decoder := json.NewDecoder(file)
for decoder.More() {
    var s Student
    if err := decoder.Decode(&s); err != nil {
        break
    }
    fmt.Println(s)
}
```

## 五、map 与 slice

```go
m := map[string]interface{}{
    "name": "Go",
    "age":  18,
    "tags": []string{"backend", "cloud"},
}
data, _ := json.Marshal(m)

var m2 map[string]interface{}
json.Unmarshal(data, &m2)

names := []string{"Go", "Python", "Java"}
data, _ = json.Marshal(names)

var names2 []string
json.Unmarshal(data, &names2)
```

## 六、JSON 技巧

### 6.1 优雅处理未知结构

```go
var result map[string]interface{}
json.Unmarshal(data, &result)

name := result["name"].(string)
age := result["age"].(float64)
```

### 6.2 数字精度问题

```go
decoder := json.NewDecoder(bytes.NewReader(data))
decoder.UseNumber()

var result map[string]interface{}
decoder.Decode(&result)

num := result["id"].(json.Number)
n, _ := num.Int64()
```

### 6.3 空切片 vs nil

```go
type Response struct {
    Items []string `json:"items"`
}

r1 := Response{Items: []string{}}
r2 := Response{Items: nil}

data1, _ := json.Marshal(r1)
data2, _ := json.Marshal(r2)

fmt.Println(string(data1))
fmt.Println(string(data2))
```
