# Quart

Quart 是 Flask 的异步替代品，API 兼容 Flask 但基于 `asyncio`。

## 安装

```bash
pip install quart
```

## 最小示例

```python
from quart import Quart, jsonify

app = Quart(__name__)

@app.route("/")
async def hello():
    return jsonify({"message": "Hello, Quart!"})

@app.route("/user/<int:user_id>")
async def get_user(user_id):
    return jsonify({"user_id": user_id})
```

## 异步数据库

```python
import asyncpg

@app.before_serving
async def setup_db():
    app.db_pool = await asyncpg.create_pool(dsn="postgresql://...")

@app.route("/users")
async def list_users():
    async with app.db_pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM users")
    return jsonify([dict(r) for r in rows])
```

## WebSocket

```python
@app.websocket("/ws")
async def ws():
    while True:
        data = await websocket.receive()
        await websocket.send(f"Echo: {data}")
```

## 与 Flask 对比

| 特性 | Quart | Flask |
|------|-------|-------|
| 异步 | 原生 asyncio | 同步（需扩展） |
| API 兼容 | Flask API | - |
| WebSocket | 原生支持 | 需 flask-socketio |
| 生态 | 可复用 Flask 扩展 | 丰富 |

## 参考

- 入门教程：https://quart.palletsprojects.com/en/latest/tutorials/api_tutorial.html
