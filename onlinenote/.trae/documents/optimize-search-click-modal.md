# 优化计划：搜索功能、点击交互优化、弹框全屏/编辑

## 需求分析

### 1. 搜索功能
- 在工具栏添加搜索输入框，支持实时搜索标题
- 搜索结果以下拉列表展示，点击结果项定位到对应节点并展开路径
- 匹配的节点高亮显示，支持模糊匹配

### 2. 点击交互优化
- **当前行为**：点击有子节点的节点 → 展开/折叠；点击叶子节点 → 弹窗显示内容
- **期望行为**：点击气泡/标题文字 → 展开下一级子节点；根节点点击 → 弹窗显示对应 markdown 文档
- 需要区分"展开"和"查看内容"两种操作：
  - 单击 → 展开下一级（如果已展开则折叠）
  - 双击 → 弹窗显示对应 markdown 内容
  - 叶子节点（无子节点）→ 单击直接弹窗

### 3. 弹框全屏/编辑功能
- 弹框头部添加"全屏"按钮，点击后弹框全屏显示
- 弹框头部添加"编辑"按钮，点击后切换为 markdown 源码编辑模式
- 编辑模式下可修改内容，提供"保存"按钮将修改写回（前端内存中）

---

## 实施步骤

### 步骤 1：添加搜索功能

**CSS 新增：**
- `.search-wrap`：搜索框容器，放在工具栏左侧标题后面
- `.search-input`：搜索输入框样式
- `.search-dropdown`：搜索结果下拉列表
- `.search-item`：搜索结果项，hover 高亮
- `.search-highlight`：节点搜索高亮样式

**HTML 新增：**
- 在 `.toolbar-left` 中添加搜索框容器
  ```html
  <div class="search-wrap">
    <input class="search-input" id="search-input" placeholder="搜索标题..." />
    <div class="search-dropdown" id="search-dropdown"></div>
  </div>
  ```

**JS 新增：**
- `setupSearch()` 函数：
  - 监听 `input` 事件，实时过滤 headings 数组
  - 渲染匹配结果到下拉列表（显示标题文本 + 层级标签）
  - 点击结果项：
    1. 展开该节点的所有祖先节点（从根到目标节点的路径）
    2. 调用 `update()` 刷新视图
    3. 高亮目标节点（添加 CSS class 或修改样式）
    4. 平滑缩放到目标节点位置
  - 按 Escape 清空搜索并关闭下拉
  - 点击外部关闭下拉
- `expandPathToNode(slug)` 函数：展开从根到指定 slug 节点的路径
- `highlightNode(slug)` 函数：高亮指定节点
- `focusNode(slug)` 函数：缩放平移到指定节点

### 步骤 2：优化点击交互逻辑

**修改节点点击行为：**

当前代码（三个 update 函数中都有）：
```javascript
allNodes.on('click', function(e, d){
  e.stopPropagation();
  if(d.children || d._children){
    toggleNode(d);  // 有子节点 → 展开/折叠
  } else if(d.data.slug){
    showModal(d.data.slug);  // 叶子节点 → 弹窗
  }
});
```

修改为：
```javascript
allNodes.on('click', function(e, d){
  e.stopPropagation();
  if(d.children || d._children){
    toggleNode(d);  // 有子节点 → 展开/折叠下一级
  }
  // 所有节点（包括根节点）都可以弹窗查看内容
  if(d.data.slug){
    // 延迟判断，避免双击时触发
    if(d._clickTimer) return;
    d._clickTimer = setTimeout(function(){
      d._clickTimer = null;
    }, 250);
  }
});

allNodes.on('dblclick', function(e, d){
  e.stopPropagation();
  e.preventDefault();
  if(d._clickTimer){
    clearTimeout(d._clickTimer);
    d._clickTimer = null;
  }
  if(d.data.slug){
    showModal(d.data.slug);
  }
});
```

**根节点特殊处理：**
- 根节点 `slug` 为空字符串，需要为其生成一个有效的 slug
- 修改 `buildHeadingTree` 函数，为根节点也赋予 slug（使用 H1 标题的 slug）
- 修改 `getSectionContent` 函数，支持根节点 slug 获取完整文档内容
- 修改 `findPathToSlug` 函数，支持根节点路径查找

**具体修改：**
1. `buildHeadingTree` 中：`var root = {name: rootName, slug: rootSlug, level: 0, children: []};`
   - `rootSlug` 取自 H1 标题的 slug
2. `getSectionContent` 中：如果 slug 对应根节点，返回整个 markdown 文档内容
3. `findPathToSlug` 中：从 `treeData` 本身开始搜索（而非仅从 `treeData.children`）

### 步骤 3：弹框全屏功能

**CSS 新增：**
- `.modal.fullscreen`：全屏模式样式
  ```css
  .modal.fullscreen{width:100%;max-width:100%;max-height:100vh;height:100vh;border-radius:0}
  ```
- `.modal-actions`：弹框头部操作按钮组
- `.modal-action-btn`：操作按钮样式

**HTML 修改：**
- 在 `.modal-header` 中添加操作按钮组
  ```html
  <div class="modal-actions">
    <button class="modal-action-btn" id="btn-fullscreen" title="全屏">⛶</button>
    <button class="modal-action-btn" id="btn-edit" title="编辑">✎</button>
  </div>
  ```

**JS 新增：**
- `setupModalActions()` 函数：
  - 全屏按钮点击：切换 `.modal` 的 `.fullscreen` class
  - 全屏图标在两种状态间切换（⛶ ↔ ⛟）
  - 按 Escape 退出全屏

### 步骤 4：弹框编辑功能

**CSS 新增：**
- `.modal-edit-area`：编辑区域 textarea 样式
  ```css
  .modal-edit-area{width:100%;height:100%;background:var(--bg-tertiary);color:var(--text);border:none;padding:16px;font-family:monospace;font-size:14px;resize:none;outline:none}
  ```

**HTML 修改：**
- 在 `.modal-body` 中添加编辑区域（默认隐藏）
  ```html
  <div class="markdown-body" id="markdown-body"></div>
  <textarea class="modal-edit-area" id="modal-edit-area" style="display:none"></textarea>
  ```

**JS 新增：**
- 编辑模式状态管理：`var isEditing = false; var currentEditSlug = '';`
- 编辑按钮点击：
  - 切换编辑模式
  - 进入编辑：获取原始 markdown 文本显示在 textarea 中，隐藏预览
  - 退出编辑：显示预览，隐藏 textarea
  - 编辑模式下按钮文字变为"预览"
- 保存按钮（编辑模式下显示）：
  - 将 textarea 中的内容更新到内存中的 `markdownText`
  - 重新解析 headings
  - 刷新弹窗预览内容
  - 显示"已保存"提示

**弹框头部按钮布局：**
```
[面包屑导航]                    [全屏] [编辑/预览] [关闭]
```

---

## 修改文件清单

仅修改 `/Users/m5/Desktop/notebook/onlinenote/index.html`，所有变更集中在此文件。

## 关键注意事项

1. 搜索功能的下拉列表 z-index 需高于思维导图 SVG
2. 双击事件需要阻止单击事件的默认行为，使用定时器区分单击/双击
3. 根节点 slug 需要特殊处理，因为当前 `buildHeadingTree` 中根节点 slug 为空
4. 编辑功能仅修改前端内存中的 markdownText，不写回文件（纯前端无法写文件）
5. 全屏模式下弹框需要覆盖整个视口
6. 搜索高亮需要在三种布局模式下都能正确显示
