# Nuclei

## 下载编译

```bash
git clone https://github.com/projectdiscovery/nuclei
cd nuclei/v2
go mod tidy
go build -o nuclei cmd/nuclei/main.go
```

## 使用帮助

> `https://github.com/projectdiscovery/nuclei`

```bash
./nuclei -h
```

## 集成到自己的项目中

现在版本的 nuclei 已经支持了集成到自己的项目中，并且提供了丰富的 API 接口，可以实现自定义的插件，自定义的输出格式，自定义的模板等等。

官方提供的示例代码：

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

    // Initialize the nuclei engine
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

    defaultOpts.Tags = goflags.StringSlice{"cve"} // 使用带有cve标签的模板
	defaultOpts.ExcludeTags = config.ReadIgnoreFile().Tags // 排除掉部分模板dos、fuzz
    defaultOpts.Interactsh = true // 使用interactsh
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
	engine := core.New(defaultOpts) // 创建核心引擎
	engine.SetExecuterOptions(executerOpts) // 设置执行器选项

    workflowLoader, err := parsers.NewLoader(&executerOpts) // 创建工作流加载器
	if err != nil {
		log.Fatalf("Could not create workflow loader: %s\n", err)
	}
	executerOpts.WorkflowLoader = workflowLoader // 设置工作流加载器

    store, err := loader.New(loader.NewConfig(defaultOpts, catalog, executerOpts)) //  创建加载器
	if err != nil {
		log.Fatalf("Could not create loader client: %s\n", err)
	}
	store.Load() // 加载模板

    inputArgs := []*contextargs.MetaInput{{Input: *target}} // 创建输入参数

    input := &inputs.SimpleInputProvider{Inputs: inputArgs} // 创建输入提供者
	_ = engine.Execute(store.Templates(), input) // 执行模板
	engine.WorkPool().Wait() // 等待工作池完成
}
```