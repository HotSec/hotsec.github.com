# 实施计划：优化节点展开效果

## 当前问题分析

### 问题 1：新节点从错误位置出现
当前 `nodeEnter` 的初始位置使用 `radialPoint(source.x0, source.y0)`，但 `source` 是被点击的节点，`x0/y0` 是上一次的位置而非当前位置。当连续点击不同节点时，新节点可能从错误位置飞入。

### 问题 2：气泡没有缩放动画
新节点进入时只是 `opacity: 0→1`，没有缩放效果。气泡从无到有应该是从小到大弹出，更有视觉冲击力。

### 问题 3：退出节点没有缩放收缩
节点退出时只是 `opacity: 1→0` + 移动到父节点位置，没有缩小效果。应该先缩小再消失。

### 问题 4：气泡尺寸变化没有过渡
当节点从展开变为折叠时，气泡的宽度/高度/边框样式瞬间变化，没有平滑过渡。

### 问题 5：连线没有从父节点位置展开
新连线进入时 `opacity: 0→1`，但路径形状直接跳到最终位置。应该从父节点位置逐渐展开到子节点位置。

### 问题 6：所有动画时长相同
所有层级节点使用相同的 500ms 动画，缺乏层次感。深层节点应该更快完成动画。

---

## 优化方案

### 优化 1：修复新节点初始位置

将 `nodeEnter` 的初始位置改为被点击节点（source）的**当前位置**（`source.x, source.y`），而非历史位置：

```javascript
var nodeEnter = nodeSel.enter().append('g')
  .attr('class', 'node-group')
  .attr('transform', function(){
    var p = radialPoint(source.x, source.y);
    return 'translate(' + p[0] + ',' + p[1] + ')';
  })
  .attr('opacity', 0);
```

### 优化 2：新节点弹出缩放动画

新节点从 `scale(0)` 弹出到 `scale(1)`，配合 `opacity` 和弹性缓动：

```javascript
nodeEnter.append('rect').attr('class', 'node-bubble')
  .attr('transform', 'scale(0)');  // 初始缩放为0

// 更新时
nodeUpdate.select('.node-bubble')
  .transition().duration(duration)
  .attr('transform', 'scale(1)');  // 过渡到正常大小
```

更好的方案：对整个 `node-group` 使用 `scale` 变换，这样气泡和文字一起缩放：

```javascript
// nodeEnter
.attr('transform', function(){
  var p = radialPoint(source.x, source.y);
  return 'translate(' + p[0] + ',' + p[1] + ') scale(0)';
})

// nodeUpdate transition
.attr('transform', function(d){
  return 'translate(' + d.px + ',' + d.py + ') scale(1)';
});
```

使用弹性缓动 `d3.easeBackOut` 让弹出更有弹性感。

### 优化 3：退出节点缩小消失

退出节点先缩小到 `scale(0)` 再移除：

```javascript
nodeSel.exit().transition().duration(duration * 0.6)
  .attr('transform', function(){
    var p = radialPoint(source.x, source.y);
    return 'translate(' + p[0] + ',' + p[1] + ') scale(0)';
  })
  .attr('opacity', 0)
  .remove();
```

使用 `d3.easeBackIn` 让收缩更有弹性。

### 优化 4：连线从父节点展开

新连线从父节点位置（零长度）逐渐展开到子节点位置：

```javascript
var linkEnter = linkSel.enter().append('path')
  .attr('class', 'link-path')
  .attr('opacity', 0)
  .attr('d', function(d){
    // 初始路径：从父节点到父节点（零长度）
    return d3.linkRadial().angle(function(dd){ return dd.x; }).radius(function(dd){ return dd.y; })({
      source: d.source,
      target: d.source  // 目标也是源，零长度
    });
  });
```

退出连线收缩回父节点：

```javascript
linkSel.exit().transition().duration(duration * 0.6)
  .attr('d', function(d){
    return d3.linkRadial().angle(function(dd){ return dd.x; }).radius(function(dd){ return dd.y; })({
      source: d.source,
      target: d.source
    });
  })
  .attr('opacity', 0)
  .remove();
```

### 优化 5：气泡样式过渡动画

为气泡的 `width`、`height`、`stroke-dasharray` 等属性添加过渡：

```javascript
g.select('.node-bubble')
  .transition().duration(duration * 0.5)
  .attr('width', bw)
  .attr('height', bh)
  .attr('stroke-dasharray', isFolded ? '4,3' : 'none');
```

### 优化 6：分层动画延迟

深层节点的动画延迟更大，形成从中心向外扩散的波浪效果：

```javascript
var delay = d.depth * 80;  // 每层延迟80ms
nodeUpdate.transition().duration(duration)
  .delay(delay)
  .attr('transform', ...);
```

但需要注意：延迟只在 enter 时生效，update 时不延迟（否则移动已有节点会感觉卡顿）。

实现方式：给 enter 和 update 分别设置不同的 transition：

```javascript
// enter: 有延迟的弹出
nodeEnter.transition().duration(duration)
  .delay(function(d){ return d.depth * 60; })
  .attr('transform', function(d){ return 'translate(' + d.px + ',' + d.py + ') scale(1)'; })
  .attr('opacity', 1);

// update: 无延迟的平滑移动
nodeSel.transition().duration(duration)
  .attr('transform', function(d){ return 'translate(' + d.px + ',' + d.py + ') scale(1)'; })
  .attr('opacity', 1);
```

### 优化 7：使用弹性缓动函数

- 节点进入：`d3.easeBackOut`（弹出效果）
- 节点退出：`d3.easeBackIn`（收缩效果）
- 节点移动：`d3.easeCubicOut`（平滑移动）
- 连线：`d3.easeCubicInOut`

---

## 实施步骤

### Step 1：修改 `update()` 函数

1. 修复 `nodeEnter` 初始位置（使用 `source.x, source.y`）
2. 添加 `scale(0)` 初始缩放
3. 分离 enter 和 update 的 transition（enter 有延迟，update 无延迟）
4. 退出节点添加 `scale(0)` 收缩
5. 连线进入/退出添加路径动画
6. 使用弹性缓动函数

### Step 2：修改气泡样式更新

为气泡属性变化添加 `transition()`。

### Step 3：调整 CSS

- 确保 `.node-bubble` 的 `transform-origin` 为中心（SVG 中默认是 0,0，需要设置）
- 由于 SVG `<rect>` 的 `transform-origin` 需要特殊处理，改用 `<g>` 的 `scale` 更简单

### 关键实现细节

SVG 中 `transform-origin` 默认是 `(0, 0)`，而我们需要以气泡中心为原点缩放。由于气泡的 `<rect>` 已经以中心为原点定位（`x: -bw/2, y: -bh/2`），所以对 `node-group` 整体 `scale` 即可，不需要额外设置 `transform-origin`。

---

## 文件变更

仅修改 `index.html` 的 JS `update()` 函数部分。
