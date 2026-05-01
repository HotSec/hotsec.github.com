# GitHub Actions CI/CD

---

## 一、基本概念

| 概念 | 说明 |
|------|------|
| Workflow | 工作流，定义在 YAML 文件中 |
| Event | 触发事件（push/PR/schedule） |
| Job | 作业，由多个 Step 组成 |
| Step | 步骤，执行一个 Action 或命令 |
| Action | 可复用的操作单元 |
| Runner | 执行器（GitHub 托管 / 自托管） |

---

## 二、Workflow 文件

### 2.1 基本结构

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-go@v5
      with:
        go-version: '1.22'

    - name: Build
      run: go build ./...

    - name: Test
      run: go test ./... -race -coverprofile=coverage.out

    - name: Lint
      uses: golangci/golangci-lint-action@v4
```

### 2.2 触发事件

```yaml
on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    types: [opened, synchronize]
  schedule:
    - cron: '0 2 * * *'  # 每天 2:00 UTC
  workflow_dispatch:       # 手动触发
  repository_dispatch:     # 外部事件触发
```

---

## 三、多 Job 与依赖

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - run: go vet ./...

  test:
    runs-on: ubuntu-latest
    needs: lint
    strategy:
      matrix:
        go: ['1.21', '1.22']
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v5
      with:
        go-version: ${{ matrix.go }}
    - run: go test ./... -race

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
    - uses: actions/checkout@v4
    - run: go build -o myapp .
    - uses: actions/upload-artifact@v4
      with:
        name: myapp
        path: myapp
```

---

## 四、Docker 构建 & 推送

```yaml
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: |
          ghcr.io/${{ github.repository }}:latest
          ghcr.io/${{ github.repository }}:${{ github.sha }}
```

---

## 五、部署

### 5.1 SSH 部署

```yaml
deploy:
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main'
  steps:
  - name: Deploy via SSH
    uses: appleboy/ssh-action@v1
    with:
      host: ${{ secrets.SERVER_HOST }}
      username: ${{ secrets.SERVER_USER }}
      key: ${{ secrets.SSH_PRIVATE_KEY }}
      script: |
        cd /app
        docker pull ghcr.io/myorg/myapp:latest
        docker-compose up -d
```

### 5.2 K8s 部署

```yaml
deploy:
  runs-on: ubuntu-latest
  needs: docker
  steps:
  - uses: actions/checkout@v4

  - uses: azure/k8s-set-context@v3
    with:
      method: kubeconfig
      kubeconfig: ${{ secrets.KUBE_CONFIG }}

  - uses: azure/k8s-deploy@v4
    with:
      manifests: |
        k8s/deployment.yaml
        k8s/service.yaml
      images: |
        ghcr.io/myorg/myapp:${{ github.sha }}
```

---

## 六、Secrets 管理

```yaml
# 使用 Secrets
env:
  DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
  API_KEY: ${{ secrets.API_KEY }}

steps:
- name: Use secret
  env:
    TOKEN: ${{ secrets.MY_TOKEN }}
  run: |
    curl -H "Authorization: Bearer $TOKEN" https://api.example.com
```

设置路径: Settings → Secrets and variables → Actions

---

## 七、缓存

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/go/pkg/mod
      ~/.cache/go-build
    key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
    restore-keys: |
      ${{ runner.os }}-go-
```

---

## 八、常用 Action 速查

| Action | 用途 |
|--------|------|
| `actions/checkout@v4` | 检出代码 |
| `actions/setup-go@v5` | 安装 Go |
| `actions/setup-python@v5` | 安装 Python |
| `actions/setup-node@v4` | 安装 Node.js |
| `actions/cache@v4` | 缓存 |
| `actions/upload-artifact@v4` | 上传产物 |
| `actions/download-artifact@v4` | 下载产物 |
| `golangci/golangci-lint-action@v4` | Go Lint |
| `docker/build-push-action@v5` | Docker 构建 |
| `appleboy/ssh-action@v1` | SSH 部署 |
