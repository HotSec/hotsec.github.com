# Helm 包管理

## 概述

Helm 是 Kubernetes 的包管理器，将 K8s 资源模板化，实现应用的一键部署和版本管理。

```bash
brew install helm
helm version
```

## Chart 结构

```
mychart/
├── Chart.yaml
├── values.yaml
├── charts/
├── templates/
│   ├── _helpers.tpl
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── hpa.yaml
│   ├── serviceaccount.yaml
│   └── NOTES.txt
└── templates/tests/
    └── test-connection.yaml
```

### Chart.yaml

```yaml
apiVersion: v2
name: myapp
description: My Application Helm Chart
type: application
version: 1.0.0
appVersion: "2.0.0"
keywords:
  - web
  - api
maintainers:
  - name: team
    email: team@example.com
dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
  - name: redis
    version: "18.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: redis.enabled
```

### values.yaml

```yaml
replicaCount: 3

image:
  repository: registry.example.com/myapp
  pullPolicy: IfNotPresent
  tag: "2.0.0"

imagePullSecrets: []
nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations: {}
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 2000

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL

service:
  type: ClusterIP
  port: 8080

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - example.com

resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
  targetCPUUtilizationPercentage: 70

postgresql:
  enabled: true
  auth:
    database: myapp
    username: admin

redis:
  enabled: true
  architecture: standalone
```

***

## 模板语法

### _helpers.tpl

```gotemplate
{{- define "myapp.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "myapp.selectorLabels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "myapp.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else if .Values.nameOverride }}
{{- .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
```

### deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "myapp.fullname" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
      - name: {{ .Chart.Name }}
        securityContext:
          {{- toYaml .Values.securityContext | nindent 12 }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        ports:
        - containerPort: {{ .Values.service.port }}
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: {{ include "myapp.fullname" . }}-db
              key: url
        {{- range .Values.extraEnv }}
        - name: {{ .name }}
          value: {{ .value | quote }}
        {{- end }}
        livenessProbe:
          httpGet:
            path: /health
            port: {{ .Values.service.port }}
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /health
            port: {{ .Values.service.port }}
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          {{- toYaml .Values.resources | nindent 12 }}
        volumeMounts:
        - name: config
          mountPath: /etc/app/config
        - name: tmp
          mountPath: /tmp
      volumes:
      - name: config
        configMap:
          name: {{ include "myapp.fullname" . }}
      - name: tmp
        emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

***

## 常用命令

### 仓库管理

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm repo list
helm search repo bitnami/nginx
helm search hub nginx
```

### 安装与升级

```bash
helm install myapp ./mychart
helm install myapp ./mychart -n production
helm install myapp ./mychart -f values-production.yaml
helm install myapp ./mychart --set replicaCount=5 --set image.tag=v3

helm upgrade myapp ./mychart
helm upgrade myapp ./mychart -f values-production.yaml
helm upgrade --install myapp ./mychart -n production

helm rollback myapp 1
helm history myapp
```

### 调试

```bash
helm template myapp ./mychart
helm template myapp ./mychart -f values-dev.yaml
helm template myapp ./mychart --debug
helm lint ./mychart
helm lint ./mychart --strict
```

### 管理

```bash
helm list
helm list -n production
helm list --all-namespaces
helm status myapp
helm get values myapp
helm get manifest myapp
helm uninstall myapp
helm uninstall myapp -n production
```

***

## 多环境管理

### 目录结构

```
mychart/
├── values.yaml
├── values-dev.yaml
├── values-staging.yaml
└── values-production.yaml
```

### values-dev.yaml

```yaml
replicaCount: 1

image:
  tag: "latest"

resources:
  requests:
    cpu: 50m
    memory: 64Mi
  limits:
    cpu: 200m
    memory: 256Mi

ingress:
  enabled: false

autoscaling:
  enabled: false

postgresql:
  enabled: true
  primary:
    persistence:
      size: 1Gi
```

### values-production.yaml

```yaml
replicaCount: 5

image:
  tag: "2.0.0"

resources:
  requests:
    cpu: 200m
    memory: 256Mi
  limits:
    cpu: "1"
    memory: 512Mi

ingress:
  enabled: true
  hosts:
    - host: example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: myapp-tls
      hosts:
        - example.com

autoscaling:
  enabled: true
  minReplicas: 5
  maxReplicas: 30
  targetCPUUtilizationPercentage: 60

postgresql:
  enabled: false
```

### 部署脚本

```bash
helm upgrade --install myapp ./mychart \
  -n production \
  -f values.yaml \
  -f values-production.yaml
```

***

## Chart 依赖

```bash
helm dependency update ./mychart
helm dependency build ./mychart
helm dependency list ./mychart
```

### 条件依赖

```yaml
dependencies:
  - name: postgresql
    version: "15.x.x"
    repository: "https://charts.bitnami.com/bitnami"
    condition: postgresql.enabled
    alias: postgresql
```

```bash
helm install myapp ./mychart --set postgresql.enabled=false
```
