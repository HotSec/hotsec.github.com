# CI/CD 实践

持续集成和持续部署自动化构建、测试和发布流程。

---

## 一、GitHub Actions

### 1.1 基本工作流

```yaml
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

    - name: Set up Go
      uses: actions/setup-go@v4
      with:
        go-version: '1.21'

    - name: Build
      run: go build -v ./...

    - name: Test
      run: go test -v -race -coverprofile=coverage.out ./...

    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage.out
```

### 1.2 Docker 构建

```yaml
name: Docker Build

on:
  push:
    tags:
      - 'v*'

jobs:
  docker:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Login to Docker Hub
      uses: docker/login-action@v3
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}

    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: myapp:${{ github.ref_name }}
```

### 1.3 发布到 Kubernetes

```yaml
deploy:
  runs-on: ubuntu-latest
  needs: docker

  steps:
  - uses: actions/checkout@v4

  - name: Set kubeconfig
    run: |
      mkdir -p ~/.kube
      echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > ~/.kube/config

  - name: Deploy
    run: |
      kubectl set image deployment/myapp myapp=myapp:${{ github.ref_name }}
      kubectl rollout status deployment/myapp
```

---

## 二、GitLab CI

### 2.1 基本配置

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: golang:1.21
  script:
    - go test -v -race ./...

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

deploy:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp myapp=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

---

## 三、Go 项目最佳实践

### 3.1 Makefile

```makefile
.PHONY: all build test lint docker

all: lint test build

build:
	go build -o bin/app ./cmd/app

test:
	go test -v -race -coverprofile=coverage.out ./...

lint:
	golangci-lint run

docker:
	docker build -t myapp:latest .

coverage:
	go tool cover -html=coverage.out

clean:
	rm -rf bin/
	go clean
```

### 3.2 golangci-lint 配置

```yaml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - ineffassign
    - typecheck
    - gosimple
    - goconst
    - gocyclo
    - dupl

linters-settings:
  gocyclo:
    min-complexity: 15
  goconst:
    min-len: 3
    min-occurrences: 3
```

---

## 四、版本管理

### 4.1 语义化版本

```
v1.2.3
│ │ │
│ │ └── 补丁版本
│ └──── 次版本
└────── 主版本
```

### 4.2 自动版本号

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Get version
      id: version
      run: |
        VERSION=$(git describe --tags --always)
        echo "version=$VERSION" >> $GITHUB_OUTPUT

    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        tag_name: ${{ steps.version.outputs.version }}
```

---

## 五、安全扫描

### 5.1 依赖扫描

```yaml
- name: Run Gosec Security Scanner
  uses: securego/gosec@master
  with:
    args: ./...

- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:latest'
    format: 'table'
    exit-code: '1'
```

### 5.2 SAST

```yaml
- name: Semgrep CI
  uses: returntocorp/semgrep-action@v1
  with:
    config: p/default
```

---

## 六、通知

### 6.1 Slack 通知

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```
