# 实施计划：优化思维导图显示效果，防止字体重叠

## 问题分析

当前径向布局中文字重叠的根本原因：

1. **节点间距不足**：`d3.tree()` 的 `separation` 函数 `(a.parent === b.parent ? 1 : 2) / a.depth` 在深层节点时间距过小（除以 depth），导致同层节点角度间隔不够
2. **文字偏移量太小**：文字距节点仅 12px，水平文字容易与相邻节点的文字/圆圈重叠
3. **字体大小统一**：所有层级都是 12px，深层节点密集区域文字更易重叠
4. **长标题未截断**：部分标题很长（如"3.2 Python工匠（最佳实践）"），水平显示时占据大量空间

## 修改方案

### 1. 增大径向半径和间距

**当前**：`radius = Math.min(width, height) / 2 - 120`
**修改**：增大基础半径，并根据节点总数动态调整

```javascript
var nodeCount = rootHierarchy.descendants().length;
var radius = Math.max(Math.min(width, height) / 2 - 80, nodeCount * 4);
```

**当前 separation**：`(a.parent === b.parent ? 1 : 2) / a.depth`
**修改**：增大最小间距，避免深层节点过度压缩

```javascript
.separation(function(a, b){
  return (a.parent === b.parent ? 1.5 : 3) / Math.max(a.depth, 1);
})
```

### 2. 文字偏移量增大 + 按层级递减

- 节点圆圈到文字的距离从 12px 增大到按层级递减的值
- 深层节点文字更靠近圆圈（因为深层节点更密集），浅层节点文字更远

```javascript
.attr('x', function(d){
  if(d.depth === 0) return 0;
  var angle = (d.x * 180 / Math.PI) % 360;
  var offset = Math.max(14, 20 - d.depth * 2);
  return angle > 90 && angle < 270 ? -offset : offset;
})
```

### 3. 按层级缩小字体

- depth 0（根）：14px，加粗
- depth 1（H2）：12px
- depth 2（H3）：11px
- depth 3+（H4-H6）：10px

```javascript
.attr('font-size', function(d){
  if(d.depth === 0) return '14px';
  if(d.depth === 1) return '12px';
  if(d.depth === 2) return '11px';
  return '10px';
})
.attr('font-weight', function(d){
  return d.depth <= 1 ? '600' : '400';
})
```

### 4. 长标题截断

超过一定长度的标题截断并加省略号，减少文字占据的弧形空间：

```javascript
.text(function(d){
  var name = d.data.name;
  var maxLen = d.depth <= 1 ? 12 : 8;
  return name.length > maxLen ? name.slice(0, maxLen) + '…' : name;
});
```

### 5. 添加文字背景遮罩（可选增强）

为文字添加半透明背景矩形，即使轻微重叠也能保持可读性。使用 SVG `<filter>` 实现文字光晕效果：

```css
.node-text{filter:url(#text-bg)}
```

```svg
<filter id="text-bg" x="-5%" y="-5%" width="110%" height="110%">
  <feFlood flood-color="var(--bg)" flood-opacity="0.85"/>
  <feComposite in="SourceGraphic"/>
</filter>
```

> 注意：SVG filter 不支持 CSS 变量，需在 JS 中动态设置 flood-color。或者改用 `<rect>` 背景方式。

**更优方案**：在每个文字后面添加一个同尺寸的 `<rect>` 背景：

```javascript
// 在 append('text') 之前先添加背景 rect
nodeGroups.each(function(d){
  var g = d3.select(this);
  var textEl = g.select('.node-text');
  var bbox = textEl.node().getBBox();
  g.insert('rect', '.node-text')
    .attr('x', bbox.x - 3)
    .attr('y', bbox.y - 1)
    .attr('width', bbox.width + 6)
    .attr('height', bbox.height + 2)
    .attr('rx', 3)
    .attr('fill', 'var(--bg)')
    .attr('opacity', 0.85);
});
```

### 6. 折叠指示器位置调整

折叠圆圈的 `cx` 偏移也需要同步调整，与文字偏移保持一致。

## 实施步骤

### Step 1：修改 `update()` 函数中的布局参数

- 增大 radius 计算
- 修改 separation 函数

### Step 2：修改文字渲染逻辑

- 增大文字偏移量（按层级递减）
- 按层级设置字体大小和粗细
- 长标题截断

### Step 3：添加文字背景遮罩

- 在文字后插入半透明背景 `<rect>`
- 背景色跟随主题（通过 JS 获取 CSS 变量值）

### Step 4：同步调整折叠指示器位置

- fold-circle 和 fold-text 的偏移量与文字偏移保持一致

### Step 5：修改 CSS

- 更新 `.node-text` 样式（移除固定 font-size，改为 JS 动态设置）

## 文件变更

仅修改 `index.html`，涉及：
1. JS `update()` 函数中的布局参数和文字渲染逻辑
2. CSS `.node-text` 规则
