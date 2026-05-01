# 实施计划：思维导图文字水平显示

## 问题

当前径向布局中，节点文字沿径向方向旋转（跟随节点角度），导致左半圆和右半圆的文字方向不一致，阅读体验差。

## 修改方案

将节点文字改为始终水平显示（不旋转），仅根据节点所在角度调整文字偏移方向和锚点。

### 具体修改

修改 `index.html` 中 `nodeGroups.append('text')` 部分（约第 407-429 行）：

**当前逻辑**：
- `transform` 属性根据角度旋转文字（`rotate(angle)` 或 `rotate(angle-180)`）
- `x` 偏移根据角度方向设为 ±12
- `text-anchor` 根据角度设为 `start`/`end`
- 左半圆文字使用 `node-text-flip` class 做 `scale(-1,-1)` 翻转

**修改后逻辑**：
- 移除 `transform` 中的 `rotate`（文字始终水平）
- 移除 `node-text-flip` class（不再需要翻转）
- 根据节点角度计算文字偏移方向：
  - 右半圆（角度 0°~90° 和 270°~360°）：文字在节点右侧，`x=+12`，`text-anchor=start`
  - 左半圆（角度 90°~270°）：文字在节点左侧，`x=-12`，`text-anchor=end`
  - 根节点：文字在上方，`x=0`，`text-anchor=middle`，`dy=-18px`
- `dy` 统一为 `0.35em`（根节点除外）

### 代码变更

```javascript
// 修改前
nodeGroups.append('text')
  .attr('class', function(d){
    var angle = (d.x * 180 / Math.PI) % 360;
    return 'node-text' + (angle > 90 && angle < 270 ? ' node-text-flip' : '');
  })
  .attr('dy', function(d){ return d.depth === 0 ? '-18px' : '0.35em'; })
  .attr('x', function(d){
    var angle = (d.x * 180 / Math.PI) % 360;
    if(d.depth === 0) return 0;
    return angle > 90 && angle < 270 ? -12 : 12;
  })
  .attr('text-anchor', function(d){
    if(d.depth === 0) return 'middle';
    var angle = (d.x * 180 / Math.PI) % 360;
    return angle > 90 && angle < 270 ? 'end' : 'start';
  })
  .attr('transform', function(d){
    if(d.depth === 0) return '';
    var angle = (d.x * 180 / Math.PI) % 360;
    if(angle > 90 && angle < 270) return 'rotate(' + (angle - 180) + ')';
    return 'rotate(' + angle + ')';
  })
  .text(function(d){ return d.data.name; });

// 修改后
nodeGroups.append('text')
  .attr('class', 'node-text')
  .attr('dy', function(d){ return d.depth === 0 ? '-18px' : '0.35em'; })
  .attr('x', function(d){
    if(d.depth === 0) return 0;
    var angle = (d.x * 180 / Math.PI) % 360;
    return angle > 90 && angle < 270 ? -12 : 12;
  })
  .attr('text-anchor', function(d){
    if(d.depth === 0) return 'middle';
    var angle = (d.x * 180 / Math.PI) % 360;
    return angle > 90 && angle < 270 ? 'end' : 'start';
  })
  .text(function(d){ return d.data.name; });
```

同时移除 CSS 中不再需要的 `.node-text-flip` 规则：

```css
/* 删除这行 */
.node-text-flip{transform:scale(-1,-1)}
```

## 变更范围

仅修改 `index.html` 一个文件，涉及：
1. JS 中 `nodeGroups.append('text')` 部分：移除 `transform` rotate 和 `node-text-flip` class
2. CSS 中 `.node-text-flip` 规则：删除
