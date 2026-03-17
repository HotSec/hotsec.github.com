# **SBOM（软件物料清单）生成**的完整总结

---

## 一、SBOM 简介

### 什么是 SBOM？
**SBOM（Software Bill of Materials）** 是软件组件的正式清单，包含：
- 组件名称、版本
- 供应商信息
- 许可证信息
- 依赖关系
- 漏洞信息

### 为什么需要 SBOM？
| 用途 | 说明 |
|------|------|
| 安全合规 | 满足供应链安全法规要求 |
| 漏洞管理 | 快速定位受影响组件 |
| 许可证审计 | 避免许可证合规风险 |
| 供应链透明 | 了解软件组成和依赖 |

---

## 二、常用 SBOM 标准格式

| 格式 | 说明 |
|------|------|
| **SPDX** | Linux 基金会标准，ISO/IEC 5962:2021 |
| **CycloneDX** | OWASP 标准，轻量级 |
| **SWID** | ISO/IEC 19770-2 标准 |

---

## 三、SBOM 生成工具

### 1. Syft（推荐）

#### 安装
```bash
# macOS
brew install syft

# Linux
curl -sSfL https://raw.githubusercontent.com/anchore/syft/main/install.sh | sh

# Windows
scoop install syft
```

#### 基本使用
```bash
# 为目录生成 SBOM
syft /path/to/project

# 为 Docker 镜像生成 SBOM
syft nginx:latest

# 指定输出格式
syft /path/to/project -o spdx-json > sbom.spdx.json
syft /path/to/project -o cyclonedx-json > sbom.cdx.json

# 生成并保存到文件
syft /path/to/project -o spdx-json=output.spdx.json
syft /path/to/project -o cyclonedx-xml=output.cdx.xml
```

#### 支持的输出格式
```bash
# 常用格式
-o spdx          # SPDX 标签格式
-o spdx-json     # SPDX JSON 格式（推荐）
-o cyclonedx     # CycloneDX XML 格式
-o cyclonedx-json # CycloneDX JSON 格式
-o table         # 表格格式（默认）
-o json          # Syft 自定义 JSON
```

#### 配置文件 (.syft.yaml)
```yaml
# .syft.yaml
output:
  - "spdx-json=sbom.spdx.json"
  
file-metadata:
  digests:
    - sha256
    - sha512

package:
  search-unindexed-archives: true
  catalog-all-typed-files: true
```

---

### 2. Trivy

#### 安装
```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh
```

#### 生成 SBOM
```bash
# 为镜像生成 SBOM
trivy image --format spdx-json --output sbom.spdx.json nginx:latest

# 为文件系统生成 SBOM
trivy fs --format spdx-json --output sbom.spdx.json /path/to/project

# CycloneDX 格式
trivy image --format cyclonedx --output sbom.cdx.json nginx:latest
```

---

### 3. Microsoft SBOM Tool

#### 安装
```bash
# 下载
curl -Lo sbom-tool https://github.com/microsoft/sbom-tool/releases/latest/download/sbom-tool-linux-x64
chmod +x sbom-tool
```

#### 使用
```bash
# 生成 SBOM
./sbom-tool generate \
  -BuildDropPath ./output \
  -BuildComponentPath ./src \
  -PackageName "my-app" \
  -PackageVersion "1.0.0" \
  -PackageSupplier "MyCompany" \
  -NamespaceUriBase "https://mycompany.com/sbom"
```

---

### 4. CycloneDX 工具链

#### Maven
```xml
<plugin>
  <groupId>org.cyclonedx</groupId>
  <artifactId>cyclonedx-maven-plugin</artifactId>
  <version>2.7.10</version>
  <executions>
    <execution>
      <phase>package</phase>
      <goals>
        <goal>makeAggregateBom</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

#### Gradle
```groovy
plugins {
  id 'org.cyclonedx.bom' version '1.8.2'
}

cyclonedxBom {
  includeConfigs = ['runtimeClasspath']
  projectType = "application"
  schemaVersion = "1.5"
}
```

#### npm
```bash
npm install -g @cyclonedx/cyclonedx-npm

# 生成 SBOM
cyclonedx-npm --output-file sbom.cdx.json
```

#### Python
```bash
pip install cyclonedx-bom

# 从 requirements.txt 生成
cyclonedx-py requirements -i requirements.txt -o sbom.cdx.xml

# 从 Poetry 项目生成
cyclonedx-py poetry -o sbom.cdx.xml
```

#### Go
```bash
go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest

# 生成 SBOM
cyclonedx-gomod app -json -output sbom.cdx.json
```

---

## 四、各语言 SBOM 生成

### Node.js / JavaScript
```bash
# Syft（推荐）
syft /path/to/nodejs-project -o spdx-json > sbom.spdx.json

# npm + CycloneDX
npm install -g @cyclonedx/cyclonedx-npm
cyclonedx-npm --output-file sbom.cdx.json

# pnpm
npm install -g @cyclonedx/cyclonedx-pnpm
cyclonedx-pnpm --output-file sbom.cdx.json
```

### Python
```bash
# Syft
syft /path/to/python-project -o spdx-json > sbom.spdx.json

# CycloneDX
pip install cyclonedx-bom
cyclonedx-py requirements -i requirements.txt -o sbom.cdx.xml

# Poetry 项目
cyclonedx-py poetry -o sbom.cdx.xml
```

### Java
```bash
# Syft
syft /path/to/java-project -o spdx-json > sbom.spdx.json

# Maven
mvn org.cyclonedx:cyclonedx-maven-plugin:makeAggregateBom

# Gradle
./gradlew cyclonedxBom
```

### Go
```bash
# Syft
syft /path/to/go-project -o spdx-json > sbom.spdx.json

# CycloneDX
go install github.com/CycloneDX/cyclonedx-gomod/cmd/cyclonedx-gomod@latest
cyclonedx-gomod app -json -output sbom.cdx.json
```

### Rust
```bash
# Syft
syft /path/to/rust-project -o spdx-json > sbom.spdx.json

# cargo-cyclonedx
cargo install cargo-cyclonedx
cargo cyclonedx
```

### .NET
```bash
# Syft
syft /path/to/dotnet-project -o spdx-json > sbom.spdx.json

# dotnet CycloneDX
dotnet tool install --global CycloneDX
dotnet cyclonedx -t project -o sbom.cdx.xml
```

---

## 五、Docker/容器 SBOM 生成

### Syft
```bash
# 镜像
syft my-image:latest -o spdx-json > sbom.spdx.json

# 容器
syft container:my-container -o spdx-json > sbom.spdx.json

# Docker archive
syft docker-archive:my-image.tar -o spdx-json > sbom.spdx.json

# OCI archive
syft oci-archive:my-image.tar -o spdx-json > sbom.spdx.json
```

### Trivy
```bash
trivy image --format spdx-json --output sbom.spdx.json my-image:latest
```

---

## 六、CI/CD 集成

### GitHub Actions
```yaml
name: Generate SBOM

on:
  push:
    tags:
      - 'v*'

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          format: spdx-json
          output-file: sbom.spdx.json
          
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.spdx.json
```

### GitLab CI
```yaml
generate-sbom:
  stage: build
  image: anchore/syft:latest
  script:
    - syft . -o spdx-json=sbom.spdx.json
  artifacts:
    paths:
      - sbom.spdx.json
    expire_in: 1 week
```

### Jenkins
```groovy
pipeline {
    agent any
    stages {
        stage('Generate SBOM') {
            steps {
                sh 'syft . -o spdx-json=sbom.spdx.json'
            }
        }
        stage('Archive SBOM') {
            steps {
                archiveArtifacts artifacts: 'sbom.spdx.json', fingerprint: true
            }
        }
    }
}
```

---

## 七、SBOM 验证与漏洞扫描

### 使用 Grype 扫描漏洞
```bash
# 安装
brew install grype

# 扫描 SBOM
grype sbom:sbom.spdx.json

# 输出到文件
grype sbom:sbom.spdx.json -o json > vulnerabilities.json
```

### 使用 Trivy 扫描
```bash
trivy sbom sbom.spdx.json
```

---

## 八、SBOM 文件示例

### SPDX JSON 示例
```json
{
  "spdxVersion": "SPDX-2.3",
  "dataLicense": "CC0-1.0",
  "SPDXID": "SPDXRef-DOCUMENT",
  "name": "my-application",
  "documentNamespace": "https://example.com/sbom/my-app-1.0.0",
  "packages": [
    {
      "SPDXID": "SPDXRef-Package-express",
      "name": "express",
      "versionInfo": "4.18.2",
      "licenseConcluded": "MIT",
      "supplier": "Person: TJ Holowaychuk"
    }
  ],
  "relationships": [
    {
      "spdxElementId": "SPDXRef-DOCUMENT",
      "relationshipType": "DESCRIBES",
      "relatedSpdxElement": "SPDXRef-Package-express"
    }
  ]
}
```

### CycloneDX JSON 示例
```json
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "serialNumber": "urn:uuid:3e671687-395b-41f5-a30f-a58921a69b79",
  "version": 1,
  "metadata": {
    "component": {
      "type": "application",
      "name": "my-app",
      "version": "1.0.0"
    }
  },
  "components": [
    {
      "type": "library",
      "name": "express",
      "version": "4.18.2",
      "licenses": [{"license": {"id": "MIT"}}]
    }
  ]
}
```

---

## 九、最佳实践

| 实践 | 说明 |
|------|------|
| **版本管理** | SBOM 随软件版本一起发布 |
| **存储位置** | 与构建产物一起存储或发布到仓库 |
| **格式选择** | 推荐 SPDX JSON 或 CycloneDX JSON |
| **定期更新** | 依赖变更时重新生成 |
| **漏洞关联** | 结合漏洞数据库进行持续监控 |
| **签名验证** | 对 SBOM 进行签名确保完整性 |

---

## 十、工具选型建议

| 工具 | 适用场景 |
|------|---------|
| **Syft** | 通用、容器、多语言项目 |
| **Trivy** | 容器镜像 + SBOM + 漏洞扫描一体化 |
| **CycloneDX 工具** | 特定语言项目、IDE 集成 |
| **Microsoft SBOM Tool** | Windows 环境大规模项目 |

---

如需针对特定场景深入了解，请告诉我！