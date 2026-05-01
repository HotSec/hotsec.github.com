# Jenkins Pipeline

## 概述

Jenkins 是最广泛使用的开源 CI/CD 服务器，通过 Jenkinsfile 定义流水线。

## Jenkinsfile 语法

### 声明式 Pipeline

```groovy
pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'registry.example.com'
        APP_NAME = 'myapp'
        IMAGE_TAG = "${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}"
    }

    tools {
        go 'Go-1.22'
    }

    stages {
        stage('Lint') {
            steps {
                sh 'golangci-lint run ./...'
            }
        }

        stage('Test') {
            steps {
                sh 'go test -v -race -coverprofile=coverage.out ./...'
            }
            post {
                always {
                    junit 'report.xml'
                    publishHTML(target: [
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage'
                    ])
                }
            }
        }

        stage('Build') {
            steps {
                sh "docker build -t ${IMAGE_TAG} ."
                sh "docker push ${IMAGE_TAG}"
            }
        }

        stage('Deploy Staging') {
            steps {
                sh """
                    kubectl config use-context staging
                    helm upgrade --install ${APP_NAME} ./chart \
                        --namespace staging \
                        -f ./chart/values-staging.yaml \
                        --set image.tag=${BUILD_NUMBER}
                """
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Deploy"
            }
            steps {
                sh """
                    kubectl config use-context production
                    helm upgrade --install ${APP_NAME} ./chart \
                        --namespace production \
                        -f ./chart/values-production.yaml \
                        --set image.tag=${BUILD_NUMBER}
                """
            }
        }
    }

    post {
        success {
            slackSend(
                color: 'good',
                message: "Build ${BUILD_NUMBER} succeeded: ${env.JOB_NAME}"
            )
        }
        failure {
            slackSend(
                color: 'danger',
                message: "Build ${BUILD_NUMBER} failed: ${env.JOB_NAME}"
            )
        }
        always {
            cleanWs()
        }
    }
}
```

### 脚本式 Pipeline

```groovy
node {
    try {
        stage('Checkout') {
            checkout scm
        }

        stage('Build') {
            sh 'go build -o bin/myapp'
        }

        stage('Test') {
            sh 'go test -v ./...'
        }

        stage('Deploy') {
            if (env.BRANCH_NAME == 'main') {
                sh 'kubectl apply -f k8s/production/'
            } else {
                sh 'kubectl apply -f k8s/staging/'
            }
        }
    } catch (err) {
        currentBuild.result = 'FAILURE'
        slackSend(color: 'danger', message: "Build failed: ${err.message}")
        throw err
    }
}
```

***

## 核心概念

### Agent

```groovy
pipeline {
    agent none

    stages {
        stage('Test') {
            agent {
                docker {
                    image 'golang:1.22'
                    args '-v $GOPATH/pkg/mod:/go/pkg/mod'
                }
            }
            steps {
                sh 'go test ./...'
            }
        }

        stage('Build') {
            agent {
                kubernetes {
                    yaml '''
                        apiVersion: v1
                        kind: Pod
                        spec:
                          containers:
                          - name: docker
                            image: docker:24
                            command: ['cat']
                            tty: true
                            volumeMounts:
                            - name: dockersock
                              mountPath: /var/run/docker.sock
                          volumes:
                          - name: dockersock
                            hostPath:
                              path: /var/run/docker.sock
                    '''
                }
            }
            steps {
                container('docker') {
                    sh 'docker build -t myapp .'
                }
            }
        }
    }
}
```

### When 条件

```groovy
stage('Deploy Production') {
    when {
        allOf {
            branch 'main'
            expression { env.DEPLOY_PROD == 'true' }
        }
    }
    steps {
        sh 'kubectl apply -f k8s/production/'
    }
}

stage('Release') {
    when {
        buildingTag()
    }
    steps {
        sh 'make release'
    }
}

stage('PR Check') {
    when {
        changeRequest()
    }
    steps {
        sh 'make check'
    }
}
```

### 并行执行

```groovy
stage('Parallel Tests') {
    parallel {
        stage('Unit Tests') {
            steps {
                sh 'go test -short ./...'
            }
        }
        stage('Integration Tests') {
            steps {
                sh 'go test -run Integration ./...'
            }
        }
        stage('E2E Tests') {
            steps {
                sh 'go test -run E2E ./...'
            }
        }
    }
}
```

### 参数化构建

```groovy
pipeline {
    agent any

    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'production'], description: 'Target environment')
        string(name: 'VERSION', defaultValue: 'latest', description: 'App version')
        booleanParam(name: 'RUN_MIGRATIONS', defaultValue: true, description: 'Run DB migrations')
    }

    stages {
        stage('Deploy') {
            steps {
                echo "Deploying version ${params.VERSION} to ${params.ENVIRONMENT}"
                sh "kubectl set image deployment/myapp myapp=registry.example.com/myapp:${params.VERSION} -n ${params.ENVIRONMENT}"
            }
        }

        stage('Migrate') {
            when {
                expression { params.RUN_MIGRATIONS }
            }
            steps {
                sh "kubectl exec deployment/myapp -n ${params.ENVIRONMENT} -- ./migrate"
            }
        }
    }
}
```

***

## 凭据管理

### 使用凭据

```groovy
pipeline {
    agent any

    stages {
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-registry',
                    usernameVariable: 'REGISTRY_USER',
                    passwordVariable: 'REGISTRY_PASS'
                )]) {
                    sh 'docker login -u $REGISTRY_USER -p $REGISTRY_PASS registry.example.com'
                    sh 'docker push myapp:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([kubeconfigContent(
                    credentialsId: 'k8s-config',
                    variable: 'KUBECONFIG'
                )]) {
                    sh 'kubectl apply -f k8s/'
                }
            }
        }

        stage('Secret') {
            steps {
                withCredentials([string(
                    credentialsId: 'api-key',
                    variable: 'API_KEY'
                )]) {
                    sh "curl -H 'Authorization: Bearer $API_KEY' https://api.example.com/deploy"
                }
            }
        }
    }
}
```

***

## 共享库

### vars/myPipeline.groovy

```groovy
def call(Map config) {
    pipeline {
        agent any

        environment {
            APP_NAME = config.appName
            DOCKER_REGISTRY = config.registry ?: 'registry.example.com'
        }

        stages {
            stage('Build') {
                steps {
                    sh "docker build -t ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER} ."
                }
            }

            stage('Test') {
                steps {
                    sh config.testCommand ?: 'make test'
                }
            }

            stage('Push') {
                steps {
                    sh "docker push ${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}"
                }
            }

            stage('Deploy') {
                steps {
                    sh """
                        helm upgrade --install ${APP_NAME} ./chart \
                            --namespace ${config.namespace ?: 'default'} \
                            --set image.tag=${BUILD_NUMBER}
                    """
                }
            }
        }
    }
}
```

### 使用共享库

```groovy
@Library('my-shared-lib') _

myPipeline(
    appName: 'myapp',
    registry: 'registry.example.com',
    testCommand: 'go test ./...',
    namespace: 'production'
)
```

***

## 最佳实践

### 1. 使用声明式 Pipeline

- 更结构化，更易维护
- 内置语法检查
- 更好的 UI 支持

### 2. 使用 Multibranch Pipeline

- 自动发现分支
- 每个 PR 自动创建流水线
- 合并后自动清理

### 3. 镜像版本管理

```groovy
environment {
    IMAGE_TAG = "${DOCKER_REGISTRY}/${APP_NAME}:${GIT_COMMIT.take(8)}"
}
```

### 4. 超时设置

```groovy
options {
    timeout(time: 30, unit: 'MINUTES')
    retry(3)
    disableConcurrentBuilds()
}
```

### 5. 构建触发器

```groovy
triggers {
    pollSCM('H/15 * * * *')
    cron('H 6 * * 1')
    upstream(upstreamProjects: 'infrastructure', threshold: hudson.model.Result.SUCCESS)
}
```
