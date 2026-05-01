# 实施计划：节点气泡化 + 连线连接气泡

## 当前状态

当前节点渲染方式：
- 小圆圈（`<circle>`）表示节点位置
- 文字（`<text>`）放在圆圈旁边，水平显示
- 连线（`<path>`）使用 `d3.linkRadial()` 连接节点中心点
- 折叠指示器在圆圈内显示数字

## 目标效果

每个节点渲染为一个**圆角矩形气泡**，标题文字在气泡内部，连线连接到气泡边缘而非中心点。

效果示意：
```
        ┌──────────┐
        │  一、Go   │
        └────┬─────┘
             │
    ┌────────┴────────┐
    │                  │
┌───┴────┐        ┌───┴──────┐
│ 1.1 语言 │        │ 1.2 核心概念 │
│  基础    │        └───────────┘
└─────────┘
```

## 修改方案

### 1. 节点渲染改为气泡

将 `<circle>` + 旁边 `<text>` 改为 `<rect>` + 内部 `<text>` 的气泡样式：

**每个节点组包含**：
- `<rect>` — 圆角矩形背景，填充分支色半透明背景 + 分支色边框
- `<text>` — 标题文字，居中显示在矩形内
- 折叠节点：气泡内右下角小数字角标

**气泡尺寸**：
- 根据文字长度动态计算宽度（先渲染文字获取 `getBBox()`，再设置 rect 尺寸）
- 高度按层级递减：根节点 36px，depth 1 为 28px，depth 2 为 24px，depth 3+ 为 20px
- 内边距：水平 10px，垂直 4px
- 圆角：6px

**气泡样式**：
- 填充：分支色 15% 透明度（如 `rgba(108,180,238,0.15)`）
- 边框：分支色，1.5px
- 根节点：填充分支色 25%，边框 2.5px，更大圆角 10px
- 折叠节点：虚线边框（`stroke-dasharray: 4,3`）

### 2. 连线连接到气泡边缘

当前 `d3.linkRadial()` 连接节点中心点，需要改为连接到气泡边缘。

**方案**：不使用 `d3.linkRadial()`，改用手动计算贝塞尔曲线，从父节点气泡边缘到子节点气泡边缘。

**计算方式**：
1. 父节点中心 `(px, py)`，子节点中心 `(cx, cy)`
2. 计算从父中心到子中心的方向角
3. 从父中心沿方向角偏移半个气泡宽度/高度，得到连接起点
4. 从子中心沿反方向偏移半个气泡宽度/高度，得到连接终点
5. 用三次贝塞尔曲线连接两点

**简化方案**（更可靠）：
- 连线仍然从节点中心出发，但设置 `pointer-events: none`，气泡覆盖在连线上方
- 视觉上连线看起来连接到气泡边缘（因为气泡遮住了中心到边缘的部分）
- 这是最简单且视觉效果好的方案

**采用简化方案**，因为：
1. 径向布局中气泡大小各异，精确计算边缘交点复杂
2. 气泡覆盖连线中心部分，视觉上等价于连线连接到边缘
3. 代码改动最小，稳定性最高

### 3. 文字不再截断

由于文字在气泡内部，不再需要截断。气泡宽度会根据文字长度自适应。但为了防止过长的标题导致气泡过大，设置最大宽度：

- depth 0：不限制
- depth 1：最大 120px（约 8 个汉字）
- depth 2：最大 100px（约 7 个汉字）
- depth 3+：最大 80px（约 5 个汉字）

超出最大宽度时仍截断加省略号。

### 4. 布局间距调整

气泡比圆圈+文字占据更多空间，需要增大布局参数：

- `separation` 从 `(1.5 | 3) / max(depth, 1)` 改为 `(2 | 4) / max(depth, 1)`
- 半径计算增大系数：`nodeCount * 5`（之前 3.5）

### 5. 气泡渲染顺序

SVG 元素按添加顺序渲染，后添加的在上层。需要确保：
- 连线（`.link-path`）先渲染（在下层）
- 气泡节点（`.node-group`）后渲染（在上层，覆盖连线中心部分）

当前代码中连线已经先于节点渲染，无需调整。

---

## 实施步骤

### Step 1：修改 CSS

- 移除 `.node-circle`、`.root-pulse`、`.fold-count` 样式
- 新增 `.node-bubble` 样式（圆角矩形）
- 新增 `.node-bubble-text` 样式（气泡内文字）
- 新增 `.fold-badge` 样式（折叠角标）

### Step 2：修改 `update()` 函数

**节点渲染**：
1. `nodeEnter` 中用 `<rect class="node-bubble">` + `<text class="node-bubble-text">` + `<text class="fold-badge">` 替换 `<circle>` + `<text>` + `<text class="fold-count">`
2. 先渲染文字，获取 `getBBox()` 计算气泡尺寸
3. 设置 rect 的 x/y/width/height/rx

**气泡尺寸计算**：
```javascript
function getBubbleSize(d) {
  var fontSize = d.depth === 0 ? 16 : d.depth === 1 ? 13 : d.depth === 2 ? 11 : 10;
  var text = truncateText(d.data.name, d.depth);
  var maxWidth = d.depth === 0 ? 200 : d.depth === 1 ? 120 : d.depth === 2 ? 100 : 80;
  var charWidth = fontSize * 0.7;  // 估算
  var textWidth = Math.min(text.length * charWidth, maxWidth);
  var height = d.depth === 0 ? 36 : d.depth === 1 ? 28 : d.depth === 2 ? 24 : 20;
  var paddingH = 10;
  return { width: textWidth + paddingH * 2, height: height, fontSize: fontSize };
}
```

**连线**：保持 `d3.linkRadial()` 不变，连线从中心到中心，气泡覆盖中心部分。

### Step 3：修改 `truncateText()`

调整最大长度以匹配气泡最大宽度。

### Step 4：修改布局参数

增大 `separation` 和半径系数。

### Step 5：修改点击交互

- 点击气泡整体触发交互（不是只点击圆圈）
- 有子节点：展开/折叠
- 叶子节点：弹出模态框

### Step 6：修改 `initRadialTree()`

初始展开逻辑不变（只展开 H2）。

---

## 文件变更

仅修改 `index.html`，涉及 CSS 和 JS 两部分。
