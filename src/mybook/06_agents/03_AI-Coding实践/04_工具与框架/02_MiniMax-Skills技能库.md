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
