# etcd

## 简介

etcd 是一个分布式键值存储系统，主要用于配置共享和服务发现。它由 CoreOS 开发，并作为 Kubernetes 的默认配置存储。

## 安装

在 Linux 上，可以使用以下命令安装 etcd：

```bash
sudo apt-get update
sudo apt-get install etcd
```

`docker run -d --name etcd -p 2379:2379 -p 2380:2380 --env ETCD_ADVERTISE_CLIENT_URLS=http://localhost:2379 --env ETCD_LISTEN_CLIENT_URLS=http://0.0.0.0:2379 quay.io/coreos/etcd:v3.5.9`

docker-compose.yml

```yaml
service:
  etcd:
    image: quay.io/coreos/etcd:v3.5.1
    container_name: etcd
    command: etcd -advertise-client-urls http://0.0.0.0:2379 -listen-client-urls http://0.0.0.0:2379
    ports:
      - 2379:2379
      - 2380:2380
    volumes:
      - ./data:/etcd-data
```

## 使用

```bash
# 查看Etcd版本
etcdctl version
# 写入一个键值对
etcdctl put /hello "world"
# 读取键值对
etcdctl get /hello
# 监听键的变化（另开一个终端执行put操作，这里会实时收到通知）
etcdctl watch /hello

# 写入键值
etcdctl put /config/app/name "my-service"
etcdctl put /config/app/port "8080"
# 读取键值（单个键）
etcdctl get /config/app/name
# 读取键值（前缀查询）
etcdctl get /config/app --prefix
# 删除键值
etcdctl del /config/app/port
# 批量删除（前缀删除）
etcdctl del /config/app --prefix

```

```go
package main
import (
	"context"
	"fmt"
	"go.etcd.io/etcd/client/v3"
)
func main() {
	// 创建Etcd客户端
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{"localhost:2379"},
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		panic(err)
	}
	defer cli.Close()
	// 写入键值
	_, err = cli.Put(context.TODO(), "/config/db/host", "127.0.0.1")
	if err != nil {
		panic(err)
	}
	// 读取键值
	resp, err := cli.Get(context.TODO(), "/config/db/host")
	if err != nil {
		panic(err)
	}
	for _, kv := range resp.Kvs {
		fmt.Printf("键：%s，值：%s\n", kv.Key, kv.Value)
	}
	// 监听键变化
	rch := cli.Watch(context.TODO(), "/config/db/host")
	for wresp := range rch {
		for _, ev := range wresp.Events {
			fmt.Printf("事件类型：%s，键：%s，值：%s\n", ev.Type, ev.Kv.Key, ev.Kv.Value)
		}
	}
}

```

```go
package main
import (
	"context"
	"flag"
	"go.etcd.io/etcd/client/v3"
	"go.etcd.io/etcd/client/v3/concurrency"
	"log"
	"time"
)
var (
	etcdEndpoints = flag.String("etcd-endpoints", "localhost:2379", "Etcd endpoints")
	svcName       = flag.String("service-name", "user-service", "服务名称")
	svcAddr       = flag.String("service-addr", "192.168.1.100:8080", "服务地址")
)
func main() {
	flag.Parse()
	// 创建Etcd客户端
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{*etcdEndpoints},
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer cli.Close()
	// 创建租约（TTL为10秒，客户端需每10秒内发心跳续约）
	lease, err := concurrency.NewLease(cli, 10)
	if err != nil {
		log.Fatal(err)
	}
	defer lease.Revoke(context.TODO())
	// 基于租约创建临时节点（服务注册）
	kv := clientv3.NewKV(cli)
	key := fmt.Sprintf("/services/%s/%s", *svcName, *svcAddr)
	_, err = kv.Put(context.TODO(), key, "online", clientv3.WithLease(lease.ID()))
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("服务 %s 注册成功，地址：%s\n", *svcName, *svcAddr)
	// 模拟服务运行，定期续约
	go func() {
		for {
			time.Sleep(5 * time.Second) // 每5秒续约一次
			if _, err := lease.KeepAliveOnce(context.TODO()); err != nil {
				log.Printf("续约失败：%v\n", err)
			}
		}
	}()
	// 另一个goroutine：监听服务列表变化（服务发现）
	go func() {
		rch := cli.Watch(context.TODO(), fmt.Sprintf("/services/%s", *svcName), clientv3.WithPrefix())
		for wresp := range rch {
			for _, ev := range wresp.Events {
				svcAddr := string(ev.Kv.Key[len(fmt.Sprintf("/services/%s/", *svcName)):])
				if ev.Type == clientv3.EventTypePut {
					log.Printf("服务上线：%s\n", svcAddr)
				} else {
					log.Printf("服务下线：%s\n", svcAddr)
				}
			}
		}
	}()
	// 保持程序运行
	select {}
}
```

### 分布式锁

```go
package main
import (
	"context"
	"log"
	"time"
	"go.etcd.io/etcd/client/v3"
	"go.etcd.io/etcd/client/v3/concurrency"
)
func main() {
	cli, err := clientv3.New(clientv3.Config{
		Endpoints:   []string{"localhost:2379"},
		DialTimeout: 5 * time.Second,
	})
	if err != nil {
		log.Fatal(err)
	}
	defer cli.Close()
	// 创建分布式锁
	s, err := concurrency.NewSession(cli)
	if err != nil {
		log.Fatal(err)
	}
	defer s.Close()
	mu := concurrency.NewMutex(s, "/locks/task-distribute")
	// 加锁
	if err := mu.Lock(context.TODO()); err != nil {
		log.Fatal(err)
	}
	log.Println("获取到分布式锁，开始执行临界区逻辑...")
	// 模拟临界区操作
	time.Sleep(10 * time.Second)
	// 解锁
	if err := mu.Unlock(context.TODO()); err != nil {
		log.Fatal(err)
	}
	log.Println("释放分布式锁，临界区逻辑执行完毕")
}
```
## 高可用集群

```bash
# 节点1
./etcd --name node1 --data-dir node1 --listen-client-urls http://192.168.1.101:2379 --advertise-client-urls http://192.168.1.101:2379 --listen-peer-urls http://192.168.1.101:2380 --initial-advertise-peer-urls http://192.168.1.101:2380 --initial-cluster node1=http://192.168.1.101:2380,node2=http://192.168.1.102:2380,node3=http://192.168.1.103:2380 --initial-cluster-token etcd-cluster-1 --initial-cluster-state new
# 节点2（类似节点1，修改name、data-dir、IP）
./etcd --name node2 --data-dir node2 --listen-client-urls http://192.168.1.102:2379 --advertise-client-urls http://192.168.1.102:2379 --listen-peer-urls http://192.168.1.102:2380 --initial-advertise-peer-urls http://192.168.1.102:2380 --initial-cluster node1=http://192.168.1.101:2380,node2=http://192.168.1.102:2380,node3=http://192.168.1.103:2380 --initial-cluster-token etcd-cluster-1 --initial-cluster-state new
# 节点3（类似节点1，修改name、data-dir、IP）
./etcd --name node3 --data-dir node3 --listen-client-urls http://192.168.1.103:2379 --advertise-client-urls http://192.168.1.103:2379 --listen-peer-urls http://192.168.1.103:2380 --initial-advertise-peer-urls http://192.168.1.103:2380 --initial-cluster node1=http://192.168.1.101:2380,node2=http://192.168.1.102:2380,node3=http://192.168.1.103:2380 --initial-cluster-token etcd-cluster-1 --initial-cluster-state new
```

## 性能调优

- `--quota-backend-bytes`：限制后端存储的大小，默认为2GB
- `--max-request-bytes`：限制单个请求的大小，默认为1.5MB
- `--max-concurrent-requests`：限制同时处理的请求数量，默认为500
- `--max-wait-time`：限制客户端等待响应的最长时间，默认为5s
- `--heartbeat-interval`：设置节点间的心跳间隔，默认为100ms
- `--election-timeout`：设置节点选举的超时时间，默认为1s
- `--snapshot-count`：设置WAL日志文件在多少次事务后进行快照，默认为100000
- `--auto-compaction-retention`：设置自动压缩的保留时间，默认为0，表示不进行自动压缩
- `--auto-compaction-mode`：设置自动压缩的模式，默认为periodic，表示按时间间隔进行压缩
- `--auto-compaction-interval`：设置自动压缩的时间间隔，默认为0，表示不进行自动压缩

## 监控集成

--`--enable-metrics`：启用内置的Prometheus指标，默认为false
--`--metrics-addr`：设置Prometheus指标的监听地址，默认为0.0.0.0:2381
--`--metrics-basic-auth`：设置Prometheus指标的认证信息，默认为空

## WAL

## BoltDB
