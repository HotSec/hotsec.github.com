# CSS 布局

---

## 一、Flexbox

### 1.1 容器属性

```css
.container {
    display: flex;
    flex-direction: row;        /* row | column | row-reverse | column-reverse */
    flex-wrap: wrap;            /* nowrap | wrap | wrap-reverse */
    justify-content: center;    /* flex-start | flex-end | center | space-between | space-around | space-evenly */
    align-items: center;        /* stretch | flex-start | flex-end | center | baseline */
    align-content: center;      /* 多行对齐 */
    gap: 16px;                  /* 行列间距 */
}
```

### 1.2 子项属性

```css
.item {
    flex-grow: 1;       /* 放大比例，默认 0 */
    flex-shrink: 1;     /* 缩小比例，默认 1 */
    flex-basis: auto;   /* 初始大小 */
    flex: 1;            /* grow:1 shrink:1 basis:0% */
    align-self: center; /* 单独对齐 */
    order: 1;           /* 排序 */
}
```

### 1.3 常见布局

```css
/* 水平垂直居中 */
.center {
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 导航栏 */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
}

/* 等分布局 */
.equal-cols {
    display: flex;
    gap: 16px;
}
.equal-cols > * {
    flex: 1;
}

/* 侧边栏 */
.sidebar-layout {
    display: flex;
}
.sidebar {
    flex: 0 0 250px;
}
.main-content {
    flex: 1;
}
```

---

## 二、Grid

### 2.1 容器属性

```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);        /* 3 等分列 */
    grid-template-columns: 250px 1fr 250px;        /* 固定-自适应-固定 */
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 响应式 */
    grid-template-rows: auto 1fr auto;              /* 头-主体-脚 */
    gap: 16px;
    row-gap: 16px;
    column-gap: 16px;
    grid-template-areas:
        "header header header"
        "sidebar main   aside"
        "footer footer footer";
}
```

### 2.2 子项属性

```css
.item {
    grid-column: 1 / 3;           /* 跨 2 列 */
    grid-row: 1 / 3;              /* 跨 2 行 */
    grid-area: header;            /* 命名区域 */
    place-self: center;           /* 对齐 */
    justify-self: start;
    align-self: end;
}
```

### 2.3 常见布局

```css
/* 经典页面布局 */
.page {
    display: grid;
    grid-template-areas:
        "header header"
        "sidebar main"
        "footer footer";
    grid-template-columns: 250px 1fr;
    grid-template-rows: 64px 1fr 48px;
    min-height: 100vh;
}
.page-header  { grid-area: header; }
.page-sidebar { grid-area: sidebar; }
.page-main    { grid-area: main; }
.page-footer  { grid-area: footer; }

/* 瀑布流 */
.masonry {
    columns: 3;
    column-gap: 16px;
}
.masonry > * {
    break-inside: avoid;
    margin-bottom: 16px;
}
```

---

## 三、响应式设计

### 3.1 媒体查询

```css
/* 移动优先 */
.container {
    padding: 16px;
}

/* 平板 */
@media (min-width: 768px) {
    .container {
        padding: 24px;
        max-width: 720px;
    }
}

/* 桌面 */
@media (min-width: 1024px) {
    .container {
        padding: 32px;
        max-width: 1200px;
    }
}

/* 大屏 */
@media (min-width: 1440px) {
    .container {
        max-width: 1400px;
    }
}
```

### 3.2 响应式断点

| 断点 | 宽度 | 设备 |
|------|------|------|
| xs | < 640px | 手机 |
| sm | ≥ 640px | 大手机 |
| md | ≥ 768px | 平板 |
| lg | ≥ 1024px | 笔记本 |
| xl | ≥ 1280px | 桌面 |
| 2xl | ≥ 1536px | 大屏 |

### 3.3 响应式工具

```css
/* 流式字体 */
html {
    font-size: clamp(14px, 1vw + 10px, 18px);
}

/* 容器查询 (CSS 新特性) */
.card-container {
    container-type: inline-size;
}
@container (min-width: 400px) {
    .card {
        display: flex;
        gap: 16px;
    }
}

/* aspect-ratio */
.video {
    aspect-ratio: 16 / 9;
    width: 100%;
}
```

---

## 四、定位

```css
/* 相对定位（相对自身偏移） */
.relative { position: relative; top: 10px; left: 20px; }

/* 绝对定位（相对最近定位祖先） */
.absolute { position: absolute; top: 0; right: 0; }

/* 固定定位（相对视口） */
.fixed { position: fixed; top: 0; left: 0; width: 100%; }

/* 粘性定位 */
.sticky { position: sticky; top: 0; z-index: 100; }
```

---

## 五、现代 CSS 特性

### 5.1 CSS 变量

```css
:root {
    --primary: #3b82f6;
    --bg: #ffffff;
    --text: #1f2937;
    --radius: 8px;
    --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.btn {
    background: var(--primary);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
}

/* 暗色模式 */
@media (prefers-color-scheme: dark) {
    :root {
        --bg: #1f2937;
        --text: #f9fafb;
    }
}
```

### 5.2 Container Queries

```css
.sidebar {
    container-type: inline-size;
    container-name: sidebar;
}

@container sidebar (min-width: 300px) {
    .widget { display: grid; grid-template-columns: 1fr 1fr; }
}
```

### 5.3 :has() 选择器

```css
/* 表单字段有焦点时高亮标签 */
.form-group:has(input:focus) label {
    color: var(--primary);
}

/* 卡片有图片时调整布局 */
.card:has(img) {
    grid-template-rows: 200px 1fr;
}
```
