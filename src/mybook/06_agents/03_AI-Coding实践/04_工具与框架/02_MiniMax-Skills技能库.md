# MiniMax Skills 开源技能库

## 概述

MiniMax Skills 是一套面向 AI Coding Agent 的开发技能分类库，定义了 `development skills for AI coding agents`。不只是"怎么写代码"，还包括做事顺序、实现边界、交付要求。

GitHub 仓库：https://github.com/mini-max-agent/skills

### 技能分类

| 类别 | 数量 | 技能 |
|------|------|------|
| 开发类 | 7 | frontend-dev, fullstack-dev, android-native-dev, ios-application-dev, flutter-dev, react-native-dev, shader-dev |
| Office文档 | 4 | minimax-pdf, pptx-generator, minimax-xlsx, minimax-docx |
| 多媒体生成 | 6 | gif-sticker-maker, vision-analysis, mmx-cli, minimax-music-gen, buddy-sings, minimax-music-playlist |

***

## 开发类技能

### frontend-dev — 完整前端页面

从设计工程到完整可运行项目代码的全链路交付。

| 环节 | 技术 |
|------|------|
| 设计工程 | Tailwind CSS + Geist/Outfit/Satoshi 字体 |
| 交互动画 | Framer Motion（UI动画）、GSAP + ScrollTrigger（滚动叙事）、Three.js/R3F（3D/WebGL） |
| AI素材 | MiniMax API 生成图片、视频、TTS、配乐 |
| 文案 | AIDA / PAS / FAB 框架 |
| 生成艺术 | p5.js 生成可交互 HTML 作品 |

适用场景：落地页、营销网站、产品页面、Dashboard。

### fullstack-dev — 前后端架构

搭完整后端服务，按工程规范交付。

| 要点 | 规范 |
|------|------|
| 项目结构 | Feature-first（拒绝 layer-first） |
| 错误处理 | Typed error hierarchy（`throw new AppError()`，不是 `throw Error('oops')`） |
| 配置管理 | 集中环境变量，fail-fast 启动验证 |
| API Client | typed fetch / React Query / tRPC / OpenAPI codegen |
| 认证 | JWT + refresh token |
| 实时功能 | SSE（单向）或 WebSocket（双向） |
| 文件上传 | 预签名 URL，文件不过服务器 |

### android-native-dev — Android 原生开发

Kotlin + Jetpack Compose，Material Design 3，覆盖到 Google Play 上架。

| 要点 | 规范 |
|------|------|
| 多版本 | Product Flavors：dev/staging/prod |
| 协程 | `Dispatchers.Main` 更新UI，`Dispatchers.IO` 做网络，`Dispatchers.Default` 做计算 |
| Nullable | 服务器返回字段必须 nullable（`String? = null`） |
| Composable | 不能创建 ViewModel 实例，不能在 lambda 里 return |
| 无障碍 | 触控目标最小 48dp，色彩对比度 4.5:1 |

### ios-application-dev — iOS 原生开发

UIKit/SnapKit 或 SwiftUI，Apple HIG 规范。

| 要点 | 规范 |
|------|------|
| 触控 | 目标 ≥ 44pt，内容在 safe area 内 |
| Dynamic Type | 字体随系统无障碍设置自动缩放 |
| Dark Mode | 语义化颜色（`.systemBackground`、`.label`），不硬编码色值 |
| 导航 | Tab Bar 3~5 个主分区，不用 hamburger 菜单 |
| 权限 | 在用户实际场景内请求，不在启动时弹框 |
| 认证 | 支持 Sign in with Apple |

### flutter-dev — 跨平台 Flutter 开发

Flutter 3 + Dart，一套代码覆盖 iOS、Android、Web。

| 要点 | 规范 |
|------|------|
| 状态管理 | Riverpod（简单）/ Bloc/Cubit（复杂事件流） |
| 导航 | GoRouter，支持 deep linking |
| 性能 | `const` 构造器减少重绘，`RepaintBoundary` 隔离，`compute()` 做 heavy computation |
| 列表 | `ListView.builder` 懒加载 |
| 响应式 | mobile < 650dp，tablet 650~1100dp，desktop > 1100dp |

### react-native-dev — React Native / Expo 开发

React Native 或 Expo，覆盖到 App Store / Play Store 上架。

| 要点 | 规范 |
|------|------|
| 列表 | `FlashList`（原生 FlatList 无视图回收会卡顿） |
| 图片 | `expo-image`（有缓存和 WebP 支持） |
| 动画 | Reanimated 3（原生 Animated API 能力有限） |
| 表单 | React Hook Form + Zod 验证 |
| 状态 | 服务器状态：React Query；客户端状态：Zustand 或 Jotai |
| 部署 | EAS Build / EAS Submit |

### shader-dev — GLSL 着色器艺术

GLSL 实时视觉特效，36 种 ShaderToy 兼容技术路线，输出独立 WebGL2 HTML。

| 类别 | 技术 |
|------|------|
| 几何建模 | SDF 3D 形状、CSG 布尔运算、域重复、域扭曲 |
| 渲染 | 光线行进（Ray Marching）、PBR 光照、软阴影、环境光遮蔽 |
| 模拟 | 流体动力学（Navier-Stokes）、粒子系统、细胞自动机 |
| 自然现象 | Gerstner 波浪地形、大气散射、体积云渲染 |
| 后处理 | Bloom、tone mapping、色差、故障艺术 |
| 程序化生成 | Perlin/Simplex 噪声、Voronoi、分形 |

***

## Office 文档技能

### minimax-pdf — 专业 PDF 生成

| 要点 | 描述 |
|------|------|
| 输入格式 | `content.json` |
| 封面模板 | 15种：report, proposal, resume, portfolio, academic, general, minimal, stripe, diagonal, frame, editorial, magazine, darkroom, terminal, poster |
| 内容块 | h1/h2/h3, body, bullet, numbered, callout, table, image, figure, code, math, chart, flowchart, bibliography, divider |
| 执行 | `bash scripts/make.sh run --type xxx --content content.json` |
| 依赖 | Python 3.9+, reportlab, pypdf, Node.js 18+, Playwright + Chromium |

### pptx-generator — PowerPoint 幻灯片

| 要点 | 描述 |
|------|------|
| 页面类型 | Cover, TOC, Section Divider, Content, Summary |
| 设计系统 | 配色6位hex无#，中文Microsoft YaHei，英文Arial |
| 样式配方 | Sharp / Soft / Rounded / Pill |
| 尺寸 | 10" × 5.625"（LAYOUT_16x9） |
| 生成流程 | 规划每张类型 → 逐个生成JS模块 → compile.js编译为PPTX |

### minimax-xlsx — Excel 表格处理

| 要点 | 描述 |
|------|------|
| 核心原则 | XML直接编辑，不走openpyxl往返读写（会破坏VBA、pivot、sparklines） |
| 执行流程 | xlsx_unpack.py → XML编辑 → xlsx_pack.py |
| 财务颜色 | 蓝色=硬编码输入，黑色=公式结果，绿色=跨表引用 |
| 公式规则 | 所有派生值必须用Excel公式，禁止硬编码数字 |
| 工具脚本 | xlsx_reader.py, formula_check.py, xlsx_add_column.py, xlsx_insert_row.py |

### minimax-docx — Word 文档处理

| 要点 | 描述 |
|------|------|
| 管线 | Create（从零创建）、Fill-Edit（填充/修改）、Format-Apply（套模板格式） |
| 审美配方 | 13种：ModernCorporate, AcademicThesis, ChineseGovernment(GB/T 9704), IEEE, ACM, APA, MLA, Chicago, Springer LNCS, Nature, HBR等 |
| 验证 | XSD验证门检，每次写入后必须通过 `validate --xsd` |
| OpenXML | 元素顺序严格，`<w:p>` 里 `<w:pPr>` 必须在 `<w:r>` 之前 |

***

## 多媒体生成技能

### gif-sticker-maker — Funko Pop 风格 GIF 贴纸

| 步骤 | 描述 |
|------|------|
| 1. 图生图 | MiniMax API，C4D/Octane渲染，白色背景，柔和影室灯光 |
| 2. 图生视频 | MiniMax API |
| 3. 转GIF | ffmpeg |
| 风格 | Funko Pop / Pop Mart 盲盒风格，底部黑色描边字幕 |
| 动作 | hi（挥手）、laugh（大笑）、cry（哭）、love（爱心） |
| 输出 | 4个GIF + 4个MP4源文件 |

### vision-analysis — 视觉内容分析

| 模式 | 描述 |
|------|------|
| describe | 通用描述 |
| ocr | 文字提取，按原结构保留格式 |
| ui-review | UI/UX 设计评审 |
| chart-data | 图表数据提取 |
| object-detect | 目标检测 |

工具：MiniMax `MiniMax_understand_image` MCP，支持URL或本地路径，最大20MB。

### mmx-cli — MiniMax 统一命令行工具

| 命令 | 功能 |
|------|------|
| `mmx text chat` | 文本对话，默认 MiniMax-M2.7 |
| `mmx image generate` | 图生图，模型 image-01，支持 `--subject-ref` |
| `mmx video generate` | 文生视频/图生视频，MiniMax-Hailuo 2.3 |
| `mmx speech synthesize` | TTS，支持 `--voice`/`--speed`/`--pitch`/`--format` |
| `mmx music generate` | 音乐生成，支持 `--lyrics`/`--instrumental`/`--vocals` |
| `mmx vision describe` | 图片理解 |
| `mmx search query` | 网络搜索 |

安装：`npm install -g mmx-cli`，认证：`mmx auth login --api-key xxx`。

### minimax-music-gen — 音乐生成

| 模式 | 描述 |
|------|------|
| Basic | 一句话出歌，自动生成歌词和配乐 |
| Advanced | 自己编辑歌词+细化prompt，规划BPM/风格/乐器 |
| Cover | 上传参考音频，生成指定风格翻唱 |

歌词语种默认跟用户语言，通过声线描述嵌入。

### buddy-sings — AI 宠物唱歌

读取 `~/.claude.json` 的 companion 字段（name + personality），生成专属音色并演唱。

- 声线从性格自由推断（低沉温暖/明亮有力/空灵神秘）
- 声线缓存：`~/.claude/skills/buddy-sings/voices/<name>.json`
- 歌词视角：宠物第一人称

### minimax-music-playlist — 个性化播放列表

| 步骤 | 描述 |
|------|------|
| 数据来源 | Apple Music（osascript）/ Spotify（用户导出JSON） |
| 口味画像 | 流派分布、情绪倾向、声线偏好、语种分布、Top艺术家 |
| 生成 | 5首歌曲 + 1张专辑封面并发 |
| 缓存 | `<SKILL_DIR>/data/taste_profile.json`，7天内复用 |

***

## 选型速查

| 需求 | 技能 |
|------|------|
| 漂亮的落地页 | frontend-dev |
| 后端服务+数据库 | fullstack-dev |
| Android 原生 | android-native-dev |
| iOS 原生 | ios-application-dev |
| 一次开发多端 | flutter-dev / react-native-dev |
| 视觉效果/艺术 | shader-dev |
| 专业 PDF | minimax-pdf |
| 幻灯片 | pptx-generator |
| Excel 财务模型 | minimax-xlsx |
| Word 合同/公文/论文 | minimax-docx |
| 照片→卡通GIF | gif-sticker-maker |
| 图片/设计稿分析 | vision-analysis |
| 命令行调MiniMax | mmx-cli |
| 视频配乐/BGM | minimax-music-gen |
| AI宠物唱歌 | buddy-sings |
| 定制播放列表 | minimax-music-playlist |

***

## 深度机制解析

### 一、Skills 的本质与价值

Skills 是 MiniMax Agent 的核心扩展机制，本质上是**可复用的任务模块**。

**核心价值：**
- **能力封装**：将复杂任务封装为独立可调用的单元
- **跨场景复用**：同一 Skill 可在不同任务中调用
- **团队协作**：Leader 可将 Skills 分配给不同 Worker
- **持续进化**：每次执行沉淀经验，自动优化

**与传统工具调用的区别：**

| 维度 | 传统工具调用 | MiniMax Skills |
|------|-------------|----------------|
| 粒度 | 单步操作 | 完整任务流 |
| 状态管理 | 无状态 | 自带状态追踪 |
| 学习能力 | 无 | 自动沉淀经验 |
| 协作能力 | 独立调用 | 可组合编排 |

---

### 二、Skills 工作机制

#### 1. 生命周期

```
注册 → 发现 → 选择 → 执行 → 反馈 → 沉淀
```

**注册阶段**：
- Skills 存储在 `~/.claude/skills/` 目录
- 支持本地安装和远程仓库
- 每个 Skill 包含 `skill.json` 配置文件

**发现阶段**：
- Agent 自动扫描可用 Skills
- 根据任务需求匹配最合适的 Skill
- 考虑因素：任务类型、历史成功率、资源消耗

**执行阶段**：
- Skill 获得独立的上下文空间
- 可调用其他 Skills（嵌套调用）
- 支持异步执行和进度汇报

#### 2. Skill Manifest 结构

```json
{
  "name": "frontend-dev",
  "version": "1.0.0",
  "description": "完整前端页面开发",
  "tags": ["frontend", "react", "tailwind"],
  "requirements": {
    "memory": 512,
    "timeout": 300,
    "tools": ["file_write", "terminal"]
  },
  "input_schema": {
    "type": "object",
    "properties": {
      "design_spec": {"type": "string"},
      "tech_stack": {"type": "string", "enum": ["react", "vue", "svelte"]},
      "features": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["design_spec"]
  },
  "output_schema": {
    "type": "object",
    "properties": {
      "project_path": {"type": "string"},
      "preview_url": {"type": "string"},
      "summary": {"type": "string"}
    }
  }
}
```

---

### 三、核心 Skill 类型

#### 1. 执行型 Skills

直接完成具体任务，返回明确结果。

**示例：**
- `frontend-dev`：生成前端项目
- `minimax-pdf`：生成 PDF 文档
- `vision-analysis`：图片分析

**特点：**
- 输入输出明确
- 执行时间可预测
- 结果可验证

#### 2. 工具型 Skills

提供特定工具能力，作为其他 Skills 的支撑。

**示例：**
- `terminal`：命令行执行
- `file_write`：文件写入
- `web_search`：网络搜索

**特点：**
- 原子化操作
- 无业务逻辑
- 高复用性

#### 3. 协调型 Skills

负责任务拆解和子任务协调。

**示例：**
- `task-decomposer`：任务拆解
- `workflow-orchestrator`：工作流编排
- `verifier`：验证验收

**特点：**
- 不直接产生输出
- 管理其他 Skills
- 决策驱动

---

### 四、Skill 开发指南

#### 1. 创建自定义 Skill

**步骤 1：创建目录结构**
```
~/.claude/skills/my-custom-skill/
├── skill.json          # 元数据配置
├── main.py             # 主逻辑
├── requirements.txt    # 依赖
└── README.md           # 文档
```

**步骤 2：实现核心逻辑**
```python
from minimax_skills import Skill, Context

class MyCustomSkill(Skill):
    def __init__(self):
        super().__init__()
        self.name = "my-custom-skill"
    
    async def execute(self, context: Context):
        # 获取输入参数
        input_data = context.get_input()
        
        # 执行核心逻辑
        result = await self.process(input_data)
        
        # 返回结果
        return {
            "success": True,
            "data": result,
            "summary": "执行完成"
        }
    
    async def process(self, data):
        # 实际处理逻辑
        pass
```

**步骤 3：测试与发布**
```bash
# 本地测试
mmx skill test my-custom-skill

# 打包发布
mmx skill package my-custom-skill
mmx skill publish my-custom-skill-1.0.0.zip
```

#### 2. 最佳实践

**命名规范：**
- 小写字母 + 连字符
- 描述性命名（如 `pdf-generator` 而非 `tool1`）

**错误处理：**
- 使用结构化错误码
- 提供详细错误信息
- 支持重试机制

**性能优化：**
- 缓存中间结果
- 异步执行耗时操作
- 批量处理减少调用次数

---

### 五、Skills 在 Agent Teams 中的应用

#### 1. 分工协作模式

```
Leader
    │
    ├── Worker 1 ──→ frontend-dev Skill
    │
    ├── Worker 2 ──→ fullstack-dev Skill
    │
    └── Verifier ──→ code-review Skill
```

#### 2. Skill 组合策略

**流水线模式：**
```
输入 → Skill A → Skill B → Skill C → 输出
```

**并行模式：**
```
输入
    │
    ├─→ Skill A ──┐
    ├─→ Skill B ──┼→ 合并 → 输出
    └─→ Skill C ──┘
```

**条件分支模式：**
```
输入 → 判断 → Skill A（条件1）
          └→ Skill B（条件2）
```

#### 3. 技能市场（Skill Marketplace）

Mavis 内置技能商店，支持：
- 浏览和搜索 Skills
- 一键安装
- 评分和评论
- 版本管理

---

### 六、Skills 进阶特性

#### 1. 记忆集成

Skills 可以访问和更新 Agent 记忆：
```python
# 读取长期记忆
history = context.memory.get("project_guidelines")

# 写入记忆
context.memory.set("last_deploy_time", datetime.now())

# 查询相关记忆
related = context.memory.search("frontend best practices")
```

#### 2. 自适应优化

每次执行后自动学习：
- 记录执行时间和成功率
- 分析失败原因
- 自动调整参数
- 推荐更优路径

#### 3. 权限控制

Skills 有独立的权限边界：
- 文件系统访问范围
- API 调用限额
- 网络访问控制
- 敏感操作审批

---

### 七、典型应用场景

#### 场景 1：全栈项目开发

```
用户请求：创建一个电商后台管理系统

执行流程：
1. Leader 分析需求，识别需要的 Skills
2. 分配 Worker 1 使用 fullstack-dev Skill 搭建后端
3. 分配 Worker 2 使用 frontend-dev Skill 开发前端
4. 分配 Verifier 使用 code-review Skill 验收
5. 自动集成测试
6. 交付最终项目
```

#### 场景 2：数据分析报告

```
用户请求：分析销售数据并生成报告

执行流程：
1. 使用 data-analysis Skill 处理数据
2. 使用 chart-generator Skill 生成图表
3. 使用 minimax-pdf Skill 生成报告
4. 使用 vision-analysis Skill 审查报告质量
```

#### 场景 3：内容创作

```
用户请求：为新产品写一篇营销文案

执行流程：
1. 使用 web-search Skill 收集竞品信息
2. 使用 content-writer Skill 生成初稿
3. 使用 grammar-check Skill 校对
4. 使用 seo-analyzer Skill 优化
```

---

### 八、总结

MiniMax Skills 是一套强大的能力扩展系统，核心优势：

1. **模块化设计**：任务封装为独立单元，便于复用和维护
2. **智能调度**：自动选择最优 Skill 组合
3. **持续进化**：基于执行数据不断优化
4. **团队协作**：支持多 Agent 分工协作
5. **生态开放**：支持自定义开发和共享

通过合理使用 Skills，可以显著提升 Agent 的任务处理能力和效率。
