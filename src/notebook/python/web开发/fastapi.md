# fastapi

## 快速开始

```bash
pip install fastapi uvicorn
```

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Hello World"}
```

```bash
uvicorn main:app --reload
```

## 目录结构

```bash
my_fastapi_project/
├── app/
│   ├── __init__.py
│   ├── main.py         # 应用入口
│   ├── api/            # API路由
│   │   ├── __init__.py
│   │   ├── items.py
│   │   └── users.py
│   ├── models/         # 数据模型
│   │   ├── __init__.py
│   │   └── user.py
│   ├── schemas/        # Pydantic模型
│   │   ├── __init__.py
│   │   └── user.py
│   └── db/             # 数据库相关
│       ├── __init__.py
│       └── session.py
├── tests/              # 测试代码
│   ├── __init__.py
│   └── test_api.py
├── requirements.txt    # 依赖列表
└── .env                # 环境变量
```

## 性能优化


## 高效缓存与数据存储


## 优化异步任务执行顺序

- celery
- dramatiq
- huey

