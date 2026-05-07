# AGENTS.md

## 项目概述

[项目名称] 是一个 [简短描述]。使用 [主要框架/库] 构建，运行在 [运行环境]。

## 技术栈

- **语言**：Python 3.12+
- **框架**：[ Django / Flask / FastAPI /None]
- **数据库**：[PostgreSQL / Mysql / SQLite / None]
- **包管理**：uv
- **格式化与 Lint**：ruff
- **类型检查**：pyright
- **测试**：pytest

## 命令

所有命令均从项目根目录执行。

```bash
# 安装依赖
uv sync

# 运行开发服务器
uv run python -m [module]

# 运行全部测试
uv run pytest

# 运行单个测试
uv run pytest tests/test_foo.py::test_bar -xvs

# 运行特定目录的测试
uv run pytest tests/unit/

# 格式化代码
uv run ruff format .

# Lint（含自动修复）
uv run ruff check --fix .

# 类型检查
uv run pyright

# 一键检查（格式化 + Lint + 类型检查 + 测试）
uv run ruff format . && uv run ruff check --fix . && uv run pyright && uv run pytest
```

## 项目结构

```
[project]/
├── src/[package]/       # 源代码
│   ├── __init__.py
│   ├── main.py          # 入口
│   ├── api/             # API 层（如适用）
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   └── utils/           # 工具函数
├── tests/               # 测试（镜像 src/ 结构）
│   ├── conftest.py
│   ├── test_main.py
│   └── test_services/
├── pyproject.toml       # 项目配置
├── uv.lock              # 锁文件（自动生成，勿手动编辑）
└── AGENTS.md            # 本文件
```

## 编码规范

### Python 风格

- 使用 `ruff` 格式化和 lint，配置在 `pyproject.toml`
- 行长度上限 150 字符
- 所有公共函数和类必须有类型注解
- 优先使用现代类型语法：`list[str]` 而非 `List[str]`，`X | None` 而非 `Optional[X]`
- 导入顺序：标准库 → 第三方 → 本项目（ruff 自动管理）
- 所有导入放在文件顶部，禁止函数内导入（除非解决循环导入）

### 命名

- 变量和函数：`snake_case`
- 类：`PascalCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有成员：`_leading_underscore`

### 错误处理

- 使用具体的异常类型，禁止 `except Exception` 或 bare `except`
- 使用 `logger.exception()` 而非 `logger.error()` 记录异常（自动包含堆栈信息）
- 定义项目专属异常类，继承自统一基类

### 日志

- 使用模块级 logger：`logger = logging.getLogger(__name__)`
- 禁止 `print()` 输出

## 测试规范

- 测试文件放在 `tests/` 目录，镜像 `src/` 结构
- 使用 pytest，不使用 `unittest.TestCase`
- 测试函数命名：`test_<功能>_<场景>_<预期>`
- 使用 `@pytest.mark.parametrize` 处理多输入场景，避免分支逻辑
- Mock 仅用于外部依赖（网络请求、数据库），优先使用真实实现
- 每个新功能必须有对应测试

## Git 与 PR 规范

### Commit 消息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <description>
```

类型：`feat` / `fix` / `docs` / `style` / `refactor` / `perf` / `test` / `chore`

### PR 要求

- PR 标题遵循 Conventional Commits
- 关联相关 Issue：`Closes #123`
- 描述变更的**原因**和**方案**，而非实现细节
- 提交前确保：格式化 + Lint + 类型检查 + 测试全部通过

### 禁止事项

- 禁止 `--no-verify` 跳过 pre-commit hooks
- 禁止 `--amend` 修改已推送的 commit
- 禁止直接推送到 `main` 分支

## AI 辅助开发

### 披露要求

如果使用 AI 辅助编写代码，在 PR 描述中包含：

> 此 PR 包含在 AI 辅助下编写的代码。代码已经过人工审查。

### 禁止事项

- 不要添加 "Generated with AI" 注释
- 不要添加 AI 工具的 Co-Author 标记（除非项目明确要求）
- 不要在 commit 消息中提及 AI 工具
- 不要在 issue 或 PR 上发布 AI 生成的评论

## 安全注意事项

- 永远不要将密钥、token 或密码提交到仓库
- 使用环境变量管理敏感配置：`os.getenv("KEY")` 而非硬编码
- 所有用户输入必须验证和清理
- API 端点必须有适当的权限检查
- 防止常见漏洞：SQL 注入、XSS、CSRF、IDOR

## 反模式（永远不要）

- 不要绕过 `uv run` 直接调用 `python` 或 `pytest`
- 不要手动编辑自动生成的文件（如 `uv.lock`）
- 不要使用 `# type: ignore` 掩盖类型错误——修复根本原因
- 不要使用 `Any` 类型——使用具体类型或泛型
- 不要在测试中使用 `assert` 语句——使用 pytest 的断言
- 不要提交调试代码（`print()`、`breakpoint()`、注释掉的代码）
