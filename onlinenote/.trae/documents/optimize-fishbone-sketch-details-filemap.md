# 优化计划：鱼骨图连线、Excalidraw手绘风格、details/summary解析、跳转md文件

## 需求分析

### 1. 鱼骨图连线问题检查与优化
**现状**：鱼骨图使用自定义布局算法，连线从气泡边缘出发，使用肘形连接器。可能存在的问题：
- 根节点到一级子节点的连线可能不够美观
- 同一侧的连线可能重叠
- 连线与气泡的间距不均匀

**优化方案**：
- 检查并修复根节点连线：根节点居中，左右两侧子节点连线应从根节点气泡的左/右边缘出发
- 优化连线间距：确保连线之间不重叠
- 优化圆角半径和弯曲度

### 2. 手绘图改为 Excalidraw 风格
**现状**：手绘图使用 `sketchRect` 和 `sketchPolyline` 函数，通过 jitter 添加随机抖动模拟手绘效果，但风格较为简陋。

**Excalidraw 风格特征**：
- 线条：略带弧度的手绘线条，不是直线抖动，而是整体有弧度
- 矩形：边角有轻微的不规则，但整体形状保持矩形，边线有弧度
- 文字：使用手绘风格字体（可用 Google Fonts 的 Virgil 字体）
- 颜色：更柔和的配色，边框颜色更深
- 填充：使用斜线填充（hachure）而非纯色填充
- 连线：带弧度的曲线，而非折线

**实施方案**：
- 引入 Excalidraw 风格字体（Virgil）通过 Google Fonts CDN
- 重写 `sketchRect` 函数：使用弧线而非抖动直线绘制矩形边框
- 重写连线绘制：使用带弧度的贝塞尔曲线而非折线
- 添加斜线填充（hachure fill）替代纯色半透明填充
- 调整配色方案，使用更柔和的颜色

### 3. 提取 details 中的 summary 作为子节点
**现状**：`parseHeadings` 只解析 `#` 标题，不解析 `<details><summary>` 标签。ALL.md 中大量使用 details/summary 结构，summary 是 H3/H4 下的更细粒度知识点。

**ALL.md 结构示例**：
```markdown
### 1.1 语言基础

#### 基础语法

<details>
<summary>数据类型</summary>

- 基本类型：int, float, string, bool
- 复合类型：array, slice, map, struct

</details>

<details>
<summary>变量声明与控制结构</summary>

- var / := 短变量声明
- if / for / switch / select

</details>
```

**实施方案**：
- 修改 `parseHeadings` 函数，同时解析 `<summary>` 标签
- summary 的层级 = 其上方最近的 `#` 标题层级 + 1
- 为 summary 生成唯一的 slug
- 在 `buildHeadingTree` 中将 summary 节点作为对应标题的子节点
- summary 节点在思维导图中显示为更小的气泡
- 点击 summary 节点时，弹窗显示 details 内的内容

**具体修改**：
```javascript
function parseHeadings(text){
  var lines = text.split('\n');
  var result = [];
  var counter = {};
  var lastHeadingLevel = 0;
  
  lines.forEach(function(line, idx){
    // 解析 # 标题
    var m = line.match(/^(#{1,6})\s+(.+)$/);
    if(m){
      var level = m[1].length;
      var t = m[2].trim();
      lastHeadingLevel = level;
      // ... 生成 slug 和 push
    }
    // 解析 <summary> 标签
    var sm = line.match(/^<summary>(.+?)<\/summary>/);
    if(sm){
      var t = sm[1].trim();
      var level = lastHeadingLevel + 1;  // 比上一个标题深一级
      // ... 生成 slug 和 push，标记 isSummary: true
    }
  });
  return result;
}
```

### 4. 跳转最后一级节点打开对应 markdown 文档
**现状**：点击叶子节点弹窗显示 ALL.md 中对应章节的内容。

**需求**：点击最后一级节点（summary 节点）时，打开 `/Users/m5/Desktop/notebook/src/mybook` 路径下对应的 markdown 文档。

**映射关系**：
ALL.md 的标题结构与 mybook 目录结构高度对应：
- `## 一、Go` → `go/`
- `### 1.1 语言基础` → `go/1_语言基础/`
- `#### 基础语法` → `go/1_语言基础/` (H4 不一定有独立目录)
- `<summary>数据类型</summary>` → `go/1_语言基础/2_数据类型.md`

**映射算法**：
1. 从 H2 标题提取目录名（如"一、Go" → "go"）
2. 从 H3 标题提取子目录名（如"1.1 语言基础" → "1_语言基础"）
3. 从 summary 文本提取文件名（如"数据类型" → 在子目录中搜索包含该关键词的 .md 文件）

**具体映射规则**：
- H2 标题映射到顶层目录：
  - "一、Go" → "go"
  - "二、C/C++" → "cpp"
  - "三、Python" → "python"
  - "四、Lua" → "lua"
  - "五、Web（前端）" → "web"
  - "六、安全" → "security"
  - "七、通用基础" → 需要根据 H3 子标题映射到不同目录
- H3 标题映射到子目录：提取编号和名称，如 "1.1 语言基础" → "1_语言基础"
- summary 映射到文件：在子目录中搜索文件名包含 summary 文本的 .md 文件

**实施方案**：
- 创建一个映射表 `categoryDirMap`，将 H2 标题映射到目录名
- 创建函数 `resolveMdPath(headingPath)` 根据标题路径解析对应的 md 文件路径
- 由于前端无法直接读取本地文件系统，需要：
  - 方案 A：在 ALL.md 的 summary 标签中添加 `data-file` 属性指定文件路径
  - 方案 B：创建一个路径映射 JSON 文件，前端加载后根据标题路径查找
  - 方案 C：使用算法自动推算路径，前端通过 fetch 尝试加载

**推荐方案 B**：创建 `filemap.json` 文件，包含 summary 到 md 文件的映射关系。这样最可靠，且不需要修改 ALL.md。

但由于我们无法扫描文件系统生成 JSON，采用**方案 C**（算法推算 + fetch 验证）：
1. 根据 H2/H3/summary 标题推算可能的文件路径
2. 尝试 fetch 该路径，如果成功则打开，否则回退到弹窗显示 ALL.md 内容
3. 由于 onlinenote 目录和 mybook 目录不在同一位置，需要配置基础路径

**路径配置**：
- 在 index.html 中添加配置变量 `var mybookBasePath = '../src/mybook'`
- 或者通过相对路径 `../../src/mybook` 访问（需要确认实际路径关系）
- 实际路径：`/Users/m5/Desktop/notebook/src/mybook`
- onlinenote 路径：`/Users/m5/Desktop/notebook/onlinenote`
- 相对路径：`../src/mybook`

---

## 实施步骤

### 步骤 1：修复鱼骨图连线
- 检查 `updateTree` 函数中连线计算逻辑
- 优化根节点到一级子节点的连线：从根节点气泡左/右边缘出发
- 确保连线不穿过任何气泡
- 优化连线的圆角和弯曲度

### 步骤 2：实现 Excalidraw 手绘风格
- 在 HTML head 中引入 Virgil 字体：`<link href="https://fonts.googleapis.com/css2?family=Virgil&display=swap" rel="stylesheet">`
  - 备选：使用 `https://excalidraw.com/Virgil.woff2` 或 CDN
- 重写 `sketchRect` 函数：使用二次贝塞尔曲线绘制弧形边框
- 新增 `hachureFill` 函数：生成斜线填充路径
- 重写连线绘制：使用带弧度的贝塞尔曲线
- 调整配色：使用更柔和的颜色，边框更深
- 文字使用 Virgil 字体

### 步骤 3：解析 details/summary
- 修改 `parseHeadings` 函数，添加 `<summary>` 解析
- summary 的层级 = 上方最近标题的层级 + 1
- 为 summary 添加 `isSummary: true` 标记
- 修改 `buildHeadingTree`，确保 summary 节点正确挂载到父标题下
- 修改 `getSectionContent`，支持 summary 节点获取 details 内的内容
- 在思维导图中为 summary 节点使用不同的样式（更小的气泡、不同的圆角）

### 步骤 4：跳转 md 文件
- 添加 `mybookBasePath` 配置变量
- 创建 `categoryDirMap` 映射表
- 创建 `resolveMdPath` 函数，根据标题路径推算 md 文件路径
- 修改节点点击事件：summary 节点（最后一级）点击时尝试 fetch md 文件
- 如果 fetch 成功，弹窗显示 md 文件内容
- 如果 fetch 失败，回退到显示 ALL.md 中的 details 内容
- 弹窗中添加"打开源文件"链接

---

## 修改文件清单

1. `/Users/m5/Desktop/notebook/onlinenote/index.html` - 主要修改文件
2. 无需创建新文件

## 关键注意事项

1. Virgil 字体可能需要从 Excalidraw CDN 加载，Google Fonts 可能没有该字体
2. summary 解析需要处理嵌套 details 的情况（虽然 ALL.md 中似乎没有嵌套）
3. 文件路径推算需要处理中文标题到目录名的映射，需要建立完整的映射表
4. fetch 本地文件需要通过 HTTP 服务器，不能直接用 file:// 协议
5. Excalidraw 风格的斜线填充（hachure）会增加 SVG 渲染负担，需要注意性能
