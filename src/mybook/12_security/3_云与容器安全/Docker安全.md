# Docker 安全最佳实践

---

## 一、镜像安全

### 1.1 基础镜像选择

```dockerfile
# ❌ 使用完整镜像
FROM ubuntu:22.04

# ✅ 使用精简镜像
FROM alpine:3.19

# ✅ 使用 distroless（无 shell）
FROM gcr.io/distroless/static-debian12

# ✅ 多阶段构建
FROM golang:1.22 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 go build -o myapp .

FROM gcr.io/distroless/static-debian12
COPY --from=builder /app/myapp /myapp
ENTRYPOINT ["/myapp"]
```

### 1.2 Dockerfile 安全规则

```dockerfile
# 1. 指定固定版本标签（不用 latest）
FROM node:20.11-alpine3.19

# 2. 不用 root 用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# 3. 最小化层数
RUN apk add --no-cache ca-certificates && \
    rm -rf /var/cache/apk/*

# 4. 设置安全相关环境变量
ENV NODE_ENV=production
ENV HELM_CACHE_HOME=/tmp/.helm

# 5. 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:8080/health || exit 1

# 6. 只暴露必要端口
EXPOSE 8080

# 7. 不存储敏感信息
# ❌ ENV DB_PASSWORD=secret123
# ✅ 运行时通过环境变量/Secret 传入
```

### 1.3 镜像扫描

```bash
# Trivy 扫描
trivy image myapp:latest

# Docker Scout
docker scout cves myapp:latest

# CI 中集成
trivy image --exit-code 1 --severity CRITICAL,HIGH myapp:latest
```

---

## 二、运行时安全

### 2.1 只读文件系统

```yaml
# docker-compose.yml
services:
  app:
    image: myapp:latest
    read_only: true
    tmpfs:
      - /tmp
      - /run
```

### 2.2 资源限制

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      restart_policy:
        condition: on-failure
        max_attempts: 3
```

### 2.3 安全选项

```yaml
services:
  app:
    security_opt:
      - no-new-privileges:true    # 禁止提权
    cap_drop:
      - ALL                       # 丢弃所有能力
    cap_add:
      - NET_BIND_SERVICE          # 只添加必要能力
    sysctls:
      - net.ipv4.ip_forward=0
```

### 2.4 网络隔离

```yaml
services:
  frontend:
    networks:
      - frontend
  backend:
    networks:
      - frontend
      - backend
  database:
    networks:
      - backend    # 数据库不在 frontend 网络

networks:
  frontend:
  backend:
    internal: true  # 无法访问外网
```

---

## 三、Secret 管理

### 3.1 Docker Secrets

```bash
echo "my_secret_password" | docker secret create db_password -

docker service create \
    --name myapp \
    --secret db_password \
    -e DB_PASSWORD_FILE=/run/secrets/db_password \
    myapp:latest
```

### 3.2 环境变量（不推荐存储敏感信息）

```yaml
# ❌ 明文密码
environment:
  - DB_PASSWORD=secret123

# ✅ 使用 .env 文件（不入版本控制）
env_file:
  - .env

# ✅ 使用 Docker Secret / Vault
```

---

## 四、K8s 安全

### 4.1 Pod 安全标准

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-app
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: app
    image: myapp:latest
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop: ["ALL"]
    resources:
      limits:
        memory: "512Mi"
        cpu: "500m"
```

### 4.2 NetworkPolicy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
spec:
  podSelector:
    matchLabels:
      app: backend
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - port: 5432
```

### 4.3 RBAC

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
subjects:
- kind: ServiceAccount
  name: myapp
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io
```

---

## 五、安全检查清单

| 类别 | 检查项 |
|------|--------|
| 镜像 | 使用精简基础镜像、固定版本标签、多阶段构建 |
| 镜像 | 定期扫描漏洞 (Trivy)、无敏感信息 |
| 运行时 | 非 root 运行、只读文件系统、资源限制 |
| 运行时 | 最小能力 (cap_drop ALL)、禁止提权 |
| 网络 | 网络隔离、NetworkPolicy、不暴露不必要端口 |
| Secret | 不明文存储、使用 Secret 管理、.env 不入版本控制 |
| K8s | Pod 安全标准、RBAC 最小权限、NetworkPolicy |
| CI/CD | 镜像签名、漏洞扫描、合规检查 |
