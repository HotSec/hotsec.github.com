# Nuclei 漏扫工具

## 概述

Nuclei 是基于模板的快速漏洞扫描器，使用 YAML 编写检测规则，支持多种协议。

```bash
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
```

## 基础用法

### 扫描目标

```bash
nuclei -u https://example.com
nuclei -l urls.txt
nuclei -u https://example.com -t cves/
```

### 模板选择

```bash
nuclei -u https://example.com -t cves/
nuclei -u https://example.com -t vulnerabilities/
nuclei -u https://example.com -t misconfiguration/
nuclei -u https://example.com -t exposures/
nuclei -u https://example.com -t tokens/
nuclei -u https://example.com -t takeovers/
nuclei -u https://example.com -t dns/
nuclei -u https://example.com -t http/
nuclei -u https://example.com -t network/
nuclei -u https://example.com -t ssl/

nuclei -u https://example.com -t cves/2023/
nuclei -u https://example.com -t cves/2024/

nuclei -u https://example.com -t "~cves"
nuclei -u https://example.com -t "~misconfiguration"
```

### 严重级别过滤

```bash
nuclei -u https://example.com -severity critical,high
nuclei -u https://example.com -severity low,medium
nuclei -u https://example.com -severity critical
```

### 作者过滤

```bash
nuclei -u https://example.com -author pdteam
nuclei -u https://example.com -author pdteam,geeknik
```

***

## 模板语法

### 基本结构

```yaml
id: CVE-2024-XXXXX

info:
  name: Example Vulnerability
  author: pdteam
  severity: high
  description: |
    Description of the vulnerability
  reference:
    - https://nvd.nist.gov/vuln/detail/CVE-2024-XXXXX
  tags: cve,cve2024,rce,example
  classification:
    cvss-metrics: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
    cvss-score: 9.8
    cve-id: CVE-2024-XXXXX
    cwe-id: CWE-89

http:
  - method: GET
    path:
      - "{{BaseURL}}/api/v1/users"
    headers:
      Authorization: "Bearer {{token}}"

    matchers-condition: and
    matchers:
      - type: word
        words:
          - "admin"
          - "password"
        condition: and
      - type: status
        status:
          - 200

    extractors:
      - type: regex
        regex:
          - '"token":"([a-zA-Z0-9]+)"'
```

### HTTP 模板

```yaml
id: sql-injection-test

info:
  name: SQL Injection Detection
  author: researcher
  severity: high
  tags: sqli,inject

http:
  - method: GET
    path:
      - "{{BaseURL}}/search?q=1'"
      - "{{BaseURL}}/api/item?id=1'"

    stop-at-first-match: true
    matchers-condition: or
    matchers:
      - type: word
        part: body
        words:
          - "SQL syntax"
          - "mysql_fetch"
          - "ORA-01756"
          - "PostgreSQL query failed"
        condition: or
      - type: regex
        part: body
        regex:
          - "Warning.*mysql_.*"
          - "PostgreSQL.*ERROR"
      - type: dsl
        dsl:
          - "status_code == 500"
```

### POST 请求模板

```yaml
id: login-brute-force

info:
  name: Login Brute Force
  author: researcher
  severity: medium
  tags: auth,bruteforce

http:
  - method: POST
    path:
      - "{{BaseURL}}/login"
    body: "username={{username}}&password={{password}}"
    headers:
      Content-Type: "application/x-www-form-urlencoded"

    payloads:
      username:
        - admin
        - root
      password:
        - admin123
        - password
        - 123456

    attack: pitchfork

    matchers:
      - type: word
        part: body
        words:
          - "Welcome"
          - "Dashboard"
        condition: or
      - type: word
        part: body
        negative: true
        words:
          - "Invalid credentials"
```

### 多步骤模板

```yaml
id: multi-step-exploit

info:
  name: Multi-Step Exploit
  author: researcher
  severity: critical
  tags: rce,exploit

http:
  - method: POST
    path:
      - "{{BaseURL}}/api/auth/login"
    body: '{"username":"admin","password":"admin"}'
    headers:
      Content-Type: "application/json"

    extractors:
      - type: json
        name: token
        internal: true
        json:
          - ".token"

  - method: POST
    path:
      - "{{BaseURL}}/api/admin/exec"
    headers:
      Authorization: "Bearer {{token}}"
      Content-Type: "application/json"
    body: '{"cmd":"id"}'

    matchers:
      - type: regex
        part: body
        regex:
          - "uid=\\d+\\(\\w+\\)"
```

### DNS 模板

```yaml
id: subdomain-takeover

info:
  name: Subdomain Takeover Detection
  author: pdteam
  severity: high
  tags: dns,takeover

dns:
  - name: "{{FQDN}}"
    type: CNAME

    matchers:
      - type: word
        words:
          - "aws.amazon.com"
          - "herokuapp.com"
          - "github.io"
          - "cloudfront.net"
```

### SSL 模板

```yaml
id: expired-ssl-cert

info:
  name: Expired SSL Certificate
  author: pdteam
  severity: medium
  tags: ssl

ssl:
  - address: "{{Host}}:{{Port}}"

    matchers:
      - type: dsl
        dsl:
          - "not_after < time()"
```

***

## 高级用法

### 工作流

```yaml
id: workflow-example

info:
  name: Security Scan Workflow
  author: researcher

workflows:
  - template: technologies/tech-detect.yaml
    matchers:
      - name: wordpress
        subtemplates:
          - template: cves/2023/CVE-2023-XXXX.yaml
          - template: vulnerabilities/wordpress/wp-config-exposure.yaml
      - name: apache
        subtemplates:
          - template: misconfiguration/apache-status.yaml
```

### 条件执行

```bash
nuclei -u https://example.com -cond "template_id contains 'cve'"
nuclei -u https://example.com -cond "severity == 'critical'"
```

### 输出控制

```bash
nuclei -u https://example.com -o results.txt
nuclei -u https://example.com -json -o results.json
nuclei -u https://example.com -jsonl -o results.jsonl
nuclei -u https://example.com -markdown-export report.md
nuclei -u https://example.com -sarif-export results.sarif
```

### 速率控制

```bash
nuclei -u https://example.com -rate-limit 100
nuclei -u https://example.com -bulk-size 25
nuclei -u https://example.com -c 50
nuclei -u https://example.com -timeout 10
nuclei -u https://example.com -retries 3
```

### 代理与认证

```bash
nuclei -u https://example.com -proxy http://proxy:8080
nuclei -u https://example.com -proxy socks5://proxy:1080
nuclei -u https://example.com -H "Authorization: Bearer token"
nuclei -u https://example.com -cookie "session=abc123"
```

***

## CI/CD 集成

### GitHub Actions

```yaml
name: Security Scan
on:
  schedule:
    - cron: '0 6 * * 1'
  workflow_dispatch:

jobs:
  nuclei-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Nuclei
        run: |
          go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

      - name: Update Templates
        run: nuclei -update-templates

      - name: Run Scan
        run: |
          nuclei -u ${{ secrets.TARGET_URL }} \
            -severity critical,high \
            -json -o results.json

      - name: Upload Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: nuclei-results
          path: results.json
```

### 自定义模板管理

```bash
nuclei -update-templates
nuclei -tl
nuclei -tl -tags cve
nuclei -tl -severity critical

nuclei -validate -t custom-templates/
nuclei -t custom-templates/ -u https://example.com
```

***

## 集成到自己的项目中

Nuclei 支持集成到自己的项目中，并提供了丰富的 API 接口，可以实现自定义的插件、自定义的输出格式、自定义的模板等。

```go
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"time"

	"github.com/logrusorgru/aurora"
	"github.com/projectdiscovery/goflags"
	"github.com/projectdiscovery/nuclei/v2/pkg/catalog/config"
	"github.com/projectdiscovery/nuclei/v2/pkg/catalog/disk"
	"github.com/projectdiscovery/nuclei/v2/pkg/catalog/loader"
	"github.com/projectdiscovery/nuclei/v2/pkg/core"
	"github.com/projectdiscovery/nuclei/v2/pkg/core/inputs"
	"github.com/projectdiscovery/nuclei/v2/pkg/output"
	"github.com/projectdiscovery/nuclei/v2/pkg/parsers"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols/common/contextargs"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols/common/hosterrorscache"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols/common/interactsh"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols/common/protocolinit"
	"github.com/projectdiscovery/nuclei/v2/pkg/protocols/common/protocolstate"
	"github.com/projectdiscovery/nuclei/v2/pkg/reporting"
	"github.com/projectdiscovery/nuclei/v2/pkg/testutils"
	"github.com/projectdiscovery/nuclei/v2/pkg/types"
	"github.com/projectdiscovery/ratelimit"
)

func main() {
	target := flag.String("target", "127.0.0.1", "Target URL")
	flag.Parse()

	fmt.Printf("Target: %s\n", *target)

	cache := hosterrorscache.New(30, hosterrorscache.DefaultMaxHostsCount, nil)
	defer cache.Close()

	mockProgress := &testutils.MockProgressClient{}
	reportingClient, _ := reporting.New(&reporting.Options{}, "")
	defer reportingClient.Close()

	outputWriter := testutils.NewMockOutputWriter()
	outputWriter.WriteCallback = func(event *output.ResultEvent) {
		fmt.Printf("Got Result: %v\n", event)
	}

	defaultOpts := types.DefaultOptions()
	protocolstate.Init(defaultOpts)
	protocolinit.Init(defaultOpts)

	defaultOpts.Tags = goflags.StringSlice{"cve"}
	defaultOpts.ExcludeTags = config.ReadIgnoreFile().Tags
	defaultOpts.Interactsh = true
	interactOpts := interactsh.DefaultOptions(outputWriter, reportingClient, mockProgress)
	interactClient, err := interactsh.New(interactOpts)
	if err != nil {
		log.Fatalf("Could not create interact client: %s\n", err)
	}
	defer interactClient.Close()

	home, _ := os.UserHomeDir()
	catalog := disk.NewCatalog(path.Join(home, "nuclei-templates"))
	executerOpts := protocols.ExecuterOptions{
		Output:          outputWriter,
		Options:         defaultOpts,
		Progress:        mockProgress,
		Catalog:         catalog,
		IssuesClient:    reportingClient,
		RateLimiter:     ratelimit.New(context.Background(), 150, time.Second),
		Interactsh:      interactClient,
		HostErrorsCache: cache,
		Colorizer:       aurora.NewAurora(true),
		ResumeCfg:       types.NewResumeCfg(),
	}
	engine := core.New(defaultOpts)
	engine.SetExecuterOptions(executerOpts)

	workflowLoader, err := parsers.NewLoader(&executerOpts)
	if err != nil {
		log.Fatalf("Could not create workflow loader: %s\n", err)
	}
	executerOpts.WorkflowLoader = workflowLoader

	store, err := loader.New(loader.NewConfig(defaultOpts, catalog, executerOpts))
	if err != nil {
		log.Fatalf("Could not create loader client: %s\n", err)
	}
	store.Load()

	inputArgs := []*contextargs.MetaInput{{Input: *target}}
	input := &inputs.SimpleInputProvider{Inputs: inputArgs}
	_ = engine.Execute(store.Templates(), input)
	engine.WorkPool().Wait()
}
```
