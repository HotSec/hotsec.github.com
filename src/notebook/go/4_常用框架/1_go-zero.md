# go-zero

## 安装

[go-zero.dev](https://go-zero.dev/cn/docs/quick-start/monolithic-service)

```bash
# 0. 安装golang dnf install golang
export PATH=$PATH:/usr/local/go/bin:/root/go/bin
go env -w GOPROXY=https://goproxy.cn,direct
# 1. 安装goctl
# goctl 是 go-zero 的内置脚手架，是提升开发效率的一大利器，可以一键生成代码、文档、部署 k8s yaml、dockerfile 等。
GOPROXY=https://goproxy.cn/,direct go install github.com/zeromicro/go-zero/tools/goctl@latest
# 2. goctl 可以一键安装 protoc，protoc-gen-go，protoc-gen-go-grpc 相关组件
goctl env check -i -f --verbose
```

## api demo

```bash
goctl api new one_demo
cd one_demo
go mod tidy
go run onedemo.go -f etc/onedemo-api.yaml

```

```bash
.
└── one_demo
    ├── etc
    │   └── onedemo-api.yaml
    ├── internal
    │   ├── config
    │   │   └── config.go
    │   ├── handler
    │   │   ├── onedemohandler.go
    │   │   └── routes.go
    │   ├── logic
    │   │   └── onedemologic.go
    │   ├── svc
    │   │   └── servicecontext.go
    │   └── types
    │       └── types.go
    ├── one_demo.api
    └── onedemo.go
```

## rpc demo

```bash
goctl rpc new two
cd two
go mod tidy
# 修改/etc/two.yaml
cat > etc/two.yaml<< EOF
Name: two.rpc
ListenOn: 0.0.0.0:8080
Mode: dev
EOF

go run two.go


grpcurl -plaintext 127.0.0.1:8080 two.Two/Ping
{
  "pong": "pong"
}

```

## mysql demo

```bash
mkdir -p model/mysql
cd model/mysql
cat > user.sql<< EOF
CREATE TABLE user (
    id bigint AUTO_INCREMENT,
    name varchar(255) NULL COMMENT 'The username',
    password varchar(255) NOT NULL DEFAULT '' COMMENT 'The user password',
    mobile varchar(255) NOT NULL DEFAULT '' COMMENT 'The mobile phone number',
    gender char(10) NOT NULL DEFAULT 'male' COMMENT 'gender,male|female|unknown',
    nickname varchar(255) NULL DEFAULT '' COMMENT 'The nickname',
    type tinyint(1) NULL DEFAULT 0 COMMENT 'The user type, 0:normal,1:vip, for test golang keyword',
    create_at timestamp NULL,
    update_at timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE mobile_index (mobile),
    UNIQUE name_index (name),
    PRIMARY KEY (id)
) ENGINE = InnoDB COLLATE utf8mb4_general_ci COMMENT 'user table';
EOF
goctl model mysql ddl --src user.sql --dir .
```

```bash
mkdir -p model/mongo
cd model/mongo
goctl model mongo --type user --dir .
```

## rpc demo

```bash
# 创建 demo 服务目录
$ mkdir demo && cd demo
# go mod 初始化
$ go mod init demo
# 生成 greet.proto 文件
$ goctl rpc -o greet.proto
# 生 pb.go 文件
$ protoc greet.proto --go_out=. --go-grpc_out=.
# 创建 server 目录
$ mkdir server && cd server
# 新增配置文件
$ mkdir etc && cd etc
$ touch greet-server.yaml
# 新增 server.go 文件
$ touch server.go
```

## mongo demo

```bash

```
