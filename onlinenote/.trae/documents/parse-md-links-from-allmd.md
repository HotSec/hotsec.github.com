# 优化计划：从 ALL.md 解析文件链接替代配置文件映射

## 问题分析

当前方案使用 `config.json` 中的 `summaryFileMap` 映射 summary 文本到文件路径，维护成本高且容易过时。

ALL.md 文件中每个 `<details>` 块末尾已经包含 markdown 链接标签，格式如下：

```markdown
> [📄 2_数据类型.md](./mybook/go/2_核心概念/2_数据类型.md)
```

部分 details 块包含多个链接，用 `·` 分隔：

```markdown
> [📄 4_函数.md](./mybook/go/1_语言基础/4_函数.md) · [📄 5_方法.md](./mybook/go/1_语言基础/5_方法.md)
```

## 实施步骤

### 步骤 1：修改 `parseHeadings` 函数

在解析 `<summary>` 标签时，继续向下扫描直到 `</details>`，提取其中的 markdown 链接路径。

具体逻辑：
- 当匹配到 `<summary>` 标签时，记录行号
- 继续向下扫描，查找 `</details>` 之前的所有行
- 在这些行中匹配 `> [📄 xxx.md](./mybook/xxx/xxx.md)` 格式的链接
- 提取括号中的路径（如 `./mybook/go/2_核心概念/2_数据类型.md`）
- 将路径存储在 heading 对象的 `mdLinks` 数组中
- 多个链接存入数组，第一个链接作为主链接

正则匹配：`\[📄[^\]]*\]\(([^)]+)\)` 提取链接路径

### 步骤 2：修改 `resolveMdPath` 函数

新逻辑：
1. 查找 heading 对象
2. 如果 heading 有 `mdLinks` 且数组非空，取第一个链接路径
3. 将 `./mybook/` 前缀替换为 `mybookBase` + `/`（即 `../src/mybook/`）
4. 如果没有 `mdLinks`，返回 null

### 步骤 3：移除 `summaryFileMap` 和 `h3DirMap` 相关代码

- 删除 `var h3DirMap = {};`
- 删除 `var summaryFileMap = {};`
- 删除 `config.json` 中的 `h3DirMap` 和 `summaryFileMap` 字段
- 删除 `init()` 中加载 `summaryFileMap` 和 `h3DirMap` 的代码
- 保留 `mybookBase` 配置（仍需从 config.json 加载基础路径）

### 步骤 4：修改 `showModal` 弹窗显示

- 如果 summary 有多个 `mdLinks`，弹窗中显示所有链接
- 第一个链接自动加载内容，其余链接显示为"打开源文件"按钮

### 步骤 5：修改节点渲染中的文件链接指示器

- `renderFishNodes` 和其他布局中的 `file-link-indicator` 逻辑
- 改为检查 `heading.mdLinks` 而非 `resolveMdPath(d.data.slug)`
