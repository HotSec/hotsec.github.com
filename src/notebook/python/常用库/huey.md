# huey

## 介绍

 *一个轻量级的选择* 。

Huey 是：

* 任务队列
* 用 Python 编写
* 干净简单的 API
* redis、sqlite、文件系统或内存存储
* [示例代码](https://github.com/coleifer/huey/tree/master/examples/)。
* [阅读文档](https://huey.readthedocs.io/)。

Huey 支持：

* 多进程、多线程或 Greenlet 任务执行模型
* 将任务安排在给定时间或在给定延迟后执行
* 安排重复任务，如 crontab
* 自动重试失败的任务
* 任务优先级
* 任务结果存储
* 任务过期
* 任务锁定
* 任务管道和链

## 例子

[](https://github.com/coleifer/huey#at-a-glance)

```python
from huey import RedisHuey, crontab

huey = RedisHuey('my-app', host='redis.myapp.com')

@huey.task()
def add_numbers(a, b):
    return a + b

@huey.task(retries=2, retry_delay=60)
def flaky_task(url):
    # This task might fail, in which case it will be retried up to 2 times
    # with a delay of 60s between retries.
    return this_might_fail(url)

@huey.periodic_task(crontab(minute='0', hour='3'))
def nightly_backup():
    sync_all_data()
```

调用 -decorated 函数会将 由消费者执行。将立即返回一个特殊的结果句柄 可用于在任务完成后获取结果：`task`

```
>>> from demo import add_numbers
>>> res = add_numbers(1, 2)
>>> res
<Result: task 6b6f36fc-da0d-4069-b46c-c0d4ccff1df6>

>>> res()
3
```

可以将任务安排在将来运行：

```
>>> res = add_numbers.schedule((2, 3), delay=10)  # Will be run in ~10s.
>>> res(blocking=True)  # Will block until task finishes, in ~10s.
5
```

## 运行 Consumer

[](https://github.com/coleifer/huey#running-the-consumer)

使用 4 个 worker 进程运行使用者：

```
$ huey_consumer.py my_app.huey -k process -w 4
```

要使用单个工作线程运行使用者（默认）：

```
$ huey_consumer.py my_app.huey
```

如果您的工作负载主要受 IO 限制，则可以使用线程运行使用者 或绿皮。因为 greenlet 非常轻量级，所以您可以运行相当多的 他们中的少数有效：

```
$ huey_consumer.py my_app.huey -k greenlet -w 32
```
