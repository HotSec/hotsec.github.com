# Celery

Python 分布式任务队列，用于异步任务处理、定时任务、任务编排。

## 架构

```
Producer → Broker(Redis/RabbitMQ) → Worker → Backend(Redis/DB)
```

- **Broker**：消息中间件，存储任务消息（Redis / RabbitMQ / SQS）
- **Worker**：执行任务的进程，可多机分布式部署
- **Backend**：存储任务结果（Redis / RPC / Database / MongoDB）
- **Producer**：产生任务的生产者（通常是 Web 应用）

## 基础使用

### 定义任务

```python
from celery import Celery

app = Celery("tasks", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")

@app.task
def add(x, y):
    return x + y

@app.task(bind=True)
def long_task(self, n):
    for i in range(n):
        self.update_state(state="PROGRESS", meta={"current": i, "total": n})
    return {"result": n}
```

### 调用任务

```python
result = add.delay(4, 6)
result = add.apply_async(args=[4, 6], countdown=60)
result = add.apply_async(args=[4, 6], eta=datetime(2025, 1, 1))

result.id
result.status
result.ready()
result.get(timeout=10)
result.successful()
```

### 启动 Worker

```bash
celery -A tasks worker --loglevel=info
celery -A tasks worker --loglevel=info --concurrency=4
celery -A tasks worker -Q queue1,queue2
celery -A tasks worker -n worker1@%h
```

## 任务签名与编排

### Signature 签名

```python
from celery import signature

s = add.s(2, 3)
s.delay()

s = add.s(2)
s.apply_async(args=(3,))
```

### Group 并行执行

```python
from celery import group

g = group(add.s(i, i) for i in range(10))
result = g.apply_async()
result.get(timeout=10)
```

### Chain 串行执行

```python
from celery import chain

c = chain(add.s(2, 3), add.s(10))
result = c.apply_async()
result.get()

c = add.s(2, 3) | add.s(10)
```

### Chord 带回调的 Group

```python
from celery import chord

c = chord([add.s(i, i) for i in range(10)], xsum.s())
result = c.apply_async()
result.get()
```

### Starmap / chunks

```python
add.starmap([(1, 2), (3, 4), (5, 6)])
add.chunks(zip(range(100), range(100)), 10).apply_async()
```

## 定时任务

### Beat 调度器

```python
from celery.schedules import crontab

app.conf.beat_schedule = {
    "add-every-30-seconds": {
        "task": "tasks.add",
        "schedule": 30.0,
        "args": (16, 16),
    },
    "multiply-every-morning": {
        "task": "tasks.multiply",
        "schedule": crontab(hour=7, minute=30),
        "args": (3, 7),
    },
}

app.conf.timezone = "Asia/Shanghai"
```

```bash
celery -A tasks beat --loglevel=info
celery -A tasks beat -S django_celery_beat.schedulers:DatabaseScheduler
```

## 任务重试

```python
@app.task(bind=True, max_retries=3, default_retry_delay=60)
def unreliable_task(self, url):
    try:
        return requests.get(url).json()
    except requests.RequestException as exc:
        raise self.retry(exc=exc, countdown=60)

@app.task(autoretry_for=(IOError,), retry_backoff=True, retry_backoff_max=600, retry_jitter=True, max_retries=5)
def fetch_url(url):
    return requests.get(url).text
```

## 任务限流

```python
@app.task(rate_limit="10/m")
def rate_limited_task():
    pass

app.conf.task_annotations = {
    "tasks.process": {"rate_limit": "5/s"},
}
```

## 序列化

```python
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]
```

## 信号

```python
from celery.signals import task_prerun, task_postrun, task_failure, task_success

@task_prerun.connect
def task_prerun_handler(sender=None, task_id=None, task=None, **kwargs):
    print(f"Task {task.name}[{task_id}] starting")

@task_failure.connect
def task_failure_handler(sender=None, task_id=None, exception=None, **kwargs):
    print(f"Task {task_id} failed: {exception}")
```

## 配置最佳实践

```python
app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Shanghai",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    broker_connection_retry_on_startup=True,
    result_expires=3600,
)
```

## 监控

```bash
celery -A tasks events
celery -A tasks inspect active
celery -A tasks inspect reserved
celery -A tasks inspect scheduled
celery -A tasks inspect stats
flower -A tasks --port=5555
```

## 常见问题

- **任务卡住不执行**：检查 Worker 是否运行、Broker 连接是否正常、队列是否正确
- **内存泄漏**：设置 `worker_max_tasks_per_child` 定期重启 Worker 进程
- **任务重复执行**：启用 `task_acks_late` + 幂等性设计
- **结果丢失**：配置 Backend 并设置 `result_expires`
