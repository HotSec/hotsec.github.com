# validator 参数校验

## 一、安装

```bash
go get github.com/go-playground/validator/v10
```

## 二、结构体 Tag

```go
type User struct {
    Name  string `validate:"required,min=2,max=100"`
    Email string `validate:"required,email"`
    Age   int    `validate:"required,gte=0,lte=130"`
    Phone string `validate:"omitempty,e164"`
    URL   string `validate:"omitempty,url"`
    IP    string `validate:"omitempty,ip"`
}
```

## 三、基本使用

```go
validate := validator.New(validator.WithRequiredStructEnabled())

user := User{
    Name:  "Go",
    Email: "go@example.com",
    Age:   18,
}

err := validate.Struct(user)
if err != nil {
    for _, err := range err.(validator.ValidationErrors) {
        fmt.Printf("Field: %s, Tag: %s, Value: %v\n", err.Field(), err.Tag(), err.Value())
    }
}
```

## 四、常用验证标签

| 标签 | 说明 |
|------|------|
| `required` | 必填 |
| `omitempty` | 空值时跳过后续验证 |
| `min=N` | 最小长度/值 |
| `max=N` | 最大长度/值 |
| `len=N` | 精确长度 |
| `gte=N` | 大于等于 |
| `lte=N` | 小于等于 |
| `gt=N` | 大于 |
| `lt=N` | 小于 |
| `eq=N` | 等于 |
| `ne=N` | 不等于 |
| `email` | 邮箱格式 |
| `url` | URL 格式 |
| `uri` | URI 格式 |
| `ip` | IP 地址 |
| `ipv4` | IPv4 |
| `ipv6` | IPv6 |
| `e164` | 电话号码（E.164） |
| `uuid` | UUID |
| `alpha` | 纯字母 |
| `alphanum` | 字母+数字 |
| `numeric` | 数字 |
| `datetime=2006-01-02` | 日期格式 |
| `json` | JSON 格式 |
| `file` | 文件路径 |
| `dir` | 目录路径 |
| `oneof=a b c` | 枚举值 |
| `contains=x` | 包含子串 |
| `startswith=x` | 以 x 开头 |
| `endswith=x` | 以 x 结尾 |

## 五、跨字段验证

```go
type Password struct {
    Password        string `validate:"required,min=8"`
    ConfirmPassword string `validate:"required,eqfield=Password"`
}
```

| 标签 | 说明 |
|------|------|
| `eqfield` | 等于另一个字段 |
| `nefield` | 不等于另一个字段 |
| `gtfield` | 大于另一个字段 |
| `gtefield` | 大于等于另一个字段 |
| `ltfield` | 小于另一个字段 |
| `ltefield` | 小于等于另一个字段 |

## 六、自定义验证器

```go
func validateFlattern(fl validator.FieldLevel) bool {
    dateStr := fl.Field().String()
    _, err := time.Parse("2006-01-02", dateStr)
    return err == nil
}

validate := validator.New()
validate.RegisterValidation("dateformat", validateFlattern)

type Event struct {
    Date string `validate:"required,dateformat"`
}
```

## 七、中文错误信息

```go
import "github.com/go-playground/locales/zh"
import ut "github.com/go-playground/universal-translator"
import zh_trans "github.com/go-playground/validator/v10/translations/zh"

uni := ut.New(zh.New())
trans, _ := uni.GetTranslator("zh")

validate := validator.New()
zh_trans.RegisterDefaultTranslations(validate, trans)

err := validate.Struct(user)
if err != nil {
    for _, e := range err.(validator.ValidationErrors) {
        fmt.Println(e.Translate(trans))
    }
}
```

## 八、Gin 集成

```go
type SignUpReq struct {
    Name     string `json:"name" binding:"required"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
    Age      int    `json:"age" binding:"required,gte=1,lte=130"`
}

func SignUp(c *gin.Context) {
    var req SignUpReq
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, gin.H{"msg": "ok"})
}
```
