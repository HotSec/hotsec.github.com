# ES 集群与 ELK Stack

## 1. Elasticsearch 安装

```bash
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.1.1-linux-x86_64.tar.gz
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-9.1.1-linux-x86_64.tar.gz.sha512
shasum -a 512 -c elasticsearch-9.1.1-linux-x86_64.tar.gz.sha512
tar -xzf elasticsearch-9.1.1-linux-x86_64.tar.gz
cd elasticsearch-9.1.1/
```

### 1.1 集群配置

```yaml
# config/elasticsearch.yml - 节点1
cluster.name: my-es-cluster
node.name: node-1
path.data: /data/elasticsearch
path.logs: /var/log/elasticsearch
network.host: 0.0.0.0
http.port: 9200
transport.port: 9300
discovery.seed_hosts: ["node-1", "node-2", "node-3"]
cluster.initial_master_nodes: ["node-1", "node-2", "node-3"]
xpack.security.enabled: true
xpack.security.transport.ssl.enabled: true
```

### 1.2 JVM 配置

```bash
# config/jvm.options
-Xms4g
-Xmx4g
-XX:+UseG1GC
-XX:G1ReservePercent=25
-XX:InitiatingHeapOccupancyPercent=30
```

## 2. Logstash

### 2.1 安装

```bash
wget https://artifacts.elastic.co/downloads/logstash/logstash-9.1.1-linux-x86_64.tar.gz
tar -xzf logstash-9.1.1-linux-x86_64.tar.gz
```

### 2.2 管道配置

```ruby
# config/pipelines.yml
- pipeline.id: app-logs
  path.config: "/etc/logstash/conf.d/app.conf"
  pipeline.workers: 4
  pipeline.batch.size: 125
  pipeline.batch.delay: 50
```

### 2.3 输入-过滤-输出

```ruby
# /etc/logstash/conf.d/app.conf
input {
  beats {
    port => 5044
  }

  file {
    path => "/var/log/app/*.log"
    start_position => "beginning"
    tags => ["app"]
  }

  tcp {
    port => 5140
    codec => json_lines
  }
}

filter {
  if "app" in [tags] {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:msg}"
      }
      overwrite => ["message"]
    }

    date {
      match => ["timestamp", "ISO8601"]
      target => "@timestamp"
    }

    mutate {
      remove_field => ["timestamp"]
      lowercase => ["level"]
    }
  }

  if [level] == "error" {
    mutate {
      add_tag => ["error"]
    }
  }

  geoip {
    source => "client_ip"
    target => "geoip"
  }

  useragent {
    source => "user_agent"
    target => "ua"
  }
}

output {
  elasticsearch {
    hosts => ["https://es-node1:9200", "https://es-node2:9200"]
    index => "app-logs-%{+YYYY.MM.dd}"
    user => "elastic"
    password => "${ES_PASSWORD}"
    ssl_certificate_verification => false
  }

  if "error" in [tags] {
    file {
      path => "/var/log/logstash/errors-%{+YYYY-MM-dd}.log"
    }
  }

  stdout {
    codec => rubydebug
  }
}
```

### 2.4 Grok 常用模式

| 模式 | 匹配内容 |
|------|----------|
| `%{IP:client_ip}` | IP 地址 |
| `%{TIMESTAMP_ISO8601:ts}` | ISO 时间戳 |
| `%{LOGLEVEL:level}` | 日志级别 |
| `%{URIPATH:url}` | URI 路径 |
| `%{INT:status}` | 整数 |
| `%{NUMBER:duration}` | 数字 |
| `%{QUOTEDSTRING:msg}` | 引号字符串 |
| `%{GREEDYDATA:rest}` | 剩余内容 |

### 2.5 性能优化

```ruby
input {
  beats {
    port => 5044
    codec => plain {
      charset => "UTF-8"
    }
  }
}

filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
    patterns_dir => ["/etc/logstash/patterns"]
    timeout_millis => 500
  }
}

output {
  elasticsearch {
    hosts => ["https://es:9200"]
    flush_size => 500
    idle_flush_time => 5
  }
}
```

## 3. Kibana

### 3.1 安装与配置

```bash
wget https://artifacts.elastic.co/downloads/kibana/kibana-9.1.1-linux-x86_64.tar.gz
tar -xzf kibana-9.1.1-linux-x86_64.tar.gz
```

```yaml
# config/kibana.yml
server.port: 5601
server.host: "0.0.0.0"
elasticsearch.hosts: ["https://es-node1:9200", "https://es-node2:9200"]
elasticsearch.username: "kibana_system"
elasticsearch.password: "${KIBANA_PASSWORD}"
xpack.security.enabled: true
xpack.encryptedSavedObjects.encryptionKey: "xxx"
```

### 3.2 核心功能

| 功能 | 说明 |
|------|------|
| Discover | 日志搜索与过滤 |
| Dashboard | 可视化仪表盘 |
| Visualize | 图表创建 |
| Dev Tools | ES 查询调试 |
| Stack Management | 索引/角色/用户管理 |
| APM | 应用性能监控 |
| SIEM | 安全事件管理 |

### 3.3 常用 KQL 查询

```
level: "error"
level: "error" AND service: "api-gateway"
@timestamp >= "2025-01-01" AND @timestamp < "2025-01-02"
message: *timeout*
status: >= 500
```

## 4. Filebeat

### 4.1 安装

```bash
wget https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-9.1.1-linux-x86_64.tar.gz
tar -xzf filebeat-9.1.1-linux-x86_64.tar.gz
```

### 4.2 配置

```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
  - /var/log/nginx/access.log
  - /var/log/nginx/error.log
  fields:
    app: nginx
    env: production
  fields_under_root: true

- type: log
  paths:
  - /var/log/app/*.log
  multiline:
    pattern: '^\d{4}-\d{2}-\d{2}'
    negate: true
    match: after
  fields:
    app: myapp

filebeat.config.modules:
  path: ${path.config}/modules.d/*.yml

modules:
- module: nginx
  access:
    var.paths: ["/var/log/nginx/access.log"]
  error:
    var.paths: ["/var/log/nginx/error.log"]

- module: redis
  log:
    var.paths: ["/var/log/redis/redis-server.log"]

output.logstash:
  hosts: ["logstash:5044"]
  loadbalance: true
  worker: 2

# 或直连 ES
# output.elasticsearch:
#   hosts: ["https://es:9200"]
#   index: "filebeat-%{[agent.version]}-%{+yyyy.MM.dd}"

processors:
- add_host_metadata: ~
- add_cloud_metadata: ~
- add_docker_metadata: ~
- drop_fields:
    fields: ["agent", "ecs", "input", "log.offset"]
```

### 4.3 模块化配置

```bash
./filebeat modules list
./filebeat modules enable nginx redis mysql
./filebeat setup --index-management -E output.logstash.enabled=false -E output.elasticsearch.hosts=["https://es:9200"]
```

## 5. ELK 架构实践

### 5.1 日志采集方案

```
方案1（标准）: Filebeat → Logstash → Elasticsearch → Kibana
方案2（轻量）: Filebeat → Elasticsearch → Kibana
方案3（缓冲）: Filebeat → Kafka → Logstash → Elasticsearch → Kibana
```

### 5.2 索引生命周期管理（ILM）

```json
PUT _ilm/policy/logs-policy
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "1d",
            "max_primary_shard_size": "50gb"
          },
          "set_priority": { "priority": 100 }
        }
      },
      "warm": {
        "min_age": "7d",
        "actions": {
          "forcemerge": { "max_num_segments": 1 },
          "shrink": { "number_of_shards": 1 },
          "allocate": { "require": { "data": "warm" } },
          "set_priority": { "priority": 50 }
        }
      },
      "cold": {
        "min_age": "30d",
        "actions": {
          "allocate": { "require": { "data": "cold" } },
          "set_priority": { "priority": 0 }
        }
      },
      "delete": {
        "min_age": "90d",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
```

### 5.3 集群规划

| 节点角色 | 规格 | 数量 | 说明 |
|----------|------|------|------|
| Master | 4C8G | 3 | 专任 Master |
| Data Hot | 8C32G+SSD | 3+ | 热数据读写 |
| Data Warm | 8C16G+HDD | 2+ | 温数据查询 |
| Data Cold | 4C8G+HDD | 1+ | 冷数据归档 |
| Coordinating | 8C16G | 2+ | 协调节点/查询路由 |

## 6. 替代方案

### 6.1 EFK（Fluentd）

```
Fluentd → Elasticsearch → Kibana
```

Fluentd 优势：插件丰富/内存占用低/CRuby + C 扩展

### 6.2 Loki + Grafana

```
Promtail → Loki → Grafana
```

Loki 优势：仅索引标签/存储成本低/与 Prometheus 统一查询（LogQL）

## 7. 面试题

### 1. ELK 和 EFK 的区别？

- ELK：Elasticsearch + Logstash + Kibana，Logstash 功能强大但资源消耗高
- EFK：Elasticsearch + Fluentd + Kibana，Fluentd 更轻量，K8s 生态常用
- 选择：日志复杂需过滤用 Logstash，K8s 场景用 Fluentd/Fluent Bit

### 2. Filebeat 和 Logstash 的区别？

- Filebeat：轻量日志采集器，Go 编写，资源占用极低，适合部署在每个节点
- Logstash：重量级日志处理，JRuby 编写，支持复杂过滤/转换，资源消耗高
- 最佳实践：Filebeat 采集 + Logstash 过滤

### 3. 如何防止 ES 集群脑裂？

- 设置 `discovery.zen.minimum_master_nodes` = N/2 + 1（7.x 自动管理）
- 使用专任 Master 节点（不存数据）
- 部署奇数个 Master 节点（3 或 5）
