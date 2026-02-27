# redis

- [1. 介绍](#1-介绍)
  - [1.1. 使用Redis有哪些好处？](#11-使用redis有哪些好处)
  - [1.2. redis相比memcached有哪些优势？](#12-redis相比memcached有哪些优势)
  - [1.3. redis常见性能问题和解决方案：](#13-redis常见性能问题和解决方案)
  - [1.4. MySQL里有2000w数据，redis中只存20w的数据，如何保证redis中的数据都是热点数据](#14-mysql里有2000w数据redis中只存20w的数据如何保证redis中的数据都是热点数据)
  - [1.5. Memcache与Redis的区别都有哪些？](#15-memcache与redis的区别都有哪些)
  - [1.6. Redis 常见的性能问题都有哪些？如何解决？](#16-redis-常见的性能问题都有哪些如何解决)
  - [1.7. redis 最适合的场景](#17-redis-最适合的场景)
- [2. 安装](#2-安装)
- [3. 入门](#3-入门)
  - [3.1. 连接池](#31-连接池)
  - [3.2. 基础操作](#32-基础操作)
  - [3.3. String](#33-string)
  - [3.4. List](#34-list)
  - [3.5. Set](#35-set)
  - [3.6. Hash](#36-hash)
  - [3.7. ZSet](#37-zset)
  - [3.8. 管道](#38-管道)
  - [3.9. Geo](#39-geo)
  - [3.10. hyperloglog](#310-hyperloglog)
  - [3.11. bitmap](#311-bitmap)
  - [3.12. Pub/Sub](#312-pubsub)
  - [3.13. sentinel](#313-sentinel)
- [4. 主从复制](#4-主从复制)
- [5. 哨兵模式](#5-哨兵模式)
- [6. 集群模式](#6-集群模式)
- [7. 分布式锁](#7-分布式锁)
- [8. 面试题](#8-面试题)

## 1. 介绍

### 1.1. 使用Redis有哪些好处？

- 速度快，因为数据存在内存中，类似于HashMap，HashMap的优势就是查找和操作的时间复杂度都是O(1)
- 支持丰富数据类型，支持string，list，set，sorted set，hash HyperLogLog、Geo、Pub/Sub、Bitmaps
- 支持事务，操作都是原子性，所谓的原子性就是对数据的更改要么全部执行，要么全部不执行
- 丰富的特性：可用于缓存，消息，按key设置过期时间，过期后将会自动删除

### 1.2. redis相比memcached有哪些优势？

1. memcached所有的值均是简单的字符串，redis作为其替代者，支持更为丰富的数据类型
2. redis的速度比memcached快很多
3. redis可以持久化其数据

### 1.3. redis常见性能问题和解决方案：

- Master最好不要做任何持久化工作，如RDB内存快照和AOF日志文件
- 如果数据比较重要，某个Slave开启AOF备份数据，策略设置为每秒同步一次
- 为了主从复制的速度和连接的稳定性，Master和Slave最好在同一个局域网内
- 尽量避免在压力很大的主库上增加从库
- 主从复制不要用图状结构，用单向链表结构更为稳定，即：Master <- Slave1 <- Slave2 <- Slave3... 这样的结构方便解决单点故障问题，实现Slave对Master的替换。如果Master挂了，可以立刻启用Slave1做Master，其他不变。

### 1.4. MySQL里有2000w数据，redis中只存20w的数据，如何保证redis中的数据都是热点数据
  
- 相关知识：redis 内存数据集大小上升到一定大小的时候，就会施行数据淘汰策略。
- redis 提供 6种数据淘汰策略：
  - volatile-lru：从已设置过期时间的数据集（server.db[i].expires）中挑选最近最少使用的数据淘汰
  - volatile-ttl：从已设置过期时间的数据集（server.db[i].expires）中挑选将要过期的数据淘汰
  - volatile-random：从已设置过期时间的数据集（server.db[i].expires）中任意选择数据淘汰
  - allkeys-lru：从数据集（server.db[i].dict）中挑选最近最少使用的数据淘汰
  - allkeys-random：从数据集（server.db[i].dict）中任意选择数据淘汰
  - no-enviction（驱逐）：禁止驱逐数据

### 1.5. Memcache与Redis的区别都有哪些？

- 区别
  - 类型
    - memcached：
      - 支持内存
      - key-value键值对形式
      - 缓存系统
    - redis
      - 支持内存
      - 非关系型数据库
  - 数据支持类型
    - Memcache对数据类型支持相对简单。
      - 文本型
      - 二进制类型
    - Redis有复杂的数据类型。
      - string、
      - list、
      - set、
      - hash、
      - zset
  - 存储方式
    - Memecache把数据全部存在内存之中，断电后会挂掉，数据不能超过内存大小。
    - Redis有部份存在硬盘上，这样能保证数据的持久性。 RDB AOF
  - value大小？
    - redis最大可以达到1GB，而memcache只有1MB
  - 查询（操作）类型
    - redis
    - memcached
  - 网络IO模型
    - redis: 单进程模式？
    - memcaced: 多线程、非阻塞io模式
  - 事件库
    - redis: 自封装AeEvent
    - memcached: libevent
  - 附加功能
    - redis: 发布订阅模式、事务、每个类型不同的crud、
    - memcached: crud 、少量的其它命令

### 1.6. Redis 常见的性能问题都有哪些？如何解决？

1. Master写内存快照，save命令调度rdb Save函数，会阻塞主线程的工作，当快照比较大时对性能影响是非常大的，会间断性暂停服务，所以Master最好不要写内存快照。
2. Master AOF持久化，如果不重写AOF文件，这个持久化方式对性能的影响是最小的，但是AOF文件会不断增大，AOF文件过大会影响Master重启的恢复速度。Master最好不要做任何持久化工作，包括内存快照和AOF日志文件，特别是不要启用内存快照做持久化,如果数据比较关键，某个Slave开启AOF备份数据，策略为每秒同步一次。
3. Master调用BGREWRITEAOF重写AOF文件，AOF在重写的时候会占大量的CPU和内存资源，导致服务load过高，出现短暂服务暂停现象。
4. Redis主从复制的性能问题，为了主从复制的速度和连接的稳定性，Slave和Master最好在同一个局域网内

### 1.7. redis 最适合的场景

Redis最适合所有数据in-momory的场景。

- 果简单地比较Redis与Memcached的区别
  1. Redis不仅仅支持简单的k/v类型的数据，同时还提供list，set，zset，hash等数据结构的存储。
  2. Redis支持数据的备份，即master-slave模式的数据备份。
  3. Redis支持数据的持久化，可以将内存中的数据保持在磁盘中，重启的时候可以再次加载进行使用。

- 会话缓存（Session Cache）
  - 会话缓存（session cache）。

- 全页缓存（FPC）

- 队列
  - 提供 list 和 set 操作，能作为一个消息队列平台来使用。Redis作为队列使用的操作，就类似于本地程序语言（如Python）对 list 的 push/pop 操作。
  - 例如，Celery有一个后台就是使用Redis作为broker。

- 排行榜/计数器
  - Redis在内存中对数字进行递增或递减的操作实现的非常好。集合（Set）和有序集合（Sorted Set)。
  - zset 数据结构让你可以很容易的实现排行榜的功能。
- 发布/订阅
  - 最后（但肯定不是最不重要的）是Redis的发布/订阅功能。发布/订阅的使用场景确实非常多。我已看见人们在社交网络连接中使用，还可作为基于发布/订阅的脚本触发器，甚至用Redis的发布/订阅功能来建立聊天系统。

## 2. 安装

`https://github.com/redis/redis-py`

## 3. 入门

- 示例

```python
>>> import redis
>>> r = redis.Redis(host='localhost', port=6379, db=0)
>>> r.set('foo', 'bar')
True
>>> r.get('foo')
b'bar'
```

### 3.1. 连接池

```python
>>> pool = redis.ConnectionPool(host='localhost', port=6379, db=0)
>>> r = redis.Redis(connection_pool=pool)
```

### 3.2. 基础操作

- set
  - set(name, value, ex=None, px=None, nx=False, xx=False)
  - 在Redis中设置值，默认，不存在则创建，存在则修改
    - ex，过期时间（秒）
    - px，过期时间（毫秒）
    - nx，如果设置为True，则只有name不存在时，当前set操作才执行
    - xx，如果设置为True，则只有name存在时，当前set操作才执行
- setnx(name,value)
  - 设置值，只有name不存在时，执行设置操作（添加）
- setex(name,value,time)
  - 设置值， time 过期时间
- mset(*args, **kwargs)
  - 批量设置值
  - mset(k1='v1', k2='v2')
  - mget({'k1': 'v1', 'k2': 'v2'})
- get(name)
  - 根据key获取值
- getset(name, value)
  - 设置新值并返回旧值
- mget(keys, *args)
  - 批量获取
- keys(pattern='*')
  - 根据模型获取key
  - keys('*')
  - keys('user:*')
- exists(name)
  - 判断name是否存在
- expire(name, time)
  - 为name设置过期时间
- rename(src, dst)
  - 重命名
- type(name)
  - 获取值的类型
- delete(names, *args)
  - 根据key删除
- unlink(names, *args)
  - 根据key删除（非阻塞删除）
- flushdb()
  - 清空当前库
- flushall()
  - 清空所有库
- save
- bgsave

### 3.3. String

### 3.4. List

### 3.5. Set

### 3.6. Hash

### 3.7. ZSet

### 3.8. 管道

```python
>>> pipe = r.pipeline()
>>> pipe.set('foo', 5)
>>> pipe.set('bar', 18.5)
>>> pipe.set('blee', "hello world!")
>>> pipe.execute()
[True, True, True]
```

### 3.9. Geo

```python
>>> r = redis.Redis(host='localhost', port=6379, db=0)
>>> r.geoadd('mycity', 116.404, 39.915, '北京')
1
>>> r.geoadd('mycity', 121.4737, 31.2304, '上海')
1
>>> r.geodist('mycity', '北京', '上海', unit='km')
1068.6984
>>> r.geodist('mycity', '北京', '上海', unit='mi')
664.9114
```

### 3.10. hyperloglog

```python
>>> r = redis.Redis(host='localhost', port=6379, db=0)
>>> r.pfadd('hll1', 'a', 'b', 'c', 'd', 'e')
1
>>> r.pfadd('hll2', 'c', 'd', 'e', 'f', 'g')
1
>>> r.pfmerge('hll3', 'hll1', 'hll2')
True
>>> r.pfcount('hll3')
7
```

### 3.11. bitmap

```python
>>> r = redis.Redis(host='localhost', port=6379, db=0)
>>> r.setbit('mykey', 7, 1)
True
>>> r.setbit('mykey', 8, 0)
True
>>> r.getbit('mykey', 7)
1
>>> r.getbit('mykey', 8)
0
>>> r.bitcount('mykey')
1
```

### 3.12. Pub/Sub

```python
>>> r = redis.Redis(...)
>>> p = r.pubsub()
>>> p.subscribe('my-first-channel', 'my-second-channel', ...)
>>> p.get_message()
{'pattern': None, 'type': 'subscribe', 'channel': b'my-second-channel', 'data': 1}
```

### 3.13. sentinel
  
- sentinel主要用于在redis主从复制中，如果master顾上，则自动将slave替换成master

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-
 
from redis.sentinel import Sentinel
 
# 连接哨兵服务器(主机名也可以用域名)
sentinel = Sentinel([('127.0.0.1', 26379),
                     ('127.0.0.2', 26380),
                     ],
                    socket_timeout=0.5)
 
# 获取主服务器地址
master = sentinel.discover_master('mymaster')
print(master)

# 获取从服务器地址
slave = sentinel.discover_slaves('mymaster')
print(slave)

# 获取主服务器进行写入
master = sentinel.master_for('mymaster')
master.set('foo', 'bar')
 
# 获取从服务器进行读取（默认是round-roubin）
slave = sentinel.slave_for('mymaster', password='redis_auth_pass')
r_ret = slave.get('foo')
print(r_ret)
```

## 4. 主从复制

```conf
# 配置主节点的ip和端口
slaveof 192.168.1.10 6379
# 从redis2.6开始，从节点默认是只读的
slave-read-only yes
# 假设主节点有登录密码，是123456
masterauth 123456
```

或 `./redis-server --slaveof 192.168.1.10 6379`

```python
# 创建主实例
master = redis.Redis(host='127.0.0.1', port=6379)

# 创建从实例
slave1 = redis.Redis(host='127.0.0.1', port=6380)
slave2 = redis.Redis(host='127.0.0.1', port=6381)

# 启用主从复制功能
master.replicate(slave1)
master.replicate(slave2)
```

## 5. 哨兵模式

`redis> redis-sentinel /path/to/sentinel.conf`

```conf
# 禁止保护模式
protected-mode no
# 配置监听的主服务器，这里sentinel monitor代表监控mymaster代表服务器的名称，可以自定义，
#192.168.1.10代表监控的主服务器，6379代表端口，2代表有两个或两个以上的哨兵认为主服务器不可用的时候，才会进failover操作。
sentinel monitor mymaster 192.168.1.10 6379 2

# sentinel down-after-milliseconds 被监控主节点名称 毫秒数
sentinel down-after-milliseconds mymaster 60000

# sentinel failover-timeout 被监控主节点名称 毫秒数
sentinel failover-timeout mymaster 180000

# sentinel author-pass定义服务的密码，mymaster是服务称，123456是Redis服务器密码
sentinel auth-pass mymaster 123456
```

```python
# 创建哨兵实例
sentinel = redis.sentinel(master='127.0.0.1:6379',
                           slaves=[{'ip': '127.0.0.1', 'port': 6380},
                                   {'ip': '127.0.0.1', 'port': 6381}])

# 启用哨兵功能
sentinel.master_failover('master')
```

## 6. 集群模式

集群部署至少要 3 台以上的master节点，最好使用 3 主 3 从六个节点的模式

redis.conf

```conf
# 开启集群模式
cluster-enabled yes

# 节点超时时间
cluster-node-timeout 15000
# 配置集群模式下的配置文件名称和位置,redis-cluster.conf这个文件是集群启动后自动生成的，不需要手动配置。
cluster-config-file redis-cluster.conf
```

启动Redis节点：使用如下命令启动6个节点：
`redis> redis-server redis_7001.conf`
创建Redis Cluster：使用Redis命令行工具执行如下命令创建Cluster：
`redis> redis-cli --cluster create 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 127.0.0.1:7006 --cluster-replicas 1`
cluster-replicas 表示从节点的数量，1代表每个主节点都有一个从节点。
验证Cluster模式：向Cluster发送请求，观察请求是否正确路由到相应的节点。

`redis-trib.rb create --replicas 1 192.168.1.11:6379 192.168.1.21:6379 192.168.1.12:6379 192.168.1.22:6379 192.168.1.13:6379 192.168.1.23:6379`

```python
# 创建多个Redis实例
redis_instances = [redis.Redis(host='127.0.0.1', port=6379),
                   redis.Redis(host='127.0.0.1', port=6380),
                   redis.Redis(host='127.0.0.1', port=6381)]

# 启用集群功能
redis_instances[0].cluster(nodes=[{'host': '127.0.0.1', 'port': 6379},
                                  {'host': '127.0.0.1', 'port': 6380},
                                  {'host': '127.0.0.1', 'port': 6381}])
```

```conf
port 6380
requirepass 123456
masterauth 123456
protected-mode no
daemonize no
appendonly yes
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-announce-ip 192.168.0.87
cluster-announce-port 6380
cluster-announce-bus-port 16380

port 6381
requirepass 123456
masterauth 123456
protected-mode no
daemonize no
appendonly yes
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-announce-ip 192.168.0.87
cluster-announce-port 6381
cluster-announce-bus-port 16381

port 6382
requirepass 123456
masterauth 123456
protected-mode no
daemonize no
appendonly yes
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 15000
cluster-announce-ip 192.168.0.87
cluster-announce-port 6382
cluster-announce-bus-port 16382


version: "3.2"

# 定义服务，可以多个
services:
  redis-cluster:
    image: redis:6.0.8
    command: redis-cli -a 123456  --cluster create  192.168.0.87:6380 192.168.0.87:6381 192.168.0.87:6382 --cluster-replicas 0  --cluster-yes
    depends_on:
      - redis-6380
      - redis-6381
      - redis-6382
  redis-6380: # 服务名称
    image: redis:6.0.8 # 创建容器时所需的镜像
    container_name: redis-6380 # 容器名称
    restart: always # 容器总是重新启动
    ports:
      - 6380:6380
      - 16380:16380
    volumes: # 数据卷，目录挂载
      - ./etc_rc.local:/etc/rc.local
      - ./6380/conf/redis.conf:/etc/redis/redis.conf
      - ./6380/data:/data
    command: redis-server /etc/redis/redis.conf # 覆盖容器启动后默认执行的命令

  redis-6381:
    image: redis:6.0.8
    container_name: redis-6381
    restart: always
    ports:
      - 6381:6381
      - 16381:16381
    volumes:
      - ./etc_rc.local:/etc/rc.local
      - ./6381/conf/redis.conf:/etc/redis/redis.conf
      - ./6381/data:/data
    command: redis-server /etc/redis/redis.conf

  redis-6382:
    image: redis:6.0.8
    container_name: redis-6382
    restart: always
    ports:
      - 6382:6382
      - 16382:16382
    volumes:
      - ./etc_rc.local:/etc/rc.local
      - ./6382/conf/redis.conf:/etc/redis/redis.conf
      - ./6382/data:/data
    command: redis-server /etc/redis/redis.conf
```

## 7. 分布式锁

```python
import redis
import time

# 创建连接
r = redis.Redis(host='localhost', port=6379, db=0)

# 加锁
def acquire_lock(lock_name, acquire_timeout=10, lock_timeout=10):
    identifier = str(time.time())
    lock_key = 'lock:' + lock_name
    lock_timeout = int(lock_timeout)
    end = time.time() + acquire_timeout
    while time.time() < end:
        if r.set(lock_key, identifier, nx=True, ex=lock_timeout):
            return identifier
        time.sleep(0.001)
    return False

# 释放锁
def release_lock(lock_name, identifier):
    lock_key = 'lock:' + lock_name
    pipe = r.pipeline(True)
    while True:
        try:
            pipe.watch(lock_key)
            if pipe.get(lock_key) == identifier:
                pipe.multi()
                pipe.delete(lock_key)
                pipe.execute()
                return True
            pipe.unwatch()
            break
        except redis.exceptions.WatchError:
            pass
    return False

# 使用锁
lock_name = 'my_lock'
identifier = acquire_lock(lock_name, acquire_timeout=10, lock_timeout=10)
if identifier:
    print('Acquired lock:', identifier)
    # 执行需要加锁的操作
    # ...
    # 释放锁
    release_lock(lock_name, identifier)
            
```

## 8. 面试题

1. 为什么要用缓存 （内存缓存）
    1. 缓解关系型数据库并发访问压力：热点数据
    2. 减少响应时间：内存IO速度比磁盘快
    3. 提升吞吐量：Redis等内存数据库单机就可以支持很大并发
2. redis和memcached主要区别
   1. 整体类型
      1. r 支持内存 非关系型数据库
      2. m 支持内存  key-value
   2. 数据类型
      1. r  string list set zset hash
      2. m  文本型 二进制类型
   3. 操作类型
      1. r  单个操作、批量操作、事务支持（弱事务、结合lua)、每个类型不同的curd
      2. m  curd 少量其它命令
   4. 附加功能
      1. r 发布\订阅、主从高可用（哨兵、故障转移）、序列化支持、支持lua脚本
      2. m 多线程服务支持
   5. 网络IO模型
      1. r 执行命令-单线程、网络操作-多线程
      2. m 多线程、非阻塞的IO模式
   6. 持久化
      1. r RDB、AOF
      2. m 不支持
3. redis常用数据类型与使用场景
   1. string: 用来实现简单的kv键值对存储，比如计数器  单个最大容量512M
   2. list：实现双向链表，比如用户的关注，粉丝列表
   3. hash：用来存储彼此相关信息的键值对
   4. set：存储不重复元素，比如用户的关注者
   5. sorted set: 实时信息排行榜
4. redis各种内置类型的实现方式
   1. string: 整数或者sds (simple dynamic string)
   2. list: ziplist或者double linked list
   3. hash: ziplist或者hashtable
   4. set：intset或者hashtable
   5. sortedset：skiplist跳跃表
5. redis持久化
    1. 快照方式：把数据快照放在磁盘二进制文件中，dump.rdb
    2. AOF(Append Only File): 每一个写命令追加到appendonly.aof中
    3. 可以通过修改redis配置实现
6. redis"事务"
   1. 将多个请求打包，一次性、按顺序执行多个命令的机制
   2. 通过multi,exec,watch等命令实现事务功能
      1. multi 命令开始
      2. 要执行的一组命令
      3. exec 命令结束
   3. redis-py pipeline=conn.pipeline(transaction=True)
   4. redis的事务功能很弱，在事务回滚机制上，只能进行基本的语法错误判断。事务不支持回滚
   5. 原理：服务端的行为，用户执行multi命令时，服务器会将命令缓存起来，直到用户执行exec,才按顺序执行命令
7. redis如何实现分布式锁？
   1. 使用setnx实现加锁，可以同时通过expire添加超时时间
   2. 锁的value值可以使用一个随机的uuid或者特定的命名
   3. 释放锁的时候，通过uuid判断是否是该锁，是则执行delete释放锁
8. 使用缓存的模式？
   1. Cache Aside: 同时更新缓存和数据库
   2. Read/Write Through: 先更新缓存，缓存负责同步更新数据库
   3. Write Behind Caching: 先更新缓存，缓存定期异步更新数据库
9. 如何解决缓存穿透问题？
    1. 原因：
       1. 大量查询不到的数据请求落到后端数据库，数据库压力增大
       2. 由于大量缓存查不到就去数据库取，数据库也没有要查的数据
    2. 解决：
       1. 对于没有查询到返回为None的数据也缓存
       2. 插入数据的时候删除相应缓存，或者设置较短的超时时间
       3. 布隆过滤器与Bitmaps
           1. 用来判断一个元素是否在一个集合中
           2. 由一个二进制数组和一个hash算法组成
           3. 误判问题
               1. 本质hash冲突
               2. 通过hash计算在数组上不一定在集合
               3. **通过hash计算不在数组的一定不在集合**
                   1. 优化方案
                      1. 增大数组
                      2. 增加hash函数
10. 如何解决缓存击穿问题？
    1. 原因
       1. 某些非常热点的数据key过期，大量请求打到后端数据库
       2. 热点数据key失效导致大量请求打到数据库增加数据库压力
    2. 解决
       1. 直接设置热点数据永不过期
       2. 分布式锁：获取锁的线程从数据库拉数据更新缓存，其他线程等待
       3. 异步后台更新：后台任务针对过期的key自动刷新
11. 如何解决缓存雪崩问题？
    1. 缓存不可用 redis挂了 -> 解决：集群
    2. 大量缓存key同时失效，大量请求直接打到数据库
        1. 多级缓存：不同级别的key设置不同的超时时间
        2. 随机超时：key的超时时间随机设置，防止同时超时
        3. 架构层：提升系统可用性。监控、报警完善
12. redis6.0前为什么单线程
    1. cpu不是瓶颈，主要受限内存、网络
    2. pipeline （命令批量）每秒100w个请求
    3. 单线程的内部开发维护成本低
    4. 如果是多线程，会涉及到线程切换、加锁\解锁、导致死锁问题
    5. 惰性Rehash(渐进性式的Rehash)
    6. 一般的情况，单线程redis就够用了
13. redis为什么快
    1. 纯内存操作
    2. 单线程避免上下文切换
    3. 渐进式rehash、缓存时间戳
14. redis6.0为什么引入多线程
    1. 单线程就够了。数据->内存 响应时间 100ns
        1. 比较小的数据包，8w~10w qsp（极限值）
    2. 大的公司，需要更大的QPS，IO的多线程（内部执行命令还是单线程）
    3. 为什么不采用分布式架构----很大的缺点
        1. 服务数量多，维护成本很高
        2. redis命令，不适用数据分区
        3. 数据倾斜，重新分配、扩容、缩容，更加复杂
    4. 多线程任务 分摊到Redis同步IO中读写 负载
15. Redis有哪些高级功能
    1. Redis的慢查询
        1. 快速定位系统存在的慢操作
    2. pipeline
        1. 管道 批量操作
    3. 事务
    4. Lua
    5. 持久化
        1. rdb
        2. aof
    6. 缓存策略
16. 主重复制
17. 高可用集群搭建
18. 为什么要用redis
    1. 高性能
    2. 高并发
19. reids的过期策略和淘汰策略
    1. 定期删除
        1. 从库是从主库同步的
    2. 惰性删除
        1. 客户端访问这个key的时候，检查过期时间，过期了就立即删除，不返回任何东西
    3. 缓存淘汰算法
       1. maxmemory
       2. volatile-lru
       3. volatile-ttl
       4. volatile-random
       5. allkeys-lru
       6. allkeys-random
20. LRU算法
    1. 维护一个链表，元素按照一定顺序进行排列，满了就会删除尾部的元素，当元素被访问时，元素在链表的位置就会被移动到表头，元素排列的顺序就元素最近被访问的时间顺序
    2. redis的近似lru算法
       1. 不使用lru算法是因为需要消耗大量的额外内存，需要对现有的数据结构进行较大的改造
       2. 在现有数据结构的基础上使用随机采样法来淘汰元素，给每个key添加一个额外字段24bit，记录最后一次被访问的时间戳，redis执行写操作时，发现内存超过maxmemory，就会执行lru淘汰算法，随机采用出5个（maxmemory-sample)key，然后淘汰到最旧的key。
21. redis中消息队列实现方式
    1. 基于List的LPUSH+BRPOP的实现
       1. 足够简单，消息延迟几乎为零，但是需要处理空闲连接的问题
       2. 如果线程一直阻塞，redis客户端的连接就成了闲置连接，长时间闲置，服务器一般会主动断开连接，减少闲置资源占用， blpop/brpop会抛出异常
       3. 消费者做ack麻烦，不能保证消费者消费消息后是否处理成功的问题，通常需要维护一个pending列表，保证消息处理确认
       4. 不能做广播模式，如pub/sub,消息发布/订阅模型;不能重复消费，一旦消费就会被删除;不支持分组消费
    2. 基于Sorted-Set的实现
       1. 多用来实现延迟队列，（当然也可以实现有序的普通的消息队列），消费者无法阻塞的获取消息，只能轮询，不允许重复消息
    3. PUB/SUB，发布/订阅模式
       1. 典型的广播模式，一个消息可以发布到多个消费者;
       2. 多信道订阅，消费者可以同时订阅多个信道消息
       3. 消息即时发送，消息不用等待消费者读取，消费者会自动接收到信道发布的消息
       4. 缺点：
          1. 消息一旦发布，不能接收，发布时若客户端不在线，则消息丢失
          2. 不保证每个消费者接收的时间是一致的；若消费者客户端出现消息积压，到一定程度，会被强制断开，导致消息意外丢失。通常发生在消息的生产远大于消费速度时。
       5. Pub/Sub模式不适合做消息存储，消息挤压类的业务，而是擅长处理广播，即时通讯，即时反馈的业务。
    4. 基于stream类型的实现
       1. redis5.0新增的支持多播的可持久化的消息队列
          1. 生产者API、消费者API、消息Broker,消息的确认机制等等
       2. 消息太多怎么办
          1. 定长Stream功能。xadd指令提供一个定长长度maxlen，就可以将老的消息干掉，确保最多不超过指定长度
       3. 消息如果忘记ACK
          1. 在每个消费者结构中保存了正在处理中的消息ID列表PEL，如果消费者收了消息但是没有回复ack,就会导致PEL列表不断增长。
       4. PEL如何避免消息丢失
          1. 断开重连后，xreadgroup的起始消息ID 0-0,表示读取所有的PEL消息以及自last_delivered_id之后的新消息
       5. 死信问题
          1. 消息老是消费不掉 XPENDING可以查询到
          2. XDEL删除掉一个消息，XACK将这个消息标记为处理完毕
       6. stream高可用
          1. 建立在主从复制的基础上，跟其它结构没区别
          2. failover发生时，可能会丢极小部分数据
       7. 分区partiotion
          1. 没有原生支持分区能力
          2. 可以分配多个stream,然后在客户端生成消息时用不同的策略发送到不同stream
22. 什么是bigkey？会有什么影响？
    1. key对应的value所在的内存空间比较大
        1. 字符串 最大512m
        2. 列表 value最多存储2^32-1个元素
    2. 危害
       1. 内存空间不平衡
       2. 超时阻塞
       3. 网络拥塞
       4. bigkey的存在并不是完全致命的，主要还是看是否会被频繁访问
23. redis如何解决key冲突
    1. 业务隔离
    2. key的设计
        1. 业务模块+系统名称+关键 biz-pay-orderid-1, userid
    3. 分布式锁
       1. 多个客户端，并发写key
24. 如何提高缓存命中率？
    1. 提前加载
    2. 增加缓存的存储空间，提高缓存的数据量、提高命中率
    3. 调整缓存的存储类型？
    4. 提升缓存的更新频次
25. 持久化
    1. RDB  Redis DataBase
        1. 生成快照保存到硬盘
        2. save
        3. bgsave
        4. `dbfilename dump-${port}.rdb`
        5. `dir ./`
    2. AOF append only file
        1. 以独立日志的方式记录每次写命令，重启时再重新执行AOF文件中的命令达到恢复数据的目的，主要是解决实时性的问题，性能没有rdb高
        2. `appendonly yes` 默认开启
        3. `appendfilename "appendonly.aof`
        4. `appendfsync: no/always/everysec` 不执行/每次写入都执行/每秒执行一次
        5. `redis-check-aof --fix`命令来修复破损的AOF文件
    3. RDB-AOF混合持久化
        1. 同时启用AOF和RDB
26. 为什么redis需要把所有的数据放到内存中？
    1. 内存读写速度快
27. 如何保证缓存与数据库双写时的数据一致性?
28. redis集群方案应该怎么做?
29. redis集群方案什么情况下会导致集群不可用
30. redis哈希槽的概念
    1. edis-cluster中有16384(即2的14次方）个哈希槽，每个key通过CRC16校验后对16384取模来决定放置哪个槽。
31. redis集群写操作会有丢失吗？为什么
32. redis常见性能问题和解决方案有哪些?
33. 热点数据和冷数据是什么?
34. 什么情况下可能会导致redis阻塞
    1. 客户端阻塞命令   keys* Hgetall smembers 时间复杂度 O(N)
    2. BIGkey删除    zset (100万的元素 删除2s)
    3. 清空库 flushdb flushall
    4. SAVE创建RDB文件
    5. AOF日志同步写， 记录AOF日志 大量的写操作  1个同步写磁盘耗时1-2ms
    6. AOF重写阻塞,执行BGREWRITEAOF命令时，会将缓存中的数据写入到一个临时文件中，然后替换旧的AOF文件，如果AOF文件很大，那么重写的过程可能会阻塞主线程。
    7. 从库 加载RDB文件
    8. 发生了Swap(内存交换)
    9. CPU竞争
35. 什么时候选择redis，什么时候选择memcached
    1. redis功能更加强大 kv模式 string/list/hash/set/zset  memcache kv简单存储
    2. redis有持久化 memcache 不支持持久化
    3. 内存管理：
        1. r 过期、内存淘汰策略
        2. m 预分配池的管理，内存slab块 增长因子
        3. redis适合做数据存储，memcache缓存
    4. io角度
       1. 多路复用io   命令 单线程， 子命令 锁冲突
       2. 非阻塞的IO多路复用
36. redis过期策略都有哪些？LRU算法

37. redis常见性能问题和解决方案
    1.  Master最好不要写内存快照
    2.  如果数据比较重要，某个slave开启AOF备份数据，策略设置为每秒同步一次
    3.  为了主从复制的速度和连接的稳定性，slave和master最好在同一个局域网内
    4.  尽量避免在压力很大的主库上增加从库
    5.  主从复制不要用图状结构，用单向链表结构更为稳定，Master <- Slave1 < - Slave2 < - Slave3...
