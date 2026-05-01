# Consul 服务注册与发现

## 一、安装

```bash
go get github.com/hashicorp/consul/api
```

## 二、服务注册

```go
config := api.DefaultConfig()
config.Address = "127.0.0.1:8500"
client, _ := api.NewClient(config)

registration := &api.AgentServiceRegistration{
    ID:      "myapp-1",
    Name:    "myapp",
    Port:    8080,
    Address: "192.168.1.100",
    Check: &api.AgentServiceCheck{
        HTTP:                           "http://192.168.1.100:8080/health",
        Interval:                       "10s",
        Timeout:                        "5s",
        DeregisterCriticalServiceAfter: "30s",
    },
}

err := client.Agent().ServiceRegister(registration)
```

## 三、服务发现

```go
services, _, err := client.Health().Service("myapp", "", true, nil)
for _, service := range services {
    fmt.Printf("ID: %s, Address: %s, Port: %d\n",
        service.Service.ID,
        service.Service.Address,
        service.Service.Port,
    )
}
```

## 四、KV 存储

```go
kv := client.KV()

pair := &api.KVPair{Key: "config/myapp/db", Value: []byte("mysql://localhost:3306")}
kv.Put(pair, nil)

result, _, _ := kv.Get("config/myapp/db", nil)
fmt.Println(string(result.Value))
```

## 五、健康检查

```go
checks, _, _ := client.Health().Checks("myapp", nil)
for _, check := range checks {
    fmt.Printf("CheckID: %s, Status: %s\n", check.CheckID, check.Status)
}
```

## 六、注销服务

```go
client.Agent().ServiceDeregister("myapp-1")
```
