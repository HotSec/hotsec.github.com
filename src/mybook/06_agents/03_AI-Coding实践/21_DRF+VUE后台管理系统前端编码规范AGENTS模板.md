### 代码风格

- 语法：`<script setup lang="ts">` 组合式 API
- 组件命名：单文件组件使用 PascalCase
- 样式：`<style lang="scss" scoped>` 避免样式污染
- 路径别名：使用 `@/` 代替 `src/`，如 `@/components/`
- 缩进：2 空格；引号：双引号；分号：不加；行宽：120 字符

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `SidebarItem.vue`、`List.vue` |
| 变量/函数 | camelCase | `tableData`、`getTableData` |
| 常量 | UPPER_SNAKE_CASE | `ASSET_TYPE`、`DEFAULT_PAGE_SIZE` |
| 类型/接口 | PascalCase | `RuleForm`、`PaginationData` |
| Hooks | camelCase，use 前缀 | `usePagination`、`usePermission` |
| Store | camelCase，use 前缀 | `useUserStore`、`useAppStore` |
| API 函数 | camelCase，fetch/del/add/edit 前缀 | `fetchList`、`delItem` |
| 事件处理 | handle 前缀 | `handleSearch`、`handleDelete` |

### 组件开发

**公共组件**（`src/components/`）：
- 一个组件一个独立目录，包含 `index.vue`
- 命名具有通用性，可跨模块复用
- 通过 `defineExpose` 暴露需要外部调用的方法

**业务组件**（对应模块 `components/` 子目录）：
- 命名与业务场景相关，如 `ConfigGuideDialog.vue`、`QualityRuleDialog.vue`

### 路由配置

- 按业务模块拆分在 `src/router/modules/` 下
- 路由模式：Hash 模式
- 隐藏路由：通过 `meta.hidden: true` 控制
- 激活菜单：通过 `meta.activeMenu` 指定高亮菜单
- 使用路由懒加载（`() => import(...)`）

### API 请求

- 位置：`src/utils/request.ts`，基于 Axios 封装
- 自动清理请求参数中的空值（`''`、`null`、`undefined`、空数组）
- API 函数按业务模块分目录存放于 `src/api/`

| 操作 | 前缀 | 示例 |
|------|------|------|
| 查询 | `fetch` | `fetchList`、`fetchDetail` |
| 新增 | `add` | `addItem` |
| 编辑 | `edit` | `editItem` |
| 删除 | `del` | `delItem` |

- 文件下载设置 `responseType: "blob"`
- 文件上传通过 `onUploadProgress` 回调传递进度

#### 错误码处理

| 错误码 | 说明 |
|--------|------|
| `401` | 登录过期，跳转登录页 |
| `1001` | 登录超时 |
| `1003` | 授权过期 |
| 其他 | 通过 `ElMessage` 提示错误信息 |

### 状态管理

- 使用 Pinia Composition API 风格（Setup Store）
- Store 位置：`src/stores/`
- 命名：`useXxxStore`，使用 `defineStore("name", () => { ... })`
- Store 内使用 `ref`/`reactive` 定义状态，直接导出函数作为 actions
- 组件外使用 store 时通过 `useXxxStore()` 调用（如 axios 拦截器中）

### 样式规范

- 全局样式放在 `src/styles/`：通用工具类、CSS 变量、SCSS mixin、主题样式
- 组件样式使用 `<style lang="scss" scoped>` 限定作用域
- 穿透 UI 库样式使用 `:deep()`
- 颜色值使用十六进制

### 常用模式

#### 列表页 CRUD

1. 使用 `usePagination` 管理分页
2. `getTableData` 获取列表数据
3. `handleSearch` / `resetSearch` 处理搜索
4. `handleAdd` / `handleEdit` / `handleDelete` 处理增删改
5. 弹窗使用 `dialogVisible` 控制显隐
6. 表单使用 `ruleFormRef` + `formRules` 校验

#### 文件导入导出

- 导入使用 `ImportDialog` 组件
- 导出调用 API 获取 blob 流，使用 `download` 工具函数触发下载

#### 跨组件通信

| 场景 | 方式 |
|------|------|
| 父子组件 | Props + Emits |
| 兄弟组件/跨层级 | Pinia Store |
| 子组件暴露方法 | `defineExpose` + `ref` 调用 |

---

## 前后端协作

### 接口对接

- 后端通过 `drf-spectacular` 自动生成 OpenAPI Schema，前端通过 `/api/docs/` 查看 Swagger UI
- 前端 `src/types/` 中的 TypeScript 类型定义应与后端 Serializer 字段保持一致
- 响应格式统一：`{"code": "error_code", "message": "描述", "data": {...}}`
- 列表接口统一返回：`{"code": "0", "message": "ok", "data": {"count": N, "results": [...]}}`

### 代理配置

- 开发环境代理在 `vite.config.ts` 中配置
- API 前缀：`/api`，代理到后端 `http://localhost:8000`

---
