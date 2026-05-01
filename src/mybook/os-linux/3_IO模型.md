# IO 模型

## IO 操作流程

```
用户进程              内核                    设备
   │                  │                       │
   │── read() ───────>│                       │
   │                  │── DMA 读取请求 ───────>│
   │   (阻塞等待)      │                       │
   │                  │<── 数据就绪中断 ───────│
   │<── 数据拷贝 ──────│                       │
   │                  │                       │
```

1. **等待数据就绪**：数据从设备到内核缓冲区
2. **数据拷贝**：数据从内核缓冲区到用户空间

***

## 五种 IO 模型

### 1. 阻塞 IO (Blocking IO)

```python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('example.com', 80))
sock.send(b'GET / HTTP/1.1\r\nHost: example.com\r\n\r\n')
data = sock.recv(4096)
```

- 调用后线程阻塞直到数据就绪并拷贝完成
- 最简单的模型
- 一个连接需要一个线程

### 2. 非阻塞 IO (Non-blocking IO)

```python
import socket

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setblocking(False)

try:
    sock.connect(('example.com', 80))
except BlockingIOError:
    pass

while True:
    try:
        data = sock.recv(4096)
        break
    except BlockingIOError:
        do_other_work()
```

- 调用立即返回，未就绪返回 EAGAIN/EWOULDBLOCK
- 需要轮询（polling）
- CPU 利用率低

### 3. IO 多路复用 (IO Multiplexing)

```python
import selectors

sel = selectors.DefaultSelector()

def accept(sock, mask):
    conn, addr = sock.accept()
    conn.setblocking(False)
    sel.register(conn, selectors.EVENT_READ, read)

def read(conn, mask):
    data = conn.recv(4096)
    if data:
        process(data)
    else:
        sel.unregister(conn)
        conn.close()

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setblocking(False)
sock.bind(('0.0.0.0', 8080))
sock.listen(100)
sel.register(sock, selectors.EVENT_READ, accept)

while True:
    events = sel.select()
    for key, mask in events:
        callback = key.data
        callback(key.fileobj, mask)
```

- 一个线程监听多个文件描述符
- 数据就绪后仍需阻塞拷贝
- 适用于高并发连接

### 4. 信号驱动 IO (Signal-driven IO)

```python
import signal
import socket

def handler(signum, frame):
    data = sock.recv(4096)
    process(data)

signal.signal(signal.SIGIO, handler)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setblocking(False)
sock.connect(('example.com', 80))
```

- 内核数据就绪时发送 SIGIO 信号
- 信号处理函数中执行 recv
- 适用于 UDP，TCP 较少使用

### 5. 异步 IO (Async IO)

```python
import asyncio

async def fetch(host, port):
    reader, writer = await asyncio.open_connection(host, port)
    writer.write(b'GET / HTTP/1.1\r\nHost: example.com\r\n\r\n')
    await writer.drain()
    data = await reader.read(4096)
    writer.close()
    return data

async def main():
    results = await asyncio.gather(
        fetch('example.com', 80),
        fetch('example.org', 80),
    )

asyncio.run(main())
```

- 发起 IO 后立即返回，内核完成所有操作后通知
- 无阻塞，无拷贝开销（内核直接写入用户空间）
- 真正的异步

### 对比

| 模型 | 等待数据 | 拷贝数据 | 阻塞 |
|------|----------|----------|------|
| 阻塞 IO | 阻塞 | 阻塞 | 是 |
| 非阻塞 IO | 轮询 | 阻塞 | 部分 |
| IO 多路复用 | 阻塞(select) | 阻塞 | 部分 |
| 信号驱动 IO | 信号通知 | 阻塞 | 部分 |
| 异步 IO | 不阻塞 | 不阻塞 | 否 |

***

## IO 多路复用详解

### select

```c
int select(int nfds, fd_set *readfds, fd_set *writefds,
           fd_set *exceptfds, struct timeval *timeout);
```

| 限制 | 值 |
|------|-----|
| 最大 FD 数 | 1024 (FD_SETSIZE) |
| 时间复杂度 | O(n) |
| 每次调用 | 需要拷贝 fd_set |

### poll

```c
int poll(struct pollfd *fds, nfds_t nfds, int timeout);
```

- 无 FD 数量限制
- 仍为 O(n)
- 使用 pollfd 数组替代 fd_set

### epoll

```c
int epoll_create(int size);
int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
```

| 特性 | 描述 |
|------|------|
| 触发模式 | LT (水平触发) / ET (边缘触发) |
| 时间复杂度 | O(1) 就绪事件 |
| FD 数量 | 无限制 |
| 内存 | 只拷贝就绪的 FD |

### LT vs ET

| 模式 | 描述 | 注意 |
|------|------|------|
| LT | 缓冲区有数据就触发 | 安全，不会丢失事件 |
| ET | 缓冲区从空到非空触发一次 | 必须一次读完所有数据 |

```c
// ET 模式必须循环读取
while (1) {
    n = recv(fd, buf, sizeof(buf), 0);
    if (n == -1) {
        if (errno == EAGAIN || errno == EWOULDBLOCK) {
            break;
        }
        perror("recv");
        break;
    }
    if (n == 0) break;
    process(buf, n);
}
```

### 对比

| 特性 | select | poll | epoll |
|------|--------|------|-------|
| FD 上限 | 1024 | 无限制 | 无限制 |
| 时间复杂度 | O(n) | O(n) | O(1) |
| 内存拷贝 | 每次全量 | 每次全量 | 只拷贝就绪 |
| 触发模式 | LT | LT | LT + ET |
| 适用场景 | 少量连接 | 中等连接 | 大量连接 |

***

## 零拷贝技术

### 传统拷贝

```
磁盘 → 内核缓冲区 → 用户缓冲区 → Socket缓冲区 → 网卡
       (DMA拷贝)    (CPU拷贝)     (CPU拷贝)      (DMA拷贝)
```

4 次拷贝，4 次上下文切换。

### sendfile

```c
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
```

```
磁盘 → 内核缓冲区 → Socket缓冲区 → 网卡
       (DMA拷贝)    (CPU拷贝)      (DMA拷贝)
```

3 次拷贝，2 次上下文切换。

### mmap

```c
void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
```

文件映射到用户空间，避免内核→用户拷贝。

### splice

```c
long splice(int fd_in, loff_t *off_in, int fd_out, loff_t *off_out,
            size_t len, unsigned int flags);
```

两个文件描述符之间零拷贝传输。

***

## Reactor 模式

```
         ┌─────────────────┐
         │   Reactor       │
         │  (epoll_wait)   │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───┴───┐   ┌───┴───┐   ┌───┴───┐
│Acceptor│   │Handler│   │Handler│
│(连接)  │   │(读写) │   │(读写) │
└───────┘   └───────┘   └───────┘
```

### 单 Reactor 单线程

- Redis 使用此模型
- 适合快速操作

### 单 Reactor 多线程

- Acceptor 单线程
- Handler 线程池处理业务

### 主从 Reactor 多线程

- Main Reactor 处理连接
- Sub Reactor 处理 IO
- Netty 使用此模型

```go
// Go net 标准库的 Reactor 模式
ln, _ := net.Listen("tcp", ":8080")
for {
    conn, _ := ln.Accept()
    go handleConn(conn)
}
```
