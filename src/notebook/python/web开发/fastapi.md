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

## Sentry错误追踪

```bash
pip install sentry-sdk[flask]
```

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="https://examplePublicKey@o0.ingest.sentry.io/0",
    integrations=[FlaskIntegration()]
)
```

## 指标监控

```bash
pip install prometheus-flask-exporter
```

```python
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

@app.route("/")
def hello():
    return "Hello, World!"

if __name__ == "__main__":
    app.run()
```

```bash
uvicorn main:app --reload
```

