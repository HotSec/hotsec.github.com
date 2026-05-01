# Node.js 教程

## 运行时基础

### 模块系统

```javascript
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function hello(name) {
    return `Hello, ${name}!`;
}

export default class Calculator {
    add(a, b) { return a + b; }
}
```

### 全局对象

```javascript
console.log('Hello');
console.error('Error');
console.time('operation');
console.timeEnd('operation');

process.env.NODE_ENV;
process.argv;
process.cwd();
process.exit(0);
process.on('uncaughtException', (err) => console.error(err));
process.on('unhandledRejection', (reason) => console.error(reason));

Buffer.from('hello');
Buffer.alloc(10);
Buffer.from([1, 2, 3]);
```

***

## 文件系统

### 异步操作

```javascript
import fs from 'fs/promises';

const data = await fs.readFile('input.txt', 'utf-8');
await fs.writeFile('output.txt', data, 'utf-8');
await fs.appendFile('log.txt', 'new line\n');
await fs.copyFile('src.txt', 'dst.txt');
await fs.rename('old.txt', 'new.txt');
await fs.unlink('temp.txt');

await fs.mkdir('dir/subdir', {recursive: true});
await fs.rmdir('dir', {recursive: true});

const files = await fs.readdir('./src');
const stat = await fs.stat('package.json');
stat.isFile();
stat.isDirectory();
stat.size;
stat.mtime;

const exists = await fs.access('file.txt').then(() => true).catch(() => false);
```

### 流式操作

```javascript
import fs from 'fs';
import {pipeline} from 'stream/promises';

const readable = fs.createReadStream('large.txt', {highWaterMark: 64 * 1024});
const writable = fs.createWriteStream('copy.txt');

readable.pipe(writable);

readable.on('data', (chunk) => {
    console.log(`Read ${chunk.length} bytes`);
});
readable.on('end', () => console.log('Done'));
readable.on('error', (err) => console.error(err));

await pipeline(
    fs.createReadStream('input.gz'),
    zlib.createGunzip(),
    fs.createWriteStream('output.txt')
);
```

***

## HTTP 服务

### 原生 HTTP

```javascript
import http from 'http';

const server = http.createServer((req, res) => {
    const {method, url} = req;

    res.setHeader('Content-Type', 'application/json');

    if (url === '/api/health' && method === 'GET') {
        res.writeHead(200);
        res.end(JSON.stringify({status: 'ok'}));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({error: 'Not Found'}));
    }
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

### Express 框架

```javascript
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/api/users', async (req, res) => {
    const users = await User.findAll();
    res.json({data: users});
});

app.get('/api/users/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({error: 'User not found'});
    res.json({data: user});
});

app.post('/api/users', async (req, res) => {
    const {name, email} = req.body;
    if (!name || !email) {
        return res.status(400).json({error: 'name and email required'});
    }
    const user = await User.create({name, email});
    res.status(201).json({data: user});
});

app.put('/api/users/:id', async (req, res) => {
    const user = await User.update(req.params.id, req.body);
    res.json({data: user});
});

app.delete('/api/users/:id', async (req, res) => {
    await User.delete(req.params.id);
    res.status(204).end();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({error: 'Internal Server Error'});
});

app.listen(3000);
```

### 中间件

```javascript
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet());
app.use(cors({origin: ['https://example.com'], credentials: true}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {error: 'Too many requests'},
});
app.use('/api/', limiter);

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({error: 'No token'});

    try {
        req.user = verifyToken(token);
        next();
    } catch {
        res.status(401).json({error: 'Invalid token'});
    }
}

app.get('/api/profile', authMiddleware, (req, res) => {
    res.json({data: req.user});
});
```

***

## 异步编程

### Promise 与 async/await

```javascript
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retry(fn, maxRetries = 3, delayMs = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            await delay(delayMs * (i + 1));
        }
    }
}

const [users, posts] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
]);

const results = await Promise.allSettled([
    riskyOp1(),
    riskyOp2(),
    riskyOp3(),
]);

const fastest = await Promise.race([
    fetchFromCDN1(),
    fetchFromCDN2(),
]);
```

### 事件循环

```
   ┌──────────────────────────┐
┌─>│         timers           │  setTimeout, setInterval
│  └──────────┬───────────────┘
│  ┌──────────┴───────────────┐
│  │     pending callbacks     │  I/O callbacks
│  └──────────┬───────────────┘
│  ┌──────────┴───────────────┐
│  │       idle, prepare       │  internal
│  └──────────┬───────────────┘
│  ┌──────────┴───────────────┐
│  │         poll              │  I/O events
│  └──────────┬───────────────┘
│  ┌──────────┴───────────────┐
│  │         check             │  setImmediate
│  └──────────┬───────────────┘
│  ┌──────────┴───────────────┐
│  │     close callbacks       │
│  └──────────┬───────────────┘
│             │
└─────────────┘
```

- **microtask**：Promise.then, queueMicrotask, process.nextTick
- **macrotask**：setTimeout, setInterval, setImmediate, I/O

执行顺序：同步代码 → microtask → macrotask

***

## 流 (Streams)

### 可读流

```javascript
import {Readable} from 'stream';

const readable = Readable.from([
    Buffer.from('chunk1'),
    Buffer.from('chunk2'),
    Buffer.from('chunk3'),
]);

for await (const chunk of readable) {
    console.log(chunk.toString());
}
```

### Transform 流

```javascript
import {Transform} from 'stream';

const upper = new Transform({
    transform(chunk, encoding, callback) {
        callback(null, chunk.toString().toUpperCase());
    },
});

const jsonParser = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
        try {
            const obj = JSON.parse(chunk.toString());
            callback(null, obj);
        } catch (err) {
            callback(err);
        }
    },
});
```

***

## 子进程

```javascript
import {exec, execFile, spawn} from 'child_process';
import {promisify} from 'util';

const execAsync = promisify(exec);

const {stdout, stderr} = await execAsync('ls -la');
console.log(stdout);

const child = spawn('python', ['script.py', '--input', 'data.csv']);

child.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
    console.log(`Exit code: ${code}`);
});
```

***

## 包管理

### package.json

```json
{
    "name": "my-app",
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "node --watch src/index.js",
        "build": "tsc && node build.js",
        "start": "node dist/index.js",
        "test": "vitest",
        "lint": "eslint src/"
    },
    "dependencies": {
        "express": "^4.18.0"
    },
    "devDependencies": {
        "typescript": "^5.3.0",
        "vitest": "^1.0.0"
    },
    "engines": {
        "node": ">=18.0.0"
    }
}
```

### npm 常用命令

```bash
npm init -y
npm install express
npm install -D typescript @types/node
npm uninstall package-name
npm run dev
npm test
npm outdated
npm audit
npx create-react-app my-app
```
