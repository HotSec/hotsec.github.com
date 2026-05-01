# HTML5 基础

## 语义化标签

### 文档结构

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="页面描述">
    <title>HTML5 语义化页面</title>
</head>
<body>
    <header>
        <nav>
            <a href="/">首页</a>
            <a href="/about">关于</a>
            <a href="/contact">联系</a>
        </nav>
    </header>

    <main>
        <article>
            <header>
                <h1>文章标题</h1>
                <time datetime="2024-01-15">2024年1月15日</time>
            </header>
            <p>文章内容...</p>
            <section>
                <h2>章节标题</h2>
                <p>章节内容...</p>
            </section>
            <footer>
                <p>作者: Alice</p>
            </footer>
        </article>

        <aside>
            <h2>侧边栏</h2>
            <p>相关内容...</p>
        </aside>
    </main>

    <footer>
        <p>&copy; 2024 My Site</p>
    </footer>
</body>
</html>
```

### 语义标签对照

| 标签 | 用途 | 替代 `<div>` |
|------|------|-------------|
| `<header>` | 页头/区块头 | `<div class="header">` |
| `<nav>` | 导航 | `<div class="nav">` |
| `<main>` | 主内容 | `<div class="main">` |
| `<article>` | 独立内容 | `<div class="article">` |
| `<section>` | 内容分区 | `<div class="section">` |
| `<aside>` | 侧边内容 | `<div class="aside">` |
| `<footer>` | 页脚/区块尾 | `<div class="footer">` |
| `<figure>` | 图文组合 | `<div class="figure">` |
| `<details>` | 可展开详情 | `<div class="details">` |
| `<time>` | 时间日期 | `<span class="time">` |
| `<mark>` | 标记高亮 | `<span class="mark">` |

***

## 表单增强

### 新输入类型

```html
<form>
    <label>邮箱: <input type="email" required></label>
    <label>电话: <input type="tel" pattern="[0-9]{11}"></label>
    <label>网址: <input type="url" placeholder="https://"></label>
    <label>日期: <input type="date" min="2024-01-01"></label>
    <label>时间: <input type="time"></label>
    <label>月份: <input type="month"></label>
    <label>颜色: <input type="color" value="#3b82f6"></label>
    <label>范围: <input type="range" min="0" max="100" step="5"></label>
    <label>搜索: <input type="search" placeholder="搜索..."></label>
    <label>数字: <input type="number" min="0" max="100" step="1"></label>
    <button type="submit">提交</button>
</form>
```

### 表单验证

```html
<form novalidate>
    <label>
        用户名:
        <input type="text" required minlength="3" maxlength="20"
               pattern="[a-zA-Z0-9_]+"
               title="只允许字母、数字和下划线">
    </label>

    <label>
        密码:
        <input type="password" required minlength="8"
               id="password">
    </label>

    <label>
        确认密码:
        <input type="password" required
               id="confirm-password">
    </label>

    <button type="submit">注册</button>
</form>

<script>
const form = document.querySelector('form');
const password = document.getElementById('password');
const confirm = document.getElementById('confirm-password');

confirm.addEventListener('input', () => {
    if (confirm.value !== password.value) {
        confirm.setCustomValidity('密码不匹配');
    } else {
        confirm.setCustomValidity('');
    }
});

form.addEventListener('submit', (e) => {
    if (!form.checkValidity()) {
        e.preventDefault();
        form.reportValidity();
    }
});
</script>
```

***

## Canvas API

### 基础绘图

```html
<canvas id="myCanvas" width="400" height="300"></canvas>

<script>
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#3b82f6';
ctx.fillRect(20, 20, 150, 100);

ctx.strokeStyle = '#ef4444';
ctx.lineWidth = 3;
ctx.strokeRect(200, 20, 150, 100);

ctx.beginPath();
ctx.arc(100, 200, 50, 0, Math.PI * 2);
ctx.fillStyle = '#10b981';
ctx.fill();
ctx.stroke();

ctx.beginPath();
ctx.moveTo(200, 200);
ctx.lineTo(350, 250);
ctx.lineTo(350, 150);
ctx.closePath();
ctx.fillStyle = '#f59e0b';
ctx.fill();

ctx.font = '24px Arial';
ctx.fillStyle = '#1f2937';
ctx.textAlign = 'center';
ctx.fillText('Hello Canvas', 200, 280);
</script>
```

### 动画

```javascript
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let x = 0;
const speed = 2;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(x, canvas.height / 2, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();

    x += speed;
    if (x > canvas.width + 20) x = -20;

    requestAnimationFrame(draw);
}

draw();
```

***

## Web Storage

### localStorage / sessionStorage

```javascript
localStorage.setItem('user', JSON.stringify({name: 'Alice', age: 30}));
const user = JSON.parse(localStorage.getItem('user'));

localStorage.removeItem('user');
localStorage.clear();

sessionStorage.setItem('token', 'abc123');
const token = sessionStorage.getItem('token');

const storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get(key, defaultValue = null) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    },
    remove(key) {
        localStorage.removeItem(key);
    },
    clear() {
        localStorage.clear();
    },
};
```

### IndexedDB

```javascript
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
    const db = event.target.result;
    if (!db.objectStoreNames.contains('users')) {
        const store = db.createObjectStore('users', {keyPath: 'id'});
        store.createIndex('name', 'name', {unique: false});
        store.createIndex('email', 'email', {unique: true});
    }
};

request.onsuccess = (event) => {
    const db = event.target.result;

    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');

    store.add({id: 1, name: 'Alice', email: 'alice@example.com'});
    store.put({id: 1, name: 'Alice Updated', email: 'alice@example.com'});
    store.get(1).onsuccess = (e) => console.log(e.target.result);
    store.delete(1);

    const index = store.index('name');
    index.getAll('Alice').onsuccess = (e) => console.log(e.target.result);
};
```

***

## Web Workers

### 创建 Worker

```javascript
const worker = new Worker('worker.js');

worker.postMessage({type: 'compute', data: [1, 2, 3, 4, 5]});

worker.onmessage = (event) => {
    console.log('Result:', event.data);
};

worker.onerror = (error) => {
    console.error('Worker error:', error);
};

worker.terminate();
```

```javascript
self.onmessage = function(event) {
    const {type, data} = event.data;

    if (type === 'compute') {
        const result = heavyComputation(data);
        self.postMessage({type: 'result', data: result});
    }
};

function heavyComputation(data) {
    return data.reduce((sum, n) => sum + n * n, 0);
}
```

### 内联 Worker

```javascript
const code = `
    self.onmessage = function(e) {
        const result = e.data.reduce((s, n) => s + n, 0);
        self.postMessage(result);
    };
`;

const blob = new Blob([code], {type: 'application/javascript'});
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage([1, 2, 3, 4, 5]);
worker.onmessage = (e) => console.log('Sum:', e.data);
```

***

## 拖放 API

```html
<div id="drop-zone" style="width:300px;height:200px;border:2px dashed #999;">
    拖放文件到此处
</div>

<script>
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#3b82f6';
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = '#999';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#999';

    const files = e.dataTransfer.files;
    for (const file of files) {
        console.log(`File: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
    }
});
</script>
```

***

## Geolocation API

```javascript
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            console.log(`Lat: ${pos.coords.latitude}, Lng: ${pos.coords.longitude}`);
            console.log(`Accuracy: ${pos.coords.accuracy}m`);
        },
        (err) => {
            console.error('Geolocation error:', err.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
        }
    );

    const watchId = navigator.geolocation.watchPosition(
        (pos) => console.log(pos.coords),
        (err) => console.error(err)
    );

    navigator.geolocation.clearWatch(watchId);
}
```

***

## WebSocket

```javascript
const ws = new WebSocket('wss://example.com/ws');

ws.onopen = () => {
    console.log('Connected');
    ws.send(JSON.stringify({type: 'hello', data: 'world'}));
};

ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log('Received:', msg);
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

ws.onclose = (event) => {
    console.log(`Closed: code=${event.code}, reason=${event.reason}`);
};

function sendMessage(type, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({type, data}));
    }
}
```

***

## Intersection Observer

```javascript
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(entry.target);
            }
        });
    },
    {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
    }
);

document.querySelectorAll('.lazy-load').forEach((el) => {
    observer.observe(el);
});
```

***

## Web Components

```javascript
class MyCard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});

        shadow.innerHTML = `
            <style>
                .card {
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .card h3 { margin: 0 0 8px; }
                .card p { color: #6b7280; margin: 0; }
            </style>
            <div class="card">
                <h3><slot name="title">Default Title</slot></h3>
                <p><slot name="description">Default description</slot></p>
            </div>
        `;
    }
}

customElements.define('my-card', MyCard);
```

```html
<my-card>
    <span slot="title">Card Title</span>
    <span slot="description">Card description text</span>
</my-card>
```
