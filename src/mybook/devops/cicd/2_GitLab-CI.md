# GitLab CI 详解

## 概述

GitLab CI/CD 是 GitLab 内置的持续集成/持续部署工具，通过 `.gitlab-ci.yml` 文件定义流水线。

## 基础配置

### .gitlab-ci.yml

```yaml
stages:
  - lint
  - test
  - build
  - deploy

variables:
  DOCKER_REGISTRY: registry.example.com
  APP_NAME: myapp
  DOCKER_TLS_CERTDIR: "/certs"

before_script:
  - echo "Starting pipeline for $CI_COMMIT_BRANCH"

lint:
  stage: lint
  image: golangci/golangci-lint:v1.57
  script:
    - golangci-lint run ./...
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

test:
  stage: test
  image: golang:1.22
  script:
    - go test -v -race -coverprofile=coverage.out ./...
    - go tool cover -func=coverage.out
  coverage: '/total:\s+\(statements\)\s+(\d+\.\d+)%/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  script:
    - docker build -t $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHORT_SHA .
    - docker push $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHORT_SHA
    - docker tag $DOCKER_REGISTRY/$APP_NAME:$CI_COMMIT_SHORT_SHA
        $DOCKER_REGISTRY/$APP_NAME:latest
    - docker push $DOCKER_REGISTRY/$APP_NAME:latest
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy-staging:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl config use-context staging
    - helm upgrade --install $APP_NAME ./chart
        --namespace staging
        -f ./chart/values-staging.yaml
        --set image.tag=$CI_COMMIT_SHORT_SHA
  environment:
    name: staging
    url: https://staging.example.com
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy-production:
  stage: deploy
  image: bitnami/kubectl
  script:
    - kubectl config use-context production
    - helm upgrade --install $APP_NAME ./chart
        --namespace production
        -f ./chart/values-production.yaml
        --set image.tag=$CI_COMMIT_SHORT_SHA
  environment:
    name: production
    url: https://example.com
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

***

## 核心概念

### 流水线 (Pipeline)

```
commit → Pipeline
           ├── Stage: lint
           │     └── Job: lint
           ├── Stage: test
           │     ├── Job: unit-test
           │     └── Job: integration-test
           ├── Stage: build
           │     └── Job: docker-build
           └── Stage: deploy
                 ├── Job: deploy-staging
                 └── Job: deploy-production (manual)
```

### 变量

```yaml
variables:
  GLOBAL_VAR: "value"

job:
  variables:
    JOB_VAR: "value"
  script:
    - echo $GLOBAL_VAR
    - echo $JOB_VAR
    - echo $CI_COMMIT_SHA
    - echo $CI_COMMIT_BRANCH
    - echo $CI_PIPELINE_ID
    - echo $CI_PROJECT_DIR
```

| 内置变量 | 描述 |
|----------|------|
| `CI_COMMIT_SHA` | 提交 SHA |
| `CI_COMMIT_BRANCH` | 分支名 |
| `CI_COMMIT_TAG` | 标签名 |
| `CI_PIPELINE_ID` | 流水线 ID |
| `CI_PROJECT_DIR` | 项目目录 |
| `CI_REGISTRY` | Container Registry |
| `CI_ENVIRONMENT_NAME` | 环境名 |

### 条件与规则

```yaml
job:
  script: echo "hello"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: on_success
    - if: $CI_MERGE_REQUEST_TARGET_BRANCH_NAME == "main"
      when: manual
    - if: $CI_COMMIT_TAG
      when: on_success
    - when: never

job-only-tags:
  script: echo "release"
  rules:
    - if: $CI_COMMIT_TAG
```

### 缓存

```yaml
cache:
  key:
    files:
      - go.sum
      - package-lock.json
  paths:
    - vendor/
    - node_modules/
    - .cache/

test:
  cache:
    key: "$CI_COMMIT_REF_SLUG"
    paths:
      - vendor/
  script:
    - go mod download
    - go test ./...
```

### 制品 (Artifacts)

```yaml
build:
  script:
    - go build -o bin/myapp
    - tar czf build.tar.gz bin/
  artifacts:
    paths:
      - bin/
      - build.tar.gz
    expire_in: 1 week
    reports:
      junit: report.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml
```

***

## 高级特性

### 并行作业

```yaml
test:
  parallel: 4
  script:
    - echo "Running test shard $CI_NODE_INDEX of $CI_NODE_TOTAL"
    - go test -shuffle=on -count=1 ./...
```

### 触发器

```yaml
trigger-downstream:
  stage: deploy
  trigger:
    project: myorg/infrastructure
    branch: main
    strategy: depend
```

### 环境与部署

```yaml
deploy:
  stage: deploy
  script:
    - kubectl apply -f k8s/
  environment:
    name: production
    url: https://$CI_ENVIRONMENT_SLUG.example.com
    on_stop: stop-environment

stop-environment:
  stage: deploy
  script:
    - kubectl delete -f k8s/
  environment:
    name: production
    action: stop
  when: manual
```

### 安全扫描

```yaml
include:
  - template: Security/SAST.gitlab-ci.yml
  - template: Security/Secret-Detection.gitlab-ci.yml
  - template: Security/Container-Scanning.gitlab-ci.yml
  - template: Security/Dependency-Scanning.gitlab-ci.yml
```

### 多项目流水线

```yaml
stages:
  - build
  - trigger

build-app:
  stage: build
  script:
    - go build -o myapp

trigger-infra:
  stage: trigger
  trigger:
    project: myorg/infrastructure
    branch: main
```

***

## Runner 配置

### 注册 Runner

```bash
gitlab-runner register \
  --url https://gitlab.com \
  --token <registration-token> \
  --executor docker \
  --docker-image golang:1.22 \
  --tag-list "docker,go"

gitlab-runner register \
  --url https://gitlab.com \
  --token <registration-token> \
  --executor kubernetes
```

### Runner 类型

| 类型 | 描述 |
|------|------|
| Shared | 所有项目可用 |
| Group | 组内项目可用 |
| Project | 仅当前项目可用 |

### 标签选择

```yaml
job:
  tags:
    - docker
    - go
  script:
    - go build
```

***

## 最佳实践

### 模板复用

```yaml
.docker-build:
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG

build-app:
  extends: .docker-build
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA

build-worker:
  extends: .docker-build
  variables:
    IMAGE_TAG: $CI_REGISTRY_IMAGE/worker:$CI_COMMIT_SHORT_SHA
    DOCKERFILE: Dockerfile.worker
```

### 安全变量

```yaml
deploy:
  script:
    - kubectl config set-cluster k8s --server=$K8S_SERVER
    - kubectl config set-credentials admin --token=$K8S_TOKEN
  variables:
    K8S_SERVER: "https://k8s.example.com"
    K8S_TOKEN:
      value: ""
      description: "K8s API token (set in CI/CD Settings)"
```

在 GitLab UI → Settings → CI/CD → Variables 中设置敏感变量，勾选 Masked 和 Protected。
