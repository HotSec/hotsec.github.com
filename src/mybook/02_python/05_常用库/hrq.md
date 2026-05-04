# HRQ

HRQ（High Reliability Queue）是一个基于 Redis 的 Python 分布式任务队列。

## 核心特性

- 基于 Redis 实现，无需额外中间件
- 支持任务优先级
- 支持定时任务和延迟任务
- 任务重试与失败处理
- 分布式 worker 支持

## 安装

```bash
pip install hrq
```

## 基本使用

### 定义任务

```python
from hrq import HRQ

queue = HRQ(redis_url="redis://localhost:6379/0")

@queue.task
def send_email(to, subject, body):
    print(f"Sending email to {to}: {subject}")
    return True
```

### 提交任务

```python
send_email.delay("user@example.com", "Hello", "Welcome!")
send_email.apply_async(args=("user@example.com", "Hello", "Welcome!"), delay=60)
```

### 启动 Worker

```bash
hrq worker --queue default
```

## 配置选项

```python
queue = HRQ(
    redis_url="redis://localhost:6379/0",
    default_queue="default",
    result_ttl=500,          # 结果保留时间（秒）
    default_timeout=180,     # 任务超时时间
    max_retries=3,           # 最大重试次数
)
```

## 与 Celery 对比

| 特性 | HRQ | Celery |
|------|-----|--------|
| 依赖 | 仅 Redis | Redis/RabbitMQ 等 |
| 复杂度 | 低 | 高 |
| 功能丰富度 | 基础 | 丰富 |
| 适用场景 | 轻量级任务 | 复杂任务编排 |
