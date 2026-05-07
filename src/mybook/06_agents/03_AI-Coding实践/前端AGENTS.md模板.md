# Data Quality Platform Frontend Agent Guide

## 项目概述

数据质量平台前端项目，基于 Vue 3 + TypeScript + Vite + Element Plus 构建的企业级管理系统。

---

## 技术栈

| 类别      | 技术                                          |
| --------- | --------------------------------------------- |
| 核心框架  | Vue 3.4.21 + TypeScript 5.2.2                 |
| 构建工具  | Vite 5.2.0                                    |
| UI 组件库 | Element Plus 2.13.6                           |
| 状态管理  | Pinia 2.3.1                                   |
| 路由管理  | Vue Router 4.6.4                              |
| 网络请求  | Axios 1.14.0                                  |
| 表格组件  | VXE Table 4.18.11                             |
| 样式工具  | UnoCSS 66.6.8、Sass 1.98.0                    |
| 自动导入  | unplugin-auto-import、unplugin-vue-components |

---

## 目录结构

```
src/
├── api/                      # API 接口层
├── components/               # 公共组件
├── constants/                # 常量定义
├── hooks/                    # 自定义 Hooks
├── layout/                   # 布局组件
├── router/                   # 路由配置
│   └── index.ts
├── store/                    # Pinia 状态管理
│   └── modules/
│   └── index.ts
├── style/                    # 全局样式
├── styles/
├── utils/                    # 工具函数
│   ├── index.ts
│   └── service.ts            # Axios 请求封装
├── views/                    # 页面视图
├── App.vue
├── main.ts
└── permission.ts
```

---

## 开发规范

### 1. 代码风格

- **语法**：使用 `&lt;script setup lang="ts"&gt;` 组合式 API
- **组件命名**：单文件组件使用 PascalCase
- **样式**：使用 `&lt;style scoped&gt;` 避免样式污染
- **路径别名**：使用 `@/` 代替 `src/`，如 `@/components/`

### 2. 命名规范

| 类型      | 规范                               | 示例                                 |
| --------- | ---------------------------------- | ------------------------------------ |
| 组件文件  | PascalCase                         | `SidebarItem.vue`, `List.vue`        |
| 组件名    | PascalCase                         | `SidebarItem`, `InfoPopover`         |
| 变量/函数 | camelCase                          | `tableData`, `getTableData`          |
| 常量      | UPPER_SNAKE_CASE                   | `ASSET_TYPE`, `DEFAULT_PORT`         |
| 类型/接口 | PascalCase                         | `RuleForm`, `PaginationData`         |
| Hooks     | camelCase，use 前缀                | `usePagination`, `useGlobalVariable` |
| Store     | camelCase，use 前缀                | `useUserStore`, `useAppStore`        |
| API 函数  | camelCase，fetch/del/add/edit 前缀 | `fetchList`, `delItem`               |
| 事件处理  | handle 前缀                        | `handleSearch`, `handleDelete`       |
| 路径别名  | `@/` 指向 `src/`                   | `@/api/xxx`                          |

### 3. 格式化规则

- **缩进**: 2 空格，不使用 Tab
- **引号**: 双引号
- **分号**: 不加分号
- **行宽**: 120 字符
- **尾逗号**: 不加尾逗号
- **箭头函数参数**: 始终加括号

### 4. 组件开发规范

#### 公共组件

- 位置：`src/components/`
- 结构：一个组件一个独立目录，包含 `index.vue`
- 命名：具有通用性的功能组件

#### 业务组件

- 位置：对应模块目录下的 `components/` 子目录
- 命名：与业务场景相关，如 `ConfigGuideDialog.vue`、`QualityRuleDialog.vue`

### 5. 路由配置

- 路由模块：按业务模块拆分在 `src/router/modules/` 下
- 路由模式：Hash 模式
- 隐藏路由：通过 `meta.hidden: true` 控制
- 激活菜单：通过 `meta.activeMenu` 指定高亮菜单

### 6. API 请求

#### 请求封装

- 位置：`src/utils/service.ts`
- 核心类：`HttpUtil`，提供 `get`、`post`、`put`、`delete` 等方法
- 自动清理：请求参数自动去除空值（`''`、`null`、`undefined`、空数组）

#### API 约定

- API 函数按业务模块分目录存放
- 查询类函数以 `fetch` 开头
- 新增以 `add` 开头，编辑以 `edit` 开头，删除以 `del` 开头
- 文件下载设置 `responseType: "blob"`
- 文件上传通过 `onUploadProgress` 回调传递进度

#### 错误码处理

| 错误码 | 说明                          |
| ------ | ----------------------------- |
| `401`  | 登录过期，跳转登录页          |
| `1001` | 登录超时                      |
| `1003` | 授权过期                      |
| 其他   | 通过 `ElMessage` 提示错误信息 |

#### 代理配置

- 开发环境代理在 `vite.config.ts` 中配置
- API 前缀：`/data_quality/api` 或 `/api`
- 静态资源前缀：`/static`

### 7. 状态管理

- 使用 Pinia Composition API 风格
- Store 位置：`src/store/modules/`
- 命名：`useXxxStore` 或 `defineStore('xxx')`
- 使用 Setup Store 语法（`defineStore("name", () =&gt; { ... })`）
- Store 内使用 `ref` / `reactive` 定义状态
- 直接导出函数作为 actions
- 通过 `useXxxStoreHook()` 在组件外使用 store（如 axios 拦截器中）

---

## 样式规范

### 全局样式

| 文件            | 说明                                        |
| --------------- | ------------------------------------------- |
| `common.scss`   | 通用工具类（margin、flex 布局、文本溢出等） |
| `variables.css` | CSS 变量定义                                |
| `mixins.scss`   | SCSS mixin                                  |
| `styles/theme/` | 主题样式，按主题分目录                      |

### 组件样式

- 使用 `&lt;style lang="scss" scoped&gt;` 限定作用域
- 穿透 UI 库样式使用 `:deep()` 或 `::v-deep`
- 颜色值使用十六进制
- 常用工具类：`mrg-t-10`、`mrg-b-20`、`mrg-r-10`、`flex`、`flex-spa-bet` 等

---

## 常量管理

- 全局常量放 `src/constants/`
- 视图层公共常量放 `src/views/constant.js`
- 业务常量放 `src/utils/constant/`

---

## 常用模式

### 列表页 CRUD

1. 使用 `usePagination` 管理分页
2. `getTableData` 获取列表数据
3. `handleSearch` / `resetSearch` 处理搜索
4. `handleAdd` / `handleEdit` / `handleDelete` 处理增删改
5. 弹窗使用 `dialogVisible` 控制显隐
6. 表单使用 `ruleFormRef` + `formRules` 校验

### 文件导入导出

- 导入使用 `ImportDialog` 组件
- 导出调用 API 获取 blob 流，使用 `download` 工具函数触发下载
- 模板下载使用 `downloadStaticTemplate` 工具函数

### 跨组件通信

| 场景            | 方式                        |
| --------------- | --------------------------- |
| 父子组件        | Props + Emits               |
| 兄弟组件/跨层级 | Pinia Store                 |
| 子组件暴露方法  | `defineExpose` + `ref` 调用 |

## 性能优化建议

### 1. 组件优化

- 合理使用 `v-if` 和 `v-show`
- 列表使用 `v-memo` 优化渲染
- 大列表使用虚拟滚动（VXE Table 自带）
- 避免在 `template` 中使用复杂计算表达式

### 2. 路由优化

- 使用路由懒加载
- 合理配置路由 meta 信息
- 避免不必要的路由跳转

### 3. 状态管理优化

- 避免在 Store 中存储不必要的数据
- 合理使用 `computed` 缓存计算结果
- 避免频繁更新 Store 状态

### 4. 网络请求优化

- 合理使用缓存
- 避免重复请求
- 使用请求取消机制
- 大文件上传使用分片上传

## 开发常用命令

```bash
# 启动开发服务器
npm run dev

# 生产环境构建
npm run build
```
---

## 环境配置

### 开发环境

| 配置项 | 值 |
|--------|-----|
| 端口 | 3333 |
| 自动打开浏览器 | 是 |
| 代理目标 | https://192.168.10.33 |

### 生产环境

| 配置项 | 值 |
|--------|-----|
| 基础路径 | `/data_quality/` |
| 自动移除 `console.log` | 是 |
| 自动移除 `debugger` | 是 |

---

## 注意事项

1. **要添加注释**：代码中要添加注释
2. **优先编辑现有文件**：不要创建不必要的新文件
3. **组件复用**：先检查 `src/components/` 是否已有可复用组件
4. **保持现有风格**：遵循项目现有的代码风格和约定
5. **使用 TypeScript**：类型定义要完整，避免使用 `any` 类型
6. **提交前检查**：确保代码通过 lint 检查
7. **及时同步代码**：避免代码冲突
8. ** 
