# 实施计划：夜间/白天模式 + 配色优化 + 中心性布局

## 变更概述

对 `index.html` 进行三项增强：
1. 添加夜间/白天模式切换
2. 优化两套配色方案
3. 将思维导图布局从 markmap 左→右树形改为 D3 原生径向（中心发散）布局

---

## 步骤 1：添加夜间/白天模式切换

### 1.1 CSS 变量双主题

在 `:root` 中保留当前深色变量作为暗色主题，新增 `[data-theme="light"]` 选择器定义亮色变量：

```css
:root { /* 暗色（默认） */ }
[data-theme="light"] { /* 亮色 */ }
```

亮色主题变量：
- `--bg`: #f8f9fc
- `--bg-secondary`: #ffffff
- `--bg-tertiary`: #eef1f6
- `--text`: #2c3e50
- `--text-dim`: #8899aa
- `--text-bright`: #1a202c
- `--accent`: #4a7cf7
- `--border`: #dde2ea
- `--highlight-bg`: rgba(74,124,247,0.08)
- `--scrollbar`: #c8cdd5
- 标题颜色微调适配亮色背景

### 1.2 工具栏切换按钮

在 `.toolbar-right` 中添加主题切换按钮（太阳/月亮图标），位于现有按钮之前：

```html
<button class="btn" id="btn-theme" title="切换主题">
  <svg class="icon-sun">...</svg>
  <svg class="icon-moon">...</svg>
</button>
```

- 暗色模式显示太阳图标（点击切换到亮色）
- 亮色模式显示月亮图标（点击切换到暗色）
- 通过 CSS `display` 控制图标切换

### 1.3 JS 主题切换逻辑

- 点击按钮切换 `document.documentElement.dataset.theme`
- 将用户偏好存入 `localStorage('theme')`
- 页面加载时读取 `localStorage`，若无则跟随 `prefers-color-scheme`
- 切换主题后同步更新 highlight.js 样式表（dark ↔ light）

### 1.4 highlight.js 主题切换

- 暗色模式：`github-dark.min.css`
- 亮色模式：`github.min.css`
- 动态切换 `<link>` 的 `href` 属性

### 1.5 模态框遮罩适配

- 暗色模式：`rgba(0,0,0,0.6)`
- 亮色模式：`rgba(255,255,255,0.7)`（通过 CSS 变量 `--modal-overlay-bg`）

---

## 步骤 2：优化配色

### 2.1 暗色模式配色优化

当前配色已较好，微调：
- `--bg`: #0f1117（更深，增强对比度）
- `--bg-secondary`: #1a1d2e
- `--accent`: #6cb4ee（更亮的蓝色，提升可读性）
- 节点颜色保持不变（已足够区分层级）

### 2.2 亮色模式配色

- 节点颜色适配亮色背景：
  - H1: #c47a20（深金）
  - H2: #3b7dd8（深蓝）
  - H3: #3a9e5c（深绿）
  - H4: #e07830（深橙）
  - H5: #8b6cc0（深紫）
  - H6: #2ba8c9（深青）

### 2.3 径向布局节点颜色

由于径向布局从中心向外发散，颜色方案改为渐变式：
- 根节点：主色调
- 每个一级分支使用不同色系
- 子节点继承父节点色系，逐级变浅

---

## 步骤 3：思维导图布局改为径向（中心发散）

### 3.1 移除 markmap 依赖

markmap-view 不支持径向布局，需移除 `markmap-lib` 和 `markmap-view` 的 CDN 引用，改用 D3@7 原生实现。

### 3.2 D3 径向布局实现

使用 `d3.tree()` + `d3.linkRadial()` 实现中心发散布局：

```javascript
// 核心布局代码
var treeLayout = d3.tree()
  .size([2 * Math.PI, radius])
  .separation(function(a, b) {
    return (a.parent === b.parent ? 1 : 2) / a.depth;
  });

var root = treeLayout(d3.hierarchy(treeData));

// 径向坐标转换
function radialPoint(x, y) {
  return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
}
```

### 3.3 SVG 渲染

- 创建 SVG `<g>` 容器，支持缩放和平移（`d3.zoom()`）
- 绘制连线：`d3.linkRadial()` 生成贝塞尔曲线
- 绘制节点：`<circle>` + `<text>` 组合
- 节点文本自动旋转，保持可读性（左半圆文字翻转）

### 3.4 交互功能

- **点击节点**：弹出模态框（复用现有 `showModal()` 逻辑）
- **缩放/平移**：`d3.zoom()` 实现
- **展开/折叠**：点击节点圆圈切换 `children` 显示/隐藏，重新布局
- **工具栏按钮**：全部展开、全部折叠、适应屏幕、重置视图

### 3.5 主题适配

- 径向布局的节点颜色通过 JS 函数控制，需在主题切换时重新渲染
- 连线颜色跟随节点颜色
- 文字颜色使用 CSS 变量 `var(--text)`

---

## 步骤 4：整合测试

- 验证暗色/亮色模式切换正常
- 验证径向布局渲染正确
- 验证点击节点弹出模态框
- 验证展开/折叠功能
- 验证缩放/平移
- 验证 localStorage 持久化主题偏好
- 验证响应式布局

---

## 文件变更清单

| 文件 | 变更 |
|------|------|
| `index.html` | 所有变更集中在此文件（CSS + HTML + JS） |

### 具体变更点

1. **CSS 部分**：
   - `:root` 变量更新（暗色配色优化）
   - 新增 `[data-theme="light"]` 变量块
   - 新增主题切换按钮样式
   - 新增径向布局相关样式（节点、连线、文字）
   - 模态框遮罩颜色使用 CSS 变量

2. **HTML 部分**：
   - 移除 markmap-lib、markmap-view 的 `<script>` 标签
   - 保留 d3@7、marked、highlight.js
   - 新增主题切换按钮
   - 新增 highlight.js 亮色主题 `<link>`（默认 disabled）

3. **JS 部分**：
   - 移除 `initMarkmap()` 及所有 `mm`（markmap 实例）相关代码
   - 新增 `initRadialTree()` 函数：D3 径向布局渲染
   - 新增 `toggleNode()` 函数：展开/折叠节点
   - 新增 `fitToScreen()` 函数：适配视口
   - 新增 `setupTheme()` 函数：主题切换逻辑
   - 修改 `setupToolbar()`：适配新的渲染方式
   - 保留 `showModal()`、`hideModal()`、`getSectionContent()` 等现有逻辑
