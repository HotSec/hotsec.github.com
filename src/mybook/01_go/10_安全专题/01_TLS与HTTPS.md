# TLS 与 HTTPS

TLS（Transport Layer Security）是保障网络通信安全的核心协议，HTTPS 即 HTTP over TLS。

---

## 一、TLS 基础

### 1.1 TLS 握手流程

```
Client                          Server
  |---- ClientHello ------------>|
  |<--- ServerHello -------------|
  |<--- Certificate -------------|
  |<--- ServerKeyExchange -------|
  |<--- ServerHelloDone ---------|
  |---- ClientKeyExchange ------>|
  |---- ChangeCipherSpec ------->|
  |---- Finished --------------->|
  |<--- ChangeCipherSpec --------|
  |<--- Finished ----------------|
  |===== 加密通信 ================|
```

### 1.2 TLS 1.3 改进

- 握手从 2-RTT 减少到 1-RTT
- 0-RTT 恢复（有重放攻击风险）
- 移除了不安全的密码套件
- 强制使用 ECDHE 密钥交换

---

## 二、Go TLS 服务器

### 2.1 基本 HTTPS 服务器

```go
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        fmt.Fprintf(w, "Hello, TLS!")
    })

    srv := &http.Server{
        Addr:    ":443",
        Handler: mux,
    }

    log.Fatal(srv.ListenAndServeTLS("server.crt", "server.key"))
}
```

### 2.2 自定义 TLS 配置

```go
srv := &http.Server{
    Addr:    ":443",
    Handler: mux,
    TLSConfig: &tls.Config{
        MinVersion:               tls.VersionTLS12,
        CurvePreferences:         []tls.CurveID{tls.X25519, tls.CurveP256},
        PreferServerCipherSuites: true,
        CipherSuites: []uint16{
            tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
            tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
            tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
            tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
            tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
            tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
        },
    },
}
```

### 2.3 双向 TLS（mTLS）

```go
srv := &http.Server{
    Addr:    ":443",
    Handler: mux,
    TLSConfig: &tls.Config{
        ClientAuth: tls.RequireAndVerifyClientCert,
        ClientCAs:  clientCAPool,
    },
}
```

- `ClientAuth` 设置客户端证书验证级别
- `ClientCAs` 指定信任的客户端 CA 证书池

---

## 三、Go TLS 客户端

### 3.1 基本 HTTPS 客户端

```go
client := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            InsecureSkipVerify: false,
        },
    },
}

resp, err := client.Get("https://example.com")
```

### 3.2 自定义 CA 证书

```go
caCert, _ := os.ReadFile("ca.crt")
caCertPool := x509.NewCertPool()
caCertPool.AppendCertsFromPEM(caCert)

client := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            RootCAs: caCertPool,
        },
    },
}
```

### 3.3 客户端证书（mTLS）

```go
cert, _ := tls.LoadX509KeyPair("client.crt", "client.key")

caCert, _ := os.ReadFile("ca.crt")
caCertPool := x509.NewCertPool()
caCertPool.AppendCertsFromPEM(caCert)

client := &http.Client{
    Transport: &http.Transport{
        TLSClientConfig: &tls.Config{
            Certificates: []tls.Certificate{cert},
            RootCAs:      caCertPool,
        },
    },
}
```

---

## 四、证书生成

### 4.1 OpenSSL 生成自签名证书

```bash
openssl genrsa -out ca.key 2048
openssl req -new -x509 -days 365 -key ca.key -out ca.crt -subj "/CN=MyCA"

openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -subj "/CN=localhost"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -extfile <(echo "subjectAltName=DNS:localhost,IP:127.0.0.1")
```

### 4.2 Go 代码生成证书

```go
func generateCert() (tls.Certificate, error) {
    priv, _ := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)

    template := x509.Certificate{
        SerialNumber: big.NewInt(1),
        Subject: pkix.Name{CommonName: "localhost"},
        NotBefore: time.Now(),
        NotAfter:  time.Now().Add(24 * time.Hour),
        KeyUsage:  x509.KeyUsageDigitalSignature,
        ExtKeyUsage: []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
        DNSNames:  []string{"localhost"},
        IPAddresses: []net.IP{net.ParseIP("127.0.0.1")},
    }

    certDER, _ := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
    certPEM := pem.EncodeToMemory(&pem.Block{Type: "CERTIFICATE", Bytes: certDER})

    privDER, _ := x509.MarshalECPrivateKey(priv)
    privPEM := pem.EncodeToMemory(&pem.Block{Type: "EC PRIVATE KEY", Bytes: privDER})

    return tls.X509KeyPair(certPEM, privPEM)
}
```

---

## 五、自动证书（Let's Encrypt）

### 5.1 使用 autocert

```go
import "golang.org/x/crypto/acme/autocert"

func main() {
    m := autocert.Manager{
        Cache:      autocert.DirCache("certs"),
        Prompt:     autocert.AcceptTOS,
        HostPolicy: autocert.HostWhitelist("example.com"),
    }

    srv := &http.Server{
        Addr:      ":443",
        TLSConfig: m.TLSConfig(),
    }

    go http.ListenAndServe(":80", m.HTTPHandler(nil))
    log.Fatal(srv.ListenAndServeTLS("", ""))
}
```

---

## 六、安全最佳实践

1. **禁用 TLS 1.0/1.1**：最低使用 TLS 1.2
2. **优先使用 ECDHE**：支持前向保密
3. **不要使用 InsecureSkipVerify**：生产环境必须验证证书
4. **定期更新证书**：避免证书过期
5. **使用 HSTS**：强制 HTTPS
6. **mTLS 用于服务间通信**：零信任网络架构
