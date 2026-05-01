# 实施计划：优化思维导图显示效果

## 当前问题分析

通过审查代码和数据结构，发现以下显示效果问题：

### 问题 1：初始展开层级过多
当前 `initRadialTree()` 先 `collapseAll` 再恢复一级子节点，但 ALL.md 有 7 个 H2 分支，每个 H2 下有 3-12 个 H3，展开后约 50+ 个节点同时显示，径向布局非常拥挤。

### 问题 2：连线样式单调
当前连线只是简单的贝塞尔曲线，颜色统一为半透明蓝色，缺乏层次感和视觉引导。

### 问题 3：节点视觉层次不够分明
- 根节点、分支节点、叶子节点仅靠圆圈大小区分（10/6/4px），差异太小
- 折叠节点（`_children`）的空心圆不够醒目
- 没有悬停高亮反馈（当前只有 `brightness` 滤镜，效果弱）

### 问题 4：文字背景遮罩与节点圆圈重叠
背景 `<rect>` 的位置可能覆盖节点圆圈，视觉上不干净。

### 问题 5：折叠指示器位置不合理
折叠圆圈（`fold-circle`）固定在 `cy: 14` 的位置，在径向布局中与文字方向不一致，容易重叠。

### 问题 6：展开/折叠没有动画过渡
当前 `update()` 直接删除重建所有元素，没有平滑过渡动画。

### 问题 7：根节点标题显示 "ALL"
用户已将根节点改为 "ALL"，但作为知识图谱的中心标签，可以更醒目。

---

## 优化方案

### 优化 1：默认只展开到 H2 层级

修改 `initRadialTree()` 中的初始展开逻辑，只展开根节点的直接子节点（H2），H3 及以下默认折叠。这样初始视图只有 8 个节点（1 根 + 7 H2），清爽整洁。

```javascript
// 修改前：先全部折叠，再恢复一级
rootHierarchy.children.forEach(function(child){
  collapseAll(child);
});
rootHierarchy.children.forEach(function(child){
  child.children = child._children;
  child._children = null;
});

// 修改后：只展开根节点的直接子节点
expandAll(rootHierarchy);  // 先全部展开
rootHierarchy.children.forEach(function(child){
  if(child.children){
    child.children.forEach(collapseAll);  // 折叠 H3 及以下
  }
});
```

### 优化 2：连线颜色跟随分支色

连线颜色继承源节点的分支颜色，不同分支视觉上更易区分：

```javascript
.attr('stroke', function(d){ return getNodeColor(d.source); })
.attr('stroke-opacity', 0.4)
```

### 优化 3：节点视觉层次增强

**3a. 根节点增强**：
- 更大的圆圈（r=14）
- 添加脉冲动画效果
- 文字更大更醒目（16px, bold）

**3b. 分支节点（有子节点）增强**：
- 圆圈 r=7
- 添加外圈光晕（`filter: drop-shadow`）

**3c. 叶子节点**：
- 圆圈 r=4，保持简洁

**3d. 折叠节点**：
- 空心圆 + 彩色边框 + 内部 "+" 号
- 移除单独的 fold-circle/fold-text，改为在节点圆圈上直接显示

### 优化 4：移除文字背景遮罩，改用 SVG filter 光晕

文字背景 `<rect>` 会与节点圆圈视觉冲突，改用 SVG `<filter>` 为文字添加柔和的背景光晕：

```svg
<defs>
  <filter id="text-glow" x="-10%" y="-10%" width="120%" height="120%">
    <feFlood flood-color="#0f1117" flood-opacity="0.75" result="bg"/>
    <feComposite in="bg" in2="SourceGraphic" operator="over"/>
  </filter>
</defs>
```

或者更简单：直接给文字添加 `paint-order: stroke` + 粗描边作为背景：

```css
.node-text{
  paint-order: stroke;
  stroke: var(--bg);
  stroke-width: 3px;
  stroke-linejoin: round;
}
```

这种方式更简洁，不需要额外的 `<rect>` 元素。

### 优化 5：移除独立的折叠指示器

将折叠指示合并到节点圆圈本身：
- 有子节点且已展开：实心圆 + 小圆点指示器
- 有子节点且已折叠：空心圆 + 内部显示子节点数量

移除 `fold-circle` 和 `fold-text`，简化 DOM 结构。

### 优化 6：添加展开/折叠过渡动画

使用 D3 的 `transition` 实现节点位置变化的平滑过渡：

```javascript
// 节点进入时从父节点位置开始
nodeGroups.enter()
  .attr('transform', function(d){
    var p = radialPoint(source.x0 || 0, source.y0 || 0);
    return 'translate(' + p[0] + ',' + p[1] + ')';
  })
  .transition().duration(500)
  .attr('transform', function(d){
    var p = radialPoint(d.x, d.y);
    return 'translate(' + p[0] + ',' + p[1] + ')';
  });

// 节点退出时回到父节点位置
nodeGroups.exit()
  .transition().duration(500)
  .attr('transform', function(){
    var p = radialPoint(source.x, source.y);
    return 'translate(' + p[0] + ',' + p[1] + ')';
  })
  .remove();
```

### 优化 7：根节点视觉增强

- 根节点圆圈添加脉冲动画（CSS `@keyframes pulse`）
- 根节点文字使用渐变色或特殊样式

---

## 实施步骤

### Step 1：修改初始展开逻辑
- 修改 `initRadialTree()` 中的折叠/展开逻辑，默认只展开 H2

### Step 2：重写 update() 函数
- 使用 D3 enter/update/exit 模式替代当前的删除重建
- 添加过渡动画
- 连线颜色跟随分支色
- 移除独立的 fold-circle/fold-text
- 折叠节点在圆圈内显示子节点数量

### Step 3：更新节点渲染
- 根节点：r=14，脉冲动画，文字 16px bold
- 分支节点：r=7，实心/空心区分
- 叶子节点：r=4
- 折叠节点：空心圆 + 数字

### Step 4：替换文字背景遮罩
- 移除 `<rect>` 背景方式
- 改用 `paint-order: stroke` 描边方式
- 移除 `node-text-bg` CSS 类

### Step 5：更新 CSS
- 添加根节点脉冲动画
- 更新 `.node-text` 样式（添加 stroke 描边）
- 移除 `.node-text-bg`、`.fold-circle`、`.fold-text` 样式
- 添加节点悬停增强效果

### Step 6：清理无用代码
- 移除 `getNodeColorRaw()` 函数（未被使用）
- 移除 `allNodes` 变量（未被使用）

## 文件变更

仅修改 `index.html`，涉及 CSS 和 JS 两个部分。
