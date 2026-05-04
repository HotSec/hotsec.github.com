# Sanic

Sanic 是一个高性能异步 Python Web 框架，基于 `asyncio` 和 `uvloop`。

## 安装

```bash
pip install sanic
```

## 最小示例

```python
from sanic import Sanic
from sanic.response import json

app = Sanic("MyApp")

@app.route("/")
async def hello(request):
    return json({"message": "Hello, Sanic!"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
```

## 路由

```python
@app.route("/user/<user_id:int>")
async def get_user(request, user_id):
    return json({"user_id": user_id})

@app.get("/posts")
async def list_posts(request):
    return json({"posts": []})

@app.post("/posts")
async def create_post(request):
    data = request.json
    return json(data, status=201)
```

## 中间件

```python
@app.middleware("request")
async def add_timestamp(request):
    request.ctx.start_time = time.time()

@app.middleware("response")
async def add_header(request, response):
    elapsed = time.time() - request.ctx.start_time
    response.headers["X-Response-Time"] = str(elapsed)
```

## 蓝图

```python
from sanic import Blueprint

bp = Blueprint("user", url_prefix="/api/users")

@bp.get("/")
async def list_users(request):
    return json({"users": []})

app.blueprint(bp)
```

## 异步数据库

```python
from sanic_ext import openapi

@app.get("/db/users")
async def db_query(request):
    pool = request.app.ctx.db_pool
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM users")
    return json([dict(r) for r in rows])
```

## 与 Flask/FastAPI 对比

| 特性 | Sanic | Flask | FastAPI |
|------|-------|-------|---------|
| 异步 | 原生 | 需扩展 | 原生 |
| 性能 | 高 | 中 | 高 |
| 生态 | 中等 | 丰富 | 丰富 |
| 自动文档 | 需扩展 | 需扩展 | 内置 |
