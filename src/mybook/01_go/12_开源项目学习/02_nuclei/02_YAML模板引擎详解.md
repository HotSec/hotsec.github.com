
# Nuclei YAML 模板引擎详解

## 1. YAML 模板结构

Nuclei 模板是漏洞检测的核心，采用 YAML 格式描述。每个模板包含以下几个主要部分：

```yaml
id: CVE-2021-44228        # 模板唯一标识
info:                    # 元信息
  name: Log4Shell Remote Code Execution
  author: pd-team
  severity: critical
  description: Apache Log4j2 JNDI 远程代码执行漏洞
  tags: cve,cve2021,log4j,rce

http:                    # HTTP 协议请求定义
  - method: GET
    path:
      - "{{BaseURL}}/{{randstr}}"
    headers:
      User-Agent: "Mozilla/5.0"
    matchers:            # 匹配条件
      - type: word
        words:
          - "Interactsh"
        part: body
```

## 2. 解析流程

### 2.1 整体解析流程

模板解析由 [Parser](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/parser.go) 负责，完整流程如下：

```
1. 读取模板文件内容
   ↓
2. YAML 预处理（PreProcess）
   ↓
3. YAML 反序列化
   ↓
4. 验证模板结构
   ↓
5. 编译协议请求
   ↓
6. 缓存结果
```

### 2.2 Parser 结构

```go
type Parser struct {
	ShouldValidate bool
	NoStrictSyntax bool

	// parsedTemplatesCache 存储轻量级解析后的模板
	parsedTemplatesCache *Cache

	// compiledTemplatesCache 存储完整编译后的模板
	compiledTemplatesCache *Cache

	sync.Mutex
}
```

- 两层缓存：分别存储轻量解析结果和完整编译结果
- 支持严格/非严格模式解析

### 2.3 ParseTemplate 函数

[ParseTemplate](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/parser.go) 函数实现：

```go
func (p *Parser) ParseTemplate(templatePath string, catalog catalog.Catalog) (any, error) {
	// 1. 检查缓存
	value, _, err := p.parsedTemplatesCache.Has(templatePath)
	if value != nil {
		return value, err
	}

	// 2. 打开并读取文件
	reader, err := utils.ReaderFromPathOrURL(templatePath, catalog)
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = reader.Close()
	}()

	// 3. YAML 预处理（仅对本地文件）
	var data []byte
	if fileutil.FileExists(templatePath) && config.GetTemplateFormatFromExt(templatePath) == config.YAML {
		data, err = io.ReadAll(reader)
		if err != nil {
			return nil, err
		}
		data, err = yamlutil.PreProcess(data)  // 预处理
		if err != nil {
			return nil, err
		}
	}

	// 4. 反序列化
	template := &Template{}
	switch config.GetTemplateFormatFromExt(templatePath) {
	case config.JSON:
		if data == nil {
			data, err = io.ReadAll(reader)
			if err != nil {
				return nil, err
			}
		}
		err = json.Unmarshal(data, template)
	case config.YAML:
		if data != nil {
			if p.NoStrictSyntax {
				err = yaml.Unmarshal(data, template)
			} else {
				err = yaml.UnmarshalStrict(data, template)  // 严格模式
			}
		} else {
			decoder := yaml.NewDecoder(reader)
			if !p.NoStrictSyntax {
				decoder.SetStrict(true)
			}
			err = decoder.Decode(template)
		}
	}
	if err != nil {
		return nil, err
	}

	// 5. 缓存并返回
	p.parsedTemplatesCache.StoreWithoutRaw(templatePath, template, nil)
	return template, nil
}
```

## 3. 预处理机制

### 3.1 PreProcessor 接口

[预处理器](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/preprocessors.go)定义：

```go
type Preprocessor interface {
	// 处理并返回处理后的数据
	ProcessNReturnData(data []byte) ([]byte, map[string]interface{})
	// 检查是否需要处理
	Exists(data []byte) bool
}
```

### 3.2 预处理器示例：randstr

目前默认预处理器只有 `randstr` 一种，用于生成随机字符串：

```go
type randStrPreprocessor struct{}

func (r *randStrPreprocessor) Exists(data []byte) bool {
	return bytes.Contains(data, []byte("randstr"))
}

func (r *randStrPreprocessor) ProcessNReturnData(data []byte) ([]byte, map[string]interface{}) {
	foundMap := make(map[string]struct{})
	dataMap := make(map[string]interface{})
	
	for _, expression := range preprocessorRegex.FindAllStringSubmatch(string(data), -1) {
		if len(expression) != 2 {
			continue
		}
		value := expression[1]
		if stringsutil.ContainsAny(value, "(", ")") {
			continue
		}

		if _, ok := foundMap[value]; ok {
			continue
		}
		foundMap[value] = struct{}{}
		
		if strings.EqualFold(value, "randstr") || strings.HasPrefix(value, "randstr_") {
			randStr := ksuid.New().String()  // 生成 KSUID
			data = bytes.ReplaceAll(data, []byte(expression[0]), []byte(randStr))
			dataMap[expression[0]] = randStr
		}
	}
	return data, dataMap
}
```

### 3.3 预处理流程

在 [ParseTemplateFromReader](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/compile.go) 中：

```go
// 检查是否有预处理器
hasPreprocessor := false
allPreprocessors := getPreprocessors(preprocessor)
for _, preprocessor := range allPreprocessors {
	if preprocessor.Exists(data) {
		hasPreprocessor = true
		break
	}
}

if !hasPreprocessor {
	// 无预处理器直接解析
	template, err := parseTemplate(data, options)
	...
	return template, nil
}

// 有预处理器，执行预处理
generatedConstants := map[string]interface{}{}
processedData := data
for _, v := range allPreprocessors {
	var replaced map[string]interface{}
	processedData, replaced = v.ProcessNReturnData(processedData)
	generatedConstants = generators.MergeMaps(generatedConstants, replaced)
}

// 使用预处理后的数据解析
template, err := parseTemplateNoVerify(processedData, options)
...

// 合并生成的常量
template.Constants = generators.MergeMaps(template.Constants, generatedConstants)
template.Options.Constants = template.Constants
applyTemplateVerification(template, data)
```

## 4. 编译流程

### 4.1 Template 结构

[Template](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/templates.go) 结构体：

```go
type Template struct {
	ID                string              `yaml:"id" json:"id"`
	Info              model.Info          `yaml:"info" json:"info"`
	RequestsHTTP      []*http.Request     `yaml:"http,omitempty" json:"http,omitempty"`
	RequestsDNS       []*dns.Request      `yaml:"dns,omitempty" json:"dns,omitempty"`
	RequestsNetwork   []*network.Request  `yaml:"network,omitempty" json:"network,omitempty"`
	RequestsHeadless  []*headless.Request `yaml:"headless,omitempty" json:"headless,omitempty"`
	RequestsFile      []*file.Request     `yaml:"file,omitempty" json:"file,omitempty"`
	RequestsSSL       []*ssl.Request      `yaml:"ssl,omitempty" json:"ssl,omitempty"`
	RequestsWebSocket []*websocket.Request `yaml:"websocket,omitempty" json:"websocket,omitempty"`
	RequestsWHOIS     []*whois.Request    `yaml:"whois,omitempty" json:"whois,omitempty"`
	RequestsCode      []*code.Request     `yaml:"code,omitempty" json:"code,omitempty"`
	RequestsJavascript []*javascript.Request `yaml:"javascript,omitempty" json:"javascript,omitempty"`
	Workflows         []*Workflow         `yaml:"workflow,omitempty" json:"workflow,omitempty"`
	...
}
```

### 4.2 协议请求编译

[compileProtocolRequests](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/compile.go) 函数负责将模板中的协议定义转换成可执行对象：

```go
func (template *Template) compileProtocolRequests(options *protocols.ExecutorOptions) error {
	templateRequests := template.Requests()

	if templateRequests == 0 {
		return fmt.Errorf("no requests defined for %s", template.ID)
	}

	var requests []protocols.Request

	if template.hasMultipleRequests() {
		// 多协议请求保持顺序
		requests = template.RequestsQueue
		if options.Flow == "" {
			options.IsMultiProtocol = true
		}
	} else {
		// 单协议请求
		if template.HasDNSRequest() {
			requests = append(requests, template.convertRequestToProtocolsRequest(template.RequestsDNS)...)
		}
		if template.HasFileRequest() {
			requests = append(requests, template.convertRequestToProtocolsRequest(template.RequestsFile)...)
		}
		if template.HasNetworkRequest() {
			requests = append(requests, template.convertRequestToProtocolsRequest(template.RequestsNetwork)...)
		}
		// ... 其他协议
	}

	var err error
	template.Executer, err = tmplexec.NewTemplateExecuter(requests, options)
	return err
}
```

## 5. 缓存策略

### 5.1 两级缓存

1. **parsedTemplatesCache**: 轻量级缓存，存储仅反序列化后的模板，不包含编译后的请求
2. **compiledTemplatesCache**: 完整缓存，包含编译后的所有协议请求对象

### 5.2 Cache 结构

```go
type Cache struct {
	items *sync.Map
}
```

### 5.3 缓存检查与重用

在 [Parse](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/templates/compile.go) 函数中：

```go
func Parse(filePath string, preprocessor Preprocessor, options *protocols.ExecutorOptions) (*Template, error) {
	parser := getParser(options)

	if !options.DoNotCache {
		if value, _, _ := parser.compiledTemplatesCache.Has(filePath); value != nil {
			// 复制模板并应用新选项
			tplCopy := *value
			newBase := options.Copy()
			newBase.TemplateID = tplCopy.Options.TemplateID
			newBase.TemplatePath = tplCopy.Options.TemplatePath
			newBase.TemplateInfo = tplCopy.Options.TemplateInfo
			...
			
			tplCopy.Options = newBase
			tplCopy.Options.ApplyNewEngineOptions(options)

			// 更新所有请求的选项
			updateRequestOptions(&tplCopy)
			template := &tplCopy

			// 如果是全局匹配器模板
			if template.isGlobalMatchersEnabled() {
				...
				return nil, nil
			}

			// 编译工作流
			if len(template.Workflows) > 0 {
				...
			}

			if isCachedTemplateValid(template) {
				return template, nil
			}
			// 否则重新解析
		}
	}

	return parseFromSource(filePath, preprocessor, options, parser)
}
```

## 6. ExecutorOptions 传递

### 6.1 ExecutorOptions 结构

[ExecutorOptions](file:///Volumes/SN740/code/notebook/third/nuclei/pkg/protocols/protocols.go) 是一个庞大的结构体，包含了所有扫描所需的配置和依赖：

```go
type ExecutorOptions struct {
	TemplateID      string
	TemplatePath    string
	TemplateInfo    model.Info
	Output          output.Writer
	Progress        progress.Progress
	IssuesClient    *issues.Client
	...
	// 40+ 字段
}
```

### 6.2 Copy 方法

为了避免并发问题，每次使用前都需要复制：

```go
func (e *ExecutorOptions) Copy() *ExecutorOptions {
	newOptions := &ExecutorOptions{
		TemplateID:                e.TemplateID,
		TemplatePath:              e.TemplatePath,
		TemplateInfo:              e.TemplateInfo,
		Output:                    e.Output,
		Progress:                  e.Progress,
		IssuesClient:              e.IssuesClient,
		// ... 逐个复制 40+ 字段
	}
	// 注意：这是一个手动维护的深拷贝，容易遗漏新增字段！
	return newOptions
}
```

## 7. 小结

Nuclei 的 YAML 模板引擎设计优秀：

1. **分层解析**: 轻量解析 + 完整编译分离
2. **缓存策略**: 两级缓存，减少重复工作
3. **预处理机制**: 支持模板级变量预替换
4. **统一接口**: 多协议通过统一的 Request 接口抽象

主要问题点：
- ExecutorOptions 结构体过大，Copy 方法手动维护易遗漏
- Parser 存在全局变量，不利于测试和并行使用
