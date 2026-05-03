# JWT 认证

JWT（JSON Web Token）是一种开放标准（RFC 7519），用于在各方之间安全地传输信息。常用于用户认证和信息交换。

---

## 一、JWT 结构

JWT 由三部分组成，用 `.` 分隔：

```
Header.Payload.Signature
```

### 1.1 Header

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 1.2 Payload

```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622
}
```

标准声明（Claim）：

| 字段 | 含义 |
|------|------|
| `iss` | 签发者 |
| `sub` | 主题 |
| `aud` | 接收方 |
| `exp` | 过期时间 |
| `nbf` | 生效时间 |
| `iat` | 签发时间 |
| `jti` | JWT ID |

### 1.3 Signature

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

---

## 二、Go 实现 JWT

### 2.1 使用 golang-jwt

```go
import "github.com/golang-jwt/jwt/v5"

var secretKey = []byte("your-secret-key")

func GenerateToken(userID int64, username string) (string, error) {
    claims := jwt.MapClaims{
        "user_id":  userID,
        "username": username,
        "exp":      time.Now().Add(24 * time.Hour).Unix(),
        "iat":      time.Now().Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

func ParseToken(tokenString string) (jwt.MapClaims, error) {
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return secretKey, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
        return claims, nil
    }

    return nil, fmt.Errorf("invalid token")
}
```

### 2.2 使用结构体 Claims

```go
type CustomClaims struct {
    UserID   int64  `json:"user_id"`
    Username string `json:"username"`
    jwt.RegisteredClaims
}

func GenerateToken(userID int64, username string) (string, error) {
    claims := CustomClaims{
        UserID:   userID,
        Username: username,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "my-app",
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

func ParseToken(tokenString string) (*CustomClaims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (any, error) {
        return secretKey, nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
        return claims, nil
    }

    return nil, fmt.Errorf("invalid token")
}
```

---

## 三、Gin 中间件集成

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
            return
        }

        parts := strings.SplitN(authHeader, " ", 2)
        if len(parts) != 2 || parts[0] != "Bearer" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
            return
        }

        claims, err := ParseToken(parts[1])
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }

        c.Set("user_id", claims.UserID)
        c.Set("username", claims.Username)
        c.Next()
    }
}

func main() {
    r := gin.Default()

    public := r.Group("/api")
    {
        public.POST("/login", loginHandler)
    }

    protected := r.Group("/api")
    protected.Use(AuthMiddleware())
    {
        protected.GET("/profile", profileHandler)
    }

    r.Run()
}
```

---

## 四、RS256 非对称签名

### 4.1 生成密钥对

```bash
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

### 4.2 使用 RSA

```go
var (
    privateKey *rsa.PrivateKey
    publicKey  *rsa.PublicKey
)

func init() {
    keyData, _ := os.ReadFile("private.pem")
    block, _ := pem.Decode(keyData)
    privateKey, _ = x509.ParsePKCS1PrivateKey(block.Bytes)

    pubData, _ := os.ReadFile("public.pem")
    pubBlock, _ := pem.Decode(pubData)
    pub, _ := x509.ParsePKIXPublicKey(pubBlock.Bytes)
    publicKey = pub.(*rsa.PublicKey)
}

func GenerateTokenRS256(userID int64) (string, error) {
    claims := CustomClaims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
    return token.SignedString(privateKey)
}

func ParseTokenRS256(tokenString string) (*CustomClaims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (any, error) {
        return publicKey, nil
    })
    if err != nil {
        return nil, err
    }
    if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
        return claims, nil
    }
    return nil, fmt.Errorf("invalid token")
}
```

---

## 五、HS256 vs RS256

| 特性 | HS256 | RS256 |
|------|-------|-------|
| 密钥类型 | 对称密钥 | 非对称密钥 |
| 签名和验证 | 同一密钥 | 私钥签名，公钥验证 |
| 适用场景 | 单服务 | 微服务/第三方验证 |
| 密钥管理 | 简单 | 较复杂 |
| 安全性 | 密钥泄露风险大 | 私钥可安全保存 |

---

## 六、Token 刷新机制

```go
type TokenPair struct {
    AccessToken  string `json:"access_token"`
    RefreshToken string `json:"refresh_token"`
    ExpiresIn    int64  `json:"expires_in"`
}

func GenerateTokenPair(userID int64) (*TokenPair, error)    {
    accessToken, _ := GenerateToken(userID, "access", 15*time.Minute)
    refreshToken, _ := GenerateToken(userID, "refresh", 7*24*time.Hour)

    return &TokenPair{
        AccessToken:  accessToken,
        RefreshToken: refreshToken,
        ExpiresIn:    900,
    }, nil
}

func RefreshAccessToken(refreshToken string) (*TokenPair, error) {
    claims, err := ParseToken(refreshToken)
    if err != nil {
        return nil, err
    }

    if claims.Type != "refresh" {
        return nil, fmt.Errorf("not a refresh token")
    }

    return GenerateTokenPair(claims.UserID)
}
```

---

## 七、安全最佳实践

1. **使用强密钥**：HS256 至少 256 位，RS256 至少 2048 位
2. **设置合理过期时间**：Access Token 15分钟，Refresh Token 7天
3. **不要在 Payload 存敏感信息**：JWT 只做 Base64 编码，非加密
4. **验证签发者（iss）和接收方（aud）**
5. **使用 HTTPS 传输 Token**
6. **Token 撤销**：维护黑名单或使用短过期时间
7. **不要将 Token 存在 localStorage**：使用 HttpOnly Cookie
