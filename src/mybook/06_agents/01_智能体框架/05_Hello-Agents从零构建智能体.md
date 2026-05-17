# Hello-Agents 从零构建智能体

## 一、项目概述

**Hello-Agents** 是 Datawhale 社区出品的系统性智能体学习教程《从零开始构建智能体》，旨在带领开发者从大语言模型的"使用者"蜕变为智能体系统的"构建者"。

- 项目地址：[github.com/datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents)
- 在线阅读：[datawhalechina.github.io/hello-agents](https://datawhalechina.github.io/hello-agents/)
- 自研框架：[HelloAgents](https://github.com/jjyaoao/helloagents)（基于 OpenAI 原生 API 从零构建）

### 1.1 核心定位

Agent 构建分两派：
- **软件工程类 Agent**（Dify、Coze、n8n）：流程驱动，LLM 作为数据处理后端
- **AI 原生 Agent**：真正以 AI 驱动的 Agent

本教程聚焦后者——**真正的 AI Native Agent**。

### 1.2 学习收获

| 收获 | 说明 |
|------|------|
| 理解核心原理 | 智能体概念、历史与经典范式 |
| 亲手实现 | ReAct、Plan-and-Solve、Reflection 等范式 |
| 掌握低代码平台 | Coze、Dify、n8n |
| 掌握代码框架 | AutoGen、AgentScope、LangGraph |
| 自研框架 | 基于 OpenAI API 从零构建 HelloAgents |
| 高级技能 | 上下文工程、Memory、协议、评估、Agentic RL |
| 实战案例 | 智能旅行助手、深度研究 Agent、赛博小镇 |

---

## 二、内容结构（五大部分 16 章）

### 第一部分：智能体与语言模型基础（第 1-3 章）

| 章节 | 关键内容 |
|------|---------|
| 第一章 初识智能体 | 智能体定义、类型、范式与应用 |
| 第二章 智能体发展史 | 从符号主义到 LLM 驱动的智能体演进 |
| 第三章 大语言模型基础 | Transformer、提示、主流 LLM 及其局限 |

### 第二部分：构建你的大语言模型智能体（第 4-7 章）

| 章节 | 关键内容 |
|------|---------|
| 第四章 智能体经典范式构建 | 手把手实现 ReAct、Plan-and-Solve、Reflection |
| 第五章 基于低代码平台的智能体搭建 | Coze、Dify、n8n 等平台使用 |
| 第六章 框架开发实践 | AutoGen、AgentScope、LangGraph 等主流框架 |
| 第七章 构建你的 Agent 框架 | 从 0 开始构建智能体框架 HelloAgents |

### 第三部分：高级知识扩展（第 8-12 章）

| 章节 | 关键内容 |
|------|---------|
| 第八章 记忆与检索 | 记忆系统、RAG、存储 |
| 第九章 上下文工程 | 持续交互的"情境理解"、GSSC 流水线 |
| 第十章 智能体通信协议 | MCP、A2A、ANP 等协议解析 |
| 第十一章 Agentic-RL | 从 SFT 到 GRPO 的 LLM 训练实战 |
| 第十二章 智能体性能评估 | 核心指标、基准测试与评估框架 |

### 第四部分：综合案例进阶（第 13-15 章）

| 章节 | 关键内容 |
|------|---------|
| 第十三章 智能旅行助手 | MCP 与多智能体协作的真实世界应用 |
| 第十四章 自动化深度研究智能体 | DeepResearch Agent 复现与解析 |
| 第十五章 构建赛博小镇 | Agent 与游戏的结合，模拟社会动态 |

### 第五部分：毕业设计及未来展望（第 16 章）

| 章节 | 关键内容 |
|------|---------|
| 第十六章 毕业设计 | 构建属于你的完整多智能体应用 |

---

## 三、第九章 上下文工程（核心章节详解）

第九章是本教程最核心的章节之一，详细阐述了上下文工程的理论与实践。

### 3.1 上下文工程 vs 提示工程

| 维度 | 提示工程 | 上下文工程 |
|------|---------|-----------|
| 关注点 | 如何编写与组织 LLM 的指令 | 如何策划与维护"最优的信息集合" |
| 范围 | 系统提示的写法与结构化策略 | 系统指令 + 工具 + MCP + 外部数据 + 消息历史 |
| 适用场景 | 单轮分类或文本生成 | 多轮推理、长时程 Agent |

### 3.2 ContextBuilder：GSSC 流水线

HelloAgents 框架实现了 **Gather-Select-Structure-Compress** 流水线：

```
Gather（收集）→ Select（选择）→ Structure（结构化）→ Compress（压缩）
```

**设计目标**：
1. **统一入口**：将 GSSC 抽象为可复用流水线
2. **稳定形态**：输出固定骨架的上下文模板
3. **预算守护**：在 token 预算内保留高价值信息
4. **最小规则**：不引入来源/优先级等分类维度

**上下文模板分区**：
- `[Role & Policies]`：Agent 角色定位和行为准则
- `[Task]`：当前需要完成的具体任务
- `[State]`：Agent 当前状态和上下文信息
- `[Evidence]`：从外部知识库检索的证据
- `[Context]`：历史对话和相关记忆
- `[Output]`：期望的输出格式和要求

### 3.3 核心数据结构

**ContextPacket（候选信息包）**：
```python
@dataclass
class ContextPacket:
    content: str
    timestamp: datetime
    token_count: int
    relevance_score: float = 0.5
    metadata: Optional[Dict[str, Any]] = None
```

**ContextConfig（配置管理）**：
```python
@dataclass
class ContextConfig:
    max_tokens: int = 3000
    reserve_ratio: float = 0.2
    min_relevance: float = 0.1
    enable_compression: bool = True
    recency_weight: float = 0.3
    relevance_weight: float = 0.7
```

### 3.4 NoteTool：结构化笔记

智能体以固定频率将关键信息写入上下文外的持久化存储，在后续阶段按需拉回。以极低的上下文开销维持持久状态与依赖关系。

### 3.5 TerminalTool：即时文件系统访问

支持智能体进行文件系统操作和即时上下文检索，实现 JIT（Just-in-time）上下文获取。

### 3.6 长时程任务的上下文工程

| 方法 | 适用场景 | 核心思想 |
|------|---------|---------|
| 压缩整合 | 长对话连续性 | 高保真总结，用摘要重启新窗口 |
| 结构化笔记 | 迭代式开发与研究 | 关键信息写入持久化存储 |
| 子代理架构 | 复杂研究与分析 | 主代理规划，子代理在干净窗口深挖 |

---

## 四、社区贡献精选

| 编号 | 内容 |
|------|------|
| Extra01 | Agent 面试题总结与答案 |
| Extra02 | 上下文工程内容补充 |
| Extra03 | Dify 智能体创建保姆级教程 |
| Extra04 | Hello-Agents 课程常见问题 |
| Extra05 | Agent Skills 与 MCP 对比解读 |
| Extra06 | GUI Agent 科普与实战 |
| Extra07 | 环境配置 |
| Extra08 | 如何写出好的 Skill |
| Extra09 | Agent 应用开发踩坑与经验分享 |
| Extra10 | Agent Self-Evolution 智能体自进化 |
| Extra11 | WebAgent 科普与实战 |
| Extra12 | 旅行助手后训练实战（LoRA SFT 评测闭环） |

---

## 五、与知识库中其他知识点的关联

| 关联知识点 | 关联说明 |
|-----------|---------|
| AI 工程三层范式 | 第九章上下文工程是 Context Engineering 的系统化实践 |
| Harness Engineering | HelloAgents 框架的 GSSC 流水线是 Harness 的具体实现 |
| Ralph Wiggum | 自主循环需要上下文工程支撑长时程任务 |
| 哔哩哔哩智能开发工作流 | .workflow 知识库是 Context Engineering 的企业级实践 |
| Codex /goal | 目标管理是 Harness Engineering 中"目标与边界"的体现 |

---

## 六、参考资料

- [Hello-Agents 在线阅读](https://datawhalechina.github.io/hello-agents/)
- [Hello-Agents GitHub](https://github.com/datawhalechina/hello-agents)
- [HelloAgents 框架](https://github.com/jjyaoao/helloagents)
- [PDF 下载](https://github.com/datawhalechina/hello-agents/releases/latest/)
- 项目负责人：陈思州（Datawhale 成员）
- 联合发起者：孙韬（CAMEL-AI）、姜舒凡
