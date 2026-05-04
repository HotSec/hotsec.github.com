# ZeroMQ

ZeroMQ（ØMQ）是一个高性能异步消息库，提供多种消息模式。

## 安装

```bash
# macOS
brew install zeromq

# Ubuntu
sudo apt install libzmq3-dev

# vcpkg
vcpkg install zeromq
```

## 核心模式

| 模式 | 说明 | 类比 |
|------|------|------|
| REQ-REP | 请求-回复 | RPC |
| PUB-SUB | 发布-订阅 | 消息广播 |
| PUSH-PULL | 推-拉（管道） | 任务分发 |
| DEALER-ROUTER | 异步路由 | 高级 REQ-REP |
| PAIR | 点对点 | 线程通信 |

## REQ-REP 示例

```cpp
#include <zmq.hpp>
#include <string>
#include <iostream>

// Server
int main() {
    zmq::context_t ctx(1);
    zmq::socket_t socket(ctx, zmq::socket_type::rep);
    socket.bind("tcp://*:5555");

    while (true) {
        zmq::message_t request;
        socket.recv(request, zmq::recv_flags::none);
        std::string msg(static_cast<char*>(request.data()), request.size());

        zmq::message_t reply(msg.size());
        memcpy(reply.data(), msg.c_str(), msg.size());
        socket.send(reply, zmq::send_flags::none);
    }
}

// Client
int main() {
    zmq::context_t ctx(1);
    zmq::socket_t socket(ctx, zmq::socket_type::req);
    socket.connect("tcp://localhost:5555");

    std::string msg = "Hello";
    zmq::message_t request(msg.size());
    memcpy(request.data(), msg.c_str(), msg.size());
    socket.send(request, zmq::send_flags::none);

    zmq::message_t reply;
    socket.recv(reply, zmq::recv_flags::none);
}
```

## PUB-SUB 示例

```cpp
// Publisher
zmq::socket_t pub(ctx, zmq::socket_type::pub);
pub.bind("tcp://*:5556");
pub.send(zmq::buffer("topic1 data"), zmq::send_flags::none);

// Subscriber
zmq::socket_t sub(ctx, zmq::socket_type::sub);
sub.connect("tcp://localhost:5556");
sub.set(zmq::sockopt::subscribe, "topic1");
```

## 特点

- 无中心 Broker，可直接连接
- 支持 inproc / ipc / tcp / pgm 多种传输
- 消息帧（multipart message）支持
- 自动重连和缓冲
- 非线程安全，socket 不能跨线程共享
