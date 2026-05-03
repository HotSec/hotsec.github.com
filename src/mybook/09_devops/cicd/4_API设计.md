# API 设计

## RESTful 设计原则

### 资源命名

- 使用名词复数：`/users`、`/orders`
- 嵌套资源：`/users/{id}/orders`
- 避免动词：用 HTTP 方法表达操作

### HTTP 方法语义

| 方法 | 语义 | 幂等 | 安全 |
|------|------|:----:|:----:|
| GET | 获取资源 | ✓ | ✓ |
| POST | 创建资源 | ✗ | ✗ |
| PUT | 全量更新 | ✓ | ✗ |
| PATCH | 部分更新 | ✗ | ✗ |
| DELETE | 删除资源 | ✓ | ✗ |

### 状态码

- 200 OK / 201 Created / 204 No Content
- 400 Bad Request / 401 Unauthorized / 403 Forbidden / 404 Not Found
- 500 Internal Server Error

### HATEOAS

响应中包含相关资源的链接：

```json
{
  "id": 1,
  "name": "order",
  "_links": {
    "self": "/orders/1",
    "items": "/orders/1/items"
  }
}
```

## API 版本策略

### URL 路径

```
/api/v1/users
/api/v2/users
```

### Header

```
Accept: application/vnd.company.v2+json
```

### 查询参数

```
/api/users?version=2
```

## GraphQL

### Schema

```graphql
type Query {
  user(id: ID!): User
  users: [User]
}

type Mutation {
  createUser(input: CreateUserInput!): User
}

type Subscription {
  userUpdated: User
}

type User {
  id: ID!
  name: String!
  email: String!
  orders: [Order!]!
}
```

### N+1 问题与 DataLoader

批量加载数据，避免逐条查询：

```go
func batchLoadUsers(ids []string) ([]*User, error) {
    return db.FindUsersByIDs(ids)
}

loader := dataloader.NewBatchedLoader(batchLoadUsers)
```

## gRPC vs REST vs GraphQL 选型

| 维度 | REST | gRPC | GraphQL |
|------|------|------|---------|
| 协议 | HTTP/1.1 | HTTP/2 | HTTP/1.1 |
| 数据格式 | JSON | Protobuf | JSON |
| 强类型 | 弱 | 强 | 强 |
| 流式支持 | 有限 | 双向流 | Subscription |
| 代码生成 | OpenAPI | protoc | 有限 |
| 浏览器支持 | 原生 | 需 gRPC-Web | 原生 |
| 适用场景 | 公开 API | 微服务间 | 灵活查询 |

## API 网关

- 限流：令牌桶 / 漏桶
- 认证：JWT / OAuth 2.0 / API Key
- 日志：访问日志 / 审计日志
- 灰度发布：按比例 / 按特征路由
- 协议转换：HTTP ↔ gRPC

## API 文档

- OpenAPI（Swagger）：REST API 标准描述格式
- Protobuf：gRPC 服务定义即文档
- 工具：Swagger UI / Redoc / grpcui
