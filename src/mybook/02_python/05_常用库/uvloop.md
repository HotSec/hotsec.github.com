# uvloop

## 安装

uvloop可从PyPI获得。它需要Python 3.5。

使用pip来安装它。

```
$ pip install uvloop
```

## 使用uvloop

使用提供的事件循环进行异步uvloop，您安装了uvloop事件循环策略:

```
import asyncio
import uvloop
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
```

或者，您可以使用以下命令手动创建循环实例:

```
import asyncio
import uvloop
loop = uvloop.new_event_loop()
asyncio.set_event_loop(loop)
```



> https://blog.csdn.net/m0_67847535/article/details/136282786
