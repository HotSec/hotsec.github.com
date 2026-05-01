# 优化计划：配置文件提取 + 手绘风格点击修复

## 任务 1：summaryFileMap 移动到配置文件

### 问题分析

当前 `summaryFileMap`（约 130+ 条映射）和 `h3DirMap`（约 25 条映射）硬编码在 `index.html` 的 `<script>` 标签中，占据了大量代码空间（约 220 行），且维护不便。

### 实施步骤

1. **创建配置文件 `config.json`**：
   - 将 `h3DirMap` 和 `summaryFileMap` 提取到 `config.json` 中
   - 结构如下：
     ```json
     {
       "mybookBase": "../src/mybook",
       "h3DirMap": { ... },
       "summaryFileMap": { ... }
     }
     ```
   - 同时将 `mybookBase` 变量也移入配置文件

2. **修改 `index.html` 中的初始化逻辑**：
   - 在 `init()` 函数中，先 `fetch('config.json')` 加载配置
   - 加载成功后，将配置赋值给全局变量
   - 如果加载失败，使用空对象作为 fallback（不影响基本功能）

3. **删除 `index.html` 中的硬编码映射**：
   - 删除 `var h3DirMap = { ... };`
   - 删除 `var summaryFileMap = { ... };`
   - 删除 `var mybookBase = '../src/mybook';`
   - 改为在 `init()` 中从配置文件加载

---

## 任务 2：修复手绘风格下子节点无法点击展开/跳转

### 问题分析

**问题 A：手绘风格下节点无法点击**

根因在 `renderFishNodes` 函数（第 1110-1112 行）：
```javascript
if(isSketch){
  bubbleEl.attr('d', excalidrawRect(...))
    .attr('fill', 'none')  // ← 问题所在！
    .attr('stroke', colorHex)
    ...
}
```

SVG 中 `fill='none'` 的 `<path>` 元素，只有描边（stroke）路径能接收鼠标事件，填充区域完全透明且不可点击。用户点击气泡内部（非描边区域）时，事件会穿透到下层，导致无法触发 `node-group` 上的 click 事件。

**问题 B：最后一节子节点（summary）无法点击跳转**

根因在 `bindNodeEvents` 函数（第 954-960 行）：
```javascript
clickTimers[id] = setTimeout(function(){
  delete clickTimers[id];
  if(d.children || d._children){
    toggleNode(d);       // ← 有子节点时只折叠/展开
  } else if(d.data.slug){
    showModal(d.data.slug);  // ← 无子节点时才打开弹窗
  }
}, 250);
```

summary 节点如果同时有 `_children`（折叠的子节点），点击时只会 `toggleNode`，永远不会触发 `showModal`。但 summary 节点作为"最后一级"节点，用户期望点击后能跳转到对应的 markdown 文档。

### 实施步骤

1. **修复问题 A：手绘风格节点填充**：
   - 将 `attr('fill', 'none')` 改为 `attr('fill', 'transparent')` 或 `attr('fill', hexToRgba(colorHex, 0.01))`
   - `fill='transparent'` 使整个路径区域可接收鼠标事件，但视觉上仍然透明
   - 这是 SVG 中处理点击区域的标准做法

2. **修复问题 B：summary 节点点击逻辑**：
   - 修改 `bindNodeEvents` 中的 click 处理逻辑
   - 新逻辑：
     - 如果节点是 **summary 节点**（`isSummary=true`）：
       - 如果有对应的 md 文件路径（`resolveMdPath` 返回非 null），直接 `showModal`
       - 否则，如果有子节点，`toggleNode`
     - 如果节点是 **普通节点**：
       - 如果有子节点，`toggleNode`
       - 否则，`showModal`
   - 双击逻辑保持不变：任何节点双击都 `showModal`

3. **同步修改 dblclick 处理**：
   - 双击 summary 节点时，也优先尝试 `showModal`（如果 `resolveMdPath` 有值）
   - 保持双击非 summary 节点时的 `showModal` 行为

---

## 实施优先级

1. **任务 2**（修复点击问题）— 功能性 bug，优先修复
2. **任务 1**（配置文件提取）— 代码优化，次要

---

## 风险与注意事项

1. **配置文件加载**：`config.json` 需要通过 HTTP 服务器访问，直接打开 HTML 文件可能无法加载。需要添加 fallback 逻辑。
2. **fill='transparent'**：在某些旧版浏览器中可能不支持 `transparent` 关键字，可以使用 `rgba(0,0,0,0)` 替代。
3. **summary 节点展开/跳转冲突**：修改后 summary 节点点击将优先跳转而非展开。如果用户需要展开 summary 的子节点，需要通过其他方式（如双击或专门的展开按钮）。
