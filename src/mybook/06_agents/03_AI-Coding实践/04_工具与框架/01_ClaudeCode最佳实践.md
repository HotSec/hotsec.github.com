# Claude Code 最佳实践

Claude Code 是 Anthropic 官方推出的终端 AI 编码工具，通过插件生态可以大幅提升开发效率。本文档整理了 Claude Code 的基础使用、流行插件推荐及最佳实践。

---

## 一、基础使用

### 1.1 安装方式

Claude Code 提供两种主要使用方式：

#### 方式一：Claude Desktop App（推荐新手）

最简单的方式，适合大多数用户：

```
1. 下载 Claude Desktop App
   https://claude.ai/download

2. 登录 Claude Pro 账号
   免费账号无法使用 Claude Code

3. 在 App 中打开项目目录
```

#### 方式二：终端版（推荐进阶用户）

适合习惯命令行的开发者：

```bash
# 安装 Node.js 前置依赖
# 前往 nodejs.org 下载 LTS 版本

# 安装 Claude Code
npm install -g @anthropic-ai/claude-code

# 在项目目录启动
cd your-project
claude
```

### 1.2 项目配置：CLAUDE.md

在项目根目录放置 `CLAUDE.md`，Claude Code 启动时自动读取，可大幅提升效率：

```markdown
# 项目：MyApp

## 技术栈
Python 3.11 / Django 4.2 / DRF 3.14 / PostgreSQL / Redis

## 编码规范
- 使用 DRF 3.14 的视图集和序列化器
- 错误处理使用 ResponseHelper 统一格式
- 禁止全局变量，所有状态放在数据库或 Redis
- 测试使用 pytest，覆盖核心业务逻辑

## 常用命令
- 安装依赖：pip install -r requirements.txt
- 运行开发服务器：python manage.py runserver
- 运行测试：pytest
- 代码格式化：ruff format
- 代码检查：ruff check

## 项目结构
cmd/          # 入口
api/          # DRF API
  views/      # 视图
  serializers/# 序列化器
  urls/       # 路由
core/         # 核心逻辑
  models/     # 数据模型
  services/   # 业务逻辑
  utils/      # 工具函数
tests/        # 测试
```

### 1.3 核心斜杠命令

| 命令 | 功能 | 说明 |
|------|------|------|
| `/help` | 查看帮助 | 显示所有可用命令和插件 |
| `/plugin` | 插件管理 | 查看、安装、管理插件 |
| `/save` | 保存会话 | 将当前会话保存到历史 |
| `/load` | 加载会话 | 加载历史会话 |
| `/new` | 新会话 | 开启新会话 |
| `/reset` | 重置状态 | 清除当前上下文 |

### 1.4 基础使用技巧

1. **明确任务目标**
   ```
   不要只说"帮我修个 bug"，要说：
   "修复 api/users.py 第 45 行的登录逻辑，当密码错误时应该返回 401 而不是 500"
   ```

2. **提供上下文**
   - 先让 Claude 探索项目结构
   - 提供相关文件或代码片段
   - 说明现有实现方式

3. **循序渐进**
   大任务拆成小步骤完成，不要期望一次性写完整个项目

---

## 二、流行插件推荐

### 2.1 必装插件（黄金组合）

以下三个插件是 Claude Code 生态的核心，建议必装：

```bash
# 1. 添加官方插件源
/plugin marketplace add anthropics/claude-code-plugins

# 2. 安装核心插件
/plugin install feature-dev
/plugin install cc-best
/plugin install ralph-loop

# 3. 重启 Claude Code 生效
```

#### 1) feature-dev：7 阶段引导式开发

**定位**：规划层，系统化需求分析和设计

**使用**：
```bash
/feature-dev
```

**7 阶段流程**：
| 阶段 | 名称 | 主要工作 |
|------|------|---------|
| 1 | 发现 | 理解需求，明确问题 |
| 2 | 代码库探索 | 理解现有代码结构和约束 |
| 3 | 澄清问题 | 解决歧义，明确边界条件 |
| 4 | 架构设计 | 设计技术方案，确定实现路径 |
| 5 | 实现 | 编码实现功能 |
| 6 | 测试 | 编写和运行测试 |
| 7 | 代码审查 | 自我审查，确保代码质量 |

**需求提示模板**：
```
我需要实现：用户登录功能（JWT 认证）
使用场景：用户输入邮箱密码，系统返回访问令牌
期望结果：
- POST /api/auth/login 接口
- 输入验证
- 密码加密存储
- 返回 access_token 和 refresh_token
- 错误处理规范
相关资源：参考 api/auth.py 的现有代码结构
```

#### 2) ralph-loop：持续循环执行

**定位**：执行层，让 Claude 自主完成任务直到完成

**使用**：
```bash
# 基本使用
/ralph-loop

# 指定任务文件
/ralph-loop --tasks=tasks.md

# 查看状态
/ralph-loop --status

# 恢复暂停的执行（Ctrl+C 暂停后）
/ralph-loop --resume

# 停止
/cancel-ralph
```

**任务文件格式**（feature-dev 阶段四自动生成，可直接使用）：
```markdown
# 任务清单

- [ ] 在 models.py 添加 User 模型
- [ ] 在 serializers.py 添加 UserSerializer
- [ ] 在 views.py 添加登录接口视图
- [ ] 在 urls.py 添加路由
- [ ] 编写单元测试
- [ ] 运行 pytest 验证
```

**特点**：
- 支持断点续传，`Ctrl+C` 暂停后状态自动保存
- 自主迭代，遇到问题自动调整
- 适合大规模、多步骤任务

#### 3) cc-best：代码质量提升

**定位**：质量层，集成最佳实践和代码规范

**功能**：
- 代码格式化建议
- 性能优化提示
- 安全问题检查
- 最佳实践推荐

**使用**：通常不需要显式命令，会自动集成到开发流程中

### 2.2 其他常用插件

| 插件 | 功能 | 推荐场景 |
|------|------|---------|
| **commit-commands** | Git 提交流程自动化 | 需要规范化 Git 提交的项目 |
| **chrome-dev-tools** | 连接 Chrome 实时会话 | 前端开发、调试网络请求 |
| **frontend-design** | 前端界面设计与实现 | 快速实现 UI |
| **gopls-lsp** | Go 语言服务协议支持 | Go 项目开发 |

---

## 三、完整工作流示例

### 3.1 新功能开发工作流

```bash
# 1. 确保已安装核心插件
/plugin marketplace add anthropics/claude-code-plugins
/plugin install feature-dev ralph-loop

# 2. feature-dev 规划
/feature-dev
# 走完 7 个阶段，生成 tasks.md

# 3. ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-auth-module/tasks.md

# 4. 验证并提交
pytest
git add .
git commit -m "feat: 实现用户认证（通过 feature-dev + ralph-loop）"
```

### 3.2 快速修复工作流

对于简单问题，可直接使用 ralph-loop：

```bash
# 1. 创建简单任务文件
cat > quick-fix.md << EOF
- [ ] 修复登录接口的密码验证逻辑
- [ ] 修复后运行测试
EOF

# 2. ralph-loop 执行
/ralph-loop --tasks=quick-fix.md
```

---

## 四、最佳实践

### 4.1 任务分解原则

给 Claude 的任务要：
- ✅ **明确完成标准**：每个任务要有可验证的结果
- ✅ **逻辑顺序清晰**：任务之间要有依赖关系
- ✅ **颗粒度适中**：每个任务 1-2 个文件，不要太大
- ❌ **不要一个任务写整个功能**

**好任务示例**：
```markdown
- [ ] 在 models.py 添加 User 模型
- [ ] 在 serializers.py 添加 UserSerializer
- [ ] 在 views.py 添加登录接口视图
```

**坏任务示例**：
```markdown
- [ ] 实现用户认证模块
```

### 4.2 规范先行

**先有规范，后有代码**：确保项目有 `CLAUDE.md` 或 `AGENTS.md` 规范文件

```bash
# 如果没有规范，先生成
ask: "根据现有项目代码，生成一份 CLAUDE.md 规范文件"
```

### 4.3 模型选择策略

不要所有任务都用最贵的模型，合理选择：

| 任务类型 | 推荐模型 | 理由 |
|---------|---------|------|
| 代码库探索、简单问答 | Haiku | 速度最快，成本最低 |
| 日常实现与修改 | Sonnet | 性价比最优 |
| 架构规划、复杂评审 | Opus | 需要深度推理 |

### 4.4 避坑指南

| 问题 | 建议 |
|------|------|
| ralph-loop 想暂停 | `Ctrl+C` 暂停后状态自动保存，用 `/ralph-loop --resume` 恢复 |
| 长时间任务 token 消耗大 | 合理选择模型层级，探索用 Haiku，规划用 Opus |
| Claude 跑偏 | 及时打断，用更明确的描述重新沟通 |
| 找不到相关代码 | 先让 Claude 探索项目结构，再给出具体需求 |

---

## 五、与其他工具协同

### 5.1 OpenSpec：规范驱动开发

**当需要规范管理时**，可结合 OpenSpec 使用：

```bash
# 1. OpenSpec 规划需求
/opsx:new
/opsx:continue

# 2. 生成 tasks.md 后用 ralph-loop 执行
/ralph-loop --tasks=changes/2026-05-13-my-feature/tasks.md

# 3. OpenSpec 验证并归档
/opsx:verify
/opsx:archive
```

### 5.2 Superpowers：行为规范框架

**Superpowers** 可以与 Claude Code 一起使用，规范 AI 行为：

```bash
# 初始化 Superpowers
superpowers init
superpowers select-model coding-agent

# 在 Claude Code 中使用时参考 Superpowers 规范
```

---

## 六、命令速查

### 基础命令

| 命令 | 说明 |
|------|------|
| `claude` | 启动终端版 Claude Code |
| `/help` | 查看帮助 |
| `/plugin` | 插件管理 |
| `/new` | 新会话 |
| `/save` | 保存会话 |
| `/load` | 加载会话 |

### 核心插件命令

| 命令 | 说明 |
|------|------|
| `/feature-dev` | 7 阶段引导式开发 |
| `/ralph-loop` | 启动循环执行 |
| `/ralph-loop --tasks=x.md` | 指定任务文件 |
| `/ralph-loop --status` | 查看执行状态 |
| `/ralph-loop --resume` | 恢复暂停的执行 |
| `/cancel-ralph` | 停止 ralph-loop |

---

## 七、相关资源

| 资源 | 链接 |
|------|------|
| Claude Code 官方文档 | https://docs.anthropic.com/en/docs/claude-code |
| Claude Desktop 下载 | https://claude.ai/download |
| Claude Code 官方插件 | https://github.com/anthropics/claude-code-plugins |
| OpenSpec 规范驱动开发 | [OpenSpec.md](./OpenSpec.md) |
| feature-dev + ralph-loop 详解 | [26_feature-dev_ralph-loop_GSD.md](./26_feature-dev_ralph-loop_GSD.md) |
