# PromptHub：开源免费的 AI Prompt 与 Skill 管理工具

PromptHub 是一个开源免费的 AI Prompt 与 Skill 管理工具，数据本地存储，隐私优先，支持 Prompt 管理、技能商店、多平台分发、版本控制、变量模板、多模型测试。

> 项目地址：https://github.com/legeling/PromptHub

---

## 一、项目概览

| 项目信息 | 内容 |
|---------|------|
| 作者 | legeling |
| 最新版本 | v0.4.7 (2026-03-30) |
| 核心理念 | Prompt 管理 + 技能商店 + 多平台分发，一站式 AI 工作台 |
| 数据存储 | 本地存储（支持 WebDAV 云同步） |
| 平台支持 | macOS / Windows / Linux |
| 多语言 | 简体中文、繁體中文、English、日本語、Deutsch、Español、Français |
| 许可 | 开源免费 |

---

## 二、核心功能

### 📝 Prompt 管理

| 功能 | 说明 |
|------|------|
| 创建/编辑/删除 | 完整的 Prompt CRUD 操作 |
| 文件夹与标签分类 | 支持组织和分类 Prompt |
| 历史版本 | 自动保存历史，支持查看、对比、回滚 |
| 模板变量 | `{{variable}}` 动态替换 |
| 快速收藏 | 一键访问常用 Prompt |
| 全文搜索 | 搜索标题、描述和内容 |
| 多媒体参考 | 支持图片/视频预览与附件管理 |

### 🧩 Skill 技能管理

| 功能 | 说明 |
|------|------|
| 技能商店 | 内置 20+ 精选技能（来自 Anthropic、OpenAI 等） |
| 多平台安装 | 一键安装到 Claude Code、Cursor、Windsurf、Codex、Kiro、Gemini CLI、Qoder、QoderWork、CodeBuddy 等 15+ 平台 |
| 本地扫描 | 自动发现本地已有 SKILL.md，预览选择后导入 |
| 软链接/复制模式 | Symlink 同步编辑或独立复制 |
| 平台目标目录 | 支持为每个平台覆写 Skills 目录 |
| AI 翻译 | 沉浸式/全文翻译技能内容 |
| 标签筛选 | 按标签快速过滤技能 |

### 🤖 AI 能力

| 功能 | 说明 |
|------|------|
| 内置 AI 测试 | 支持国内外主流服务商 |
| 多模型支持 | 覆盖各类主流大语言模型、开源及闭源模型 |
| 多模型并行对比 | 同一 Prompt 多模型并行测试对比 |
| 图像生成测评 | 支持各类图像生成模型性能测评 |
| AI 生成与润色 | AI 生成技能内容、智能润色 |

### 💾 数据与同步

| 功能 | 说明 |
|------|------|
| 本地存储 | 所有数据存储在本地，隐私安全有保障 |
| 全量备份与恢复 | `.phub.gz` 压缩格式 |
| WebDAV 云同步 | 坚果云、Nextcloud 等 |
| 启动同步 + 定时同步 | 支持自动同步策略 |

### 🎨 界面与体验

| 功能 | 说明 |
|------|------|
| 多视图模式 | 卡片、画廊、列表 |
| 主题支持 | 深色/浅色/跟随系统，多种主题色 |
| 多语言 | 7 种语言支持 |
| Markdown 渲染与代码高亮 | 支持渲染 Markdown 内容 |

### 🔐 安全功能

| 功能 | 说明 |
|------|------|
| 主密码保护 | 应用级主密码 |
| 私密文件夹 | 内容加密存储（Beta） |

---

## 三、安装方式

### 1. 下载安装

从 [Releases](https://github.com/legeling/PromptHub/releases) 下载最新版本 v0.4.7：

| 平台 | 下载 |
|---|---|
| Windows | 官方 Releases |
| macOS | 官方 Releases / Homebrew |
| Linux | 官方 Releases |

### 2. Homebrew 安装

```bash
brew tap legeling/tap # 首次安装只需执行一次
brew install --cask prompthub
```

### 3. 升级提示

**通过 Homebrew 安装的用户**：优先使用 `brew upgrade --cask prompthub`，不要和应用内更新混用。

**通过 DMG/EXE 手动安装的用户**：优先使用应用内「检查更新」或前往 Releases 手动下载。

### 4. macOS 首次启动提示

由于应用未经过 Apple 公证签名，首次打开时可能会提示 **"PromptHub 已损坏，无法打开"** 或 **"无法验证开发者"**。

**推荐解决方法**：打开终端，执行以下命令绕过公证检查：

```bash
sudo xattr -rd com.apple.quarantine /Applications/PromptHub.app
```

**或者**：打开「系统设置」→「隐私与安全性」→ 向下滚动找到安全性部分 → 点击「仍要打开」。

### 5. 从源码构建

```bash
# 克隆仓库
git clone https://github.com/legeling/PromptHub.git
cd PromptHub

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建应用
pnpm build
```

---

## 四、命令行 CLI

PromptHub 同时提供 GUI 和 CLI。

### 桌面版用户直接使用

```bash
# 安装桌面版后首次启动一次应用，然后重新打开终端
prompthub --help
prompthub prompt list
prompthub skill list
prompthub --output table prompt search SEO --favorite
```

### 从源码运行 CLI

```bash
pnpm install
# ... (根据文档继续)
```

---

## 五、为什么选择 PromptHub

- **不仅是 Prompt 管理工具，更是 AI 技能分发中心**：管理你的 Prompt 和 SKILL.md 技能，一键安装到 15+ 主流 AI 编程工具
- **数据本地存储**：所有数据都存在本地，隐私安全有保障
- **完整的版本控制**：支持历史版本查看、对比和回滚
- **变量模板支持**：`{{variable}}` 动态替换，灵活复用
- **多平台支持**：跨 macOS、Windows、Linux
