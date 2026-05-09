# 金融数据分类分级知识图谱系统 — 技术文档

## 一、系统概述

本系统基于 **JR/T 0197-2020** 标准（金融数据安全 数据安全分级指南），利用 **Neo4j 知识图谱 + LLM 大模型 + 向量检索** 实现金融数据的自动化分类分级。

### 目录结构

```
knowledge_graph/
├── docker-compose.yml                              # Neo4j 数据库部署
├── Financial_Data_Classification_Grading_JRT0197-2020.csv  # 分类分级标准数据源
├── neo4j_auth.txt                                  # Neo4j 认证信息
├── step2_build_neo4j_graph.py                      # 知识图谱构建（离线）
├── classification_engine.py                        # 两阶段分类引擎（在线）
├── llm_fallback_classifier.py                      # 纯LLM保底分类器
├── structuredData_field_analyzer.py                # 字段语义分析器
├── check_embedding.py                              # Embedding API 连通性测试
└── check_llm.py                                    # LLM API 连通性测试
```

### 技术栈

| 组件 | 技术 | 用途 |
|------|------|------|
| 图数据库 | Neo4j Community（Docker） | 存储分类体系知识图谱 |
| 向量嵌入 | qwen3-embedding-8b（GPUStack） | 文本转向量，支持语义检索 |
| LLM 大模型 | qwen3-32b-awq（GPUStack） | 字段语义推断、分类精选、实体提取 |
| 分类标准 | JR/T 0197-2020 | 金融数据四级分类体系 |
| 向量检索 | Neo4j Vector Index（余弦相似度） | 语义相似度搜索 |
| 全文检索 | Neo4j Full-text Index（BM25） | 关键词精确匹配 |
| 并发控制 | ThreadPoolExecutor | 多字段并行分类 |

---

## 二、整体工作流程

### 2.1 离线阶段：知识图谱构建

```
CSV标准文件（JR/T 0197-2020）
        │
        ▼
step2_build_neo4j_graph.py
        │
        ├─ [1] 解析CSV，提取四级分类体系 + 数据字段
        ├─ [2] 创建Neo4j约束（唯一性保证）
        ├─ [3] 创建节点：L1~L4分类、DataField、SecurityLevel
        ├─ [4] 创建关系：HAS_SUBCATEGORY、CONTAINS_FIELD、REQUIRES_MIN_LEVEL
        ├─ [5] 创建索引：全文索引 + 普通索引
        ├─ [6] 调用Embedding API生成向量嵌入
        └─ [7] 创建向量索引（余弦相似度）
        │
        ▼
Neo4j 知识图谱（持久化存储）
```

### 2.2 在线阶段：数据分类分级

#### 结构化数据（CSV/数据库表）

```
CSV原始数据表
      │
      ▼
structuredData_field_analyzer.py
      │  LLM推断每个字段的 dataType / chineseName / description
      │  识别系统标识性字段（跳过分类）
      ▼
classification_engine.py（TwoStagePipeline）
      │
      ├─ Stage 1: 混合检索 → 生成候选池
      │   ├─ 向量搜索（语义相似）× 2个索引
      │   └─ 全文搜索（关键词匹配）× 2个索引
      │   = 共4路检索结果
      │
      ├─ Stage 2: 加权融合 + 路径归约 + 去重
      │   ├─ Min-Max归一化
      │   ├─ 混合分数 = α×向量分 + (1-α)×全文分
      │   ├─ 归约到L4完整路径
      │   └─ 按L4去重，取最高分
      │
      ├─ Stage 3: LLM精选（可选）
      │   └─ 从Top N中选最准确的一个，或否决全部
      │
      ▼
分类分级结果 {classification, securityLevel, matchedNode, ...}
```

#### 非结构化数据（自由文本）

```
原始文本
    │
    ▼
UnstructuredDataClassifier
    ├─ Step 1: LLM提取金融数据实体
    └─ Step 2: 对每个实体执行TwoStagePipeline分类（Top 1）
    │
    ▼
实体分类结果列表
```

#### 保底分类（LLM Fallback）

```
知识图谱分类不确定
        │
        ▼
llm_fallback_classifier.py
        ├─ Step 1: LLM从4个一级分类中选择 → 确定L1
        ├─ Step 2: LLM从该L1下的二级分类中选择 → 确定L2
        ├─ Step 3: LLM从该L2下的三级分类中选择 → 确定L3
        ├─ Step 4: LLM从该L3下的四级分类中选择 → 确定L4
        └─ Step 5: 从CSV获取securityLevel和描述
        │
        ▼
保底分类结果
```

---

## 三、知识图谱设计

### 3.1 节点类型

| 节点标签 | 说明 | 关键属性 |
|----------|------|----------|
| `CategoryLevel1` | 一级分类（客户数据、业务数据等） | id, name |
| `CategoryLevel2` | 二级分类（个人、单位、账户信息等） | id, name, definition |
| `CategoryLevel3` | 三级分类（自然信息、身份鉴别等） | id, name, definition |
| `CategoryLevel4` | 四级分类（最细粒度分类） | id, name, fullPath, content, embedding |
| `DataField` | 具体数据字段 | id, name, fullPath, description, embedding |
| `SecurityLevel` | 安全等级（1~5级） | level, standard |

### 3.2 关系类型

```
CategoryLevel1 ──HAS_SUBCATEGORY──▶ CategoryLevel2
CategoryLevel2 ──HAS_SUBCATEGORY──▶ CategoryLevel3
CategoryLevel3 ──HAS_SUBCATEGORY──▶ CategoryLevel4
CategoryLevel2 ──HAS_SUBCATEGORY──▶ CategoryLevel4  (无L3时的三级结构)
CategoryLevel4 ──CONTAINS_FIELD──▶ DataField
CategoryLevel3 ──CONTAINS_FIELD──▶ DataField        (无L4时直接挂字段)
CategoryLevel4 ──REQUIRES_MIN_LEVEL──▶ SecurityLevel
CategoryLevel3 ──REQUIRES_MIN_LEVEL──▶ SecurityLevel
```

### 3.3 层级结构示意

```
客户数据(L1)
├── 个人(L2)
│   ├── 自然信息(L3)
│   │   ├── 个人姓名(L4) ── Level 2
│   │   ├── 个人性别(L4) ── Level 1
│   │   └── ...
│   ├── 身份鉴别(L3)
│   │   ├── 身份证号码(L4) ── Level 3
│   │   └── ...
│   └── ...
├── 单位(L2)
│   └── ...
业务数据(L1)
├── 账户信息(L2)
│   └── ...
└── ...
```

### 3.4 索引设计

| 索引名称 | 类型 | 节点 | 索引字段 |
|----------|------|------|----------|
| `dataFieldEmbeddings` | 向量索引 | DataField | embedding |
| `categoryLevel4Embeddings` | 向量索引 | CategoryLevel4 | embedding |
| `dataFieldSearch` | 全文索引 | DataField | name, description, fullPath |
| `categoryLevel4Definitions` | 全文索引 | CategoryLevel4 | content, name |
| `category_level4_name` | 普通索引 | CategoryLevel4 | name |
| `category_level4_fullpath` | 普通索引 | CategoryLevel4 | fullPath |
| `datafield_name` | 普通索引 | DataField | name |
| `datafield_fullpath` | 普通索引 | DataField | fullPath |

---

## 四、核心原理详解

### 4.1 两阶段分类 Pipeline（classification_engine.py）

#### Stage 1 — 混合检索（Recall）

**目标**：尽可能多地召回相关候选，保证召回率。

**4路并行检索**：

| 检索方式 | 索引 | 查询文本 | 优势 |
|----------|------|----------|------|
| 向量搜索 | dataFieldEmbeddings | 增强查询（含同义词扩展） | 语义相似度匹配 |
| 向量搜索 | categoryLevel4Embeddings | 增强查询（含同义词扩展） | 语义相似度匹配 |
| 全文搜索 | dataFieldSearch | 原始查询文本 | 关键词精确匹配 |
| 全文搜索 | categoryLevel4Definitions | 原始查询文本 | 关键词精确匹配 |

**向量搜索原理**：
1. 调用 Embedding API 将查询文本转为高维向量
2. 在 Neo4j 向量索引中使用余弦相似度查找最近邻节点
3. 返回 top_k 个最相似的节点及其相似度分数

**全文搜索原理**：
1. 对查询文本清洗（移除 Lucene 特殊字符，截断至 10 个 token）
2. 在 Neo4j 全文索引中使用 BM25 算法匹配
3. 返回 top_k 个最相关的节点及其 BM25 分数

#### Stage 2 — 加权融合与路径归约（Rerank）

**目标**：从候选池中选出最准确的分类，保证精确率。

**Step 1: 合并去重**
- 以节点 ID 为键合并向量/全文结果
- 同一节点保留两路分数

**Step 2: Min-Max 归一化**
```
normalized_score = (score - min) / (max - min)
```
消除向量搜索和全文搜索的分数量纲差异，使两者可比较。

**Step 3: 加权混合分数**
```
hybrid_score = α × vector_score_norm + (1-α) × fulltext_score_norm
```
默认 α=0.5，向量搜索与全文搜索同等重要。

**Step 4: 路径归约**
- DataField → 追溯所属 L4 → L1/L2/L3/L4 完整路径
- CategoryLevel4 → 直接追溯 L1/L2/L3/L4 完整路径
- 处理两种层级结构：标准四级（L1→L2→L3→L4）和三级（L1→L2→L4）

**Step 5: L4 去重**
- 同一个 L4 可能被多个不同节点命中
- 保留混合分数最高的那条记录

#### Stage 3 — LLM 精选

**目标**：弥补机器排序的不足，利用 LLM 的语义理解能力做最终判断。

- LLM 综合考虑字段含义、业务场景和分类路径的语义匹配度
- 可选择"以上均不合适"否决所有候选（非金融数据字段的安全阀）
- 失败时默认返回第一个（最高分结果）

### 4.2 同义词扩展机制

**问题**：查询文本中的术语与知识图谱中的术语存在语义鸿沟（如"客户姓名"无法匹配"个人姓名"）。

**解决方案**：内置金融术语同义词映射表：

```python
_SYNONYM_MAP = {
    "客户": ["个人", "单位"],
    "个人": ["客户"],
    "姓名": ["名称", "名字"],
    "身份": ["身份鉴别", "身份标识"],
    ...
}
```

- 从字段名和描述中提取核心术语，补充同义词
- **增强查询仅用于向量搜索**（语义匹配）
- **全文搜索仍使用原始查询**（精确匹配）

### 4.3 纯 LLM 保底分类器（llm_fallback_classifier.py）

**设计思路**：逐步缩小分类范围，避免 LLM 在庞大分类体系中迷失。

**4 步递进选择**：

```
L1选择（4选1）→ L2选择（N选1）→ L3选择（N选1）→ L4选择（N选1）
```

**每步都展示分类描述**：LLM 不仅看到分类名称，还能参考定义说明和内容描述，大幅提升选择准确性。

**回退重选机制**：
```
L4选"以上均不合适" → 回退到L3重选（最多2次）
L3也全部失败      → 回退到L2重选（最多1次）
L2也失败          → 返回"无法分类"
```

**ClassificationTree**：从 CSV 解析构建的内存层级树，支持：
- 获取每级分类的子分类列表
- 获取每级分类的描述信息
- 获取 L4 对应的安全等级
- 支持无 L3 的三级结构

### 4.4 字段语义分析器（structuredData_field_analyzer.py）

**职责**：将数据库字段的英文名/缩写名转化为有业务含义的中文描述。

**流程**：
1. 读取 CSV 表头和前 N 行样本数据
2. 按 batch_size=10 分批发送给 LLM
3. LLM 以"金融数据架构师"角色分析每个字段
4. 校验字段名一致性（不一致自动重试）

**系统标识性字段识别**：
- LLM 对 ID、编号、序号等字段的 description 添加 `[系统标识]` 前缀
- 后续分类时自动跳过这些字段（无业务敏感含义）

---

## 五、涉及的关键知识点

### 5.1 知识图谱（Knowledge Graph）

**定义**：以图结构表示实体及其关系的知识库。

**本系统应用**：
- 节点表示分类类别和数据字段
- 边表示层级包含、字段归属、安全等级关联
- 利用图遍历实现路径归约（从任意节点追溯到完整的 L1→L2→L3→L4 路径）

**Cypher 查询语言**：Neo4j 的声明式图查询语言，用于创建/查询/操作图数据。

### 5.2 向量嵌入（Vector Embedding）

**定义**：将文本映射到高维向量空间，使语义相近的文本在向量空间中距离更近。

**本系统应用**：
- 使用 qwen3-embedding-8b 模型生成嵌入
- 对 L4 和 DataField 节点的 `fullPath + name + description/content` 生成嵌入
- fullPath 参与嵌入计算，使分类路径信息参与语义匹配

**余弦相似度（Cosine Similarity）**：
```
similarity = (A · B) / (|A| × |B|)
```
衡量两个向量的方向相似性，取值范围 [-1, 1]，值越大越相似。

### 5.3 混合检索（Hybrid Search）

**向量搜索（语义检索）**：
- 基于嵌入向量的相似度搜索
- 优势：能捕获语义相似性（如"手机号"和"联系电话"）
- 劣势：可能产生语义偏差

**全文搜索（关键词检索）**：
- 基于 BM25 算法的关键词匹配
- 优势：精确匹配关键词
- 劣势：无法理解语义

**混合策略**：加权融合两路结果，兼顾语义理解和关键词精确匹配。

### 5.4 BM25 算法

**定义**：Best Matching 25，一种基于概率检索模型的排序函数。

**核心思想**：基于词频（TF）和逆文档频率（IDF）计算文档与查询的相关性分数，同时引入文档长度归一化。

### 5.5 Min-Max 归一化

**公式**：
```
x_norm = (x - x_min) / (x_max - x_min)
```

**作用**：将不同量纲的分数（向量相似度 0~1 vs BM25 分数 0~∞）统一到 [0, 1] 区间，使两者可比较和加权融合。

### 5.6 RAG（Retrieval-Augmented Generation）

**定义**：检索增强生成，先从知识库检索相关信息，再结合检索结果让 LLM 生成回答。

**本系统应用**：
- 从知识图谱检索候选分类（Retrieval）
- LLM 基于候选分类做最终精选（Generation）
- 三阶段 Pipeline 本质上是 RAG 架构的一种实现

### 5.7 Neo4j 向量索引

**原理**：在 Neo4j 中为节点的向量属性建立索引，支持近似最近邻（ANN）搜索。

**配置**：
- `vector.dimensions`：向量维度（由 Embedding 模型决定）
- `vector.similarity_function`：相似度函数（cosine）

### 5.8 Neo4j 全文索引

**原理**：基于 Apache Lucene 的全文搜索引擎，支持分词、词干提取、同义词扩展等。

**查询语法**：使用 `db.index.fulltext.queryNodes` 过程查询，支持 Lucene 查询语法。

### 5.9 Docker Secrets

**用途**：安全地管理敏感配置（如数据库密码），避免在 docker-compose.yml 中明文写入。

**本系统应用**：通过 `neo4j_auth.txt` 文件存储 Neo4j 认证信息，以 Docker Secrets 方式注入容器。

### 5.10 ThreadPoolExecutor 并发

**原理**：Python 标准库提供的线程池，适合 I/O 密集型任务的并发执行。

**本系统应用**：
- 多字段分类时使用线程池并行执行
- Neo4j Driver 是线程安全的，每个线程创建独立的 Session
- 默认 4 线程，控制对 Neo4j 和 LLM 服务的并发压力

---

## 六、配置参数说明

### classification_engine.py

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `NEO4J_URI` | bolt://192.168.10.227:7687 | Neo4j 连接地址 |
| `NEO4J_USER` | neo4j | Neo4j 用户名 |
| `NEO4J_PASSWORD` | 12345678 | Neo4j 密码 |
| `EMBEDDING_API_URL` | http://192.168.10.227:8888/v1 | Embedding API 地址 |
| `EMBEDDING_MODEL` | qwen3-embedding-8b | 嵌入模型名称 |
| `LLM_API_URL` | http://192.168.10.114/v1 | LLM API 地址 |
| `LLM_MODEL` | qwen3-32b-awq | LLM 模型名称 |
| `DEFAULT_ALPHA` | 0.5 | 向量搜索权重（0~1） |
| `DEFAULT_TOP_K` | 10 | 每路检索返回候选数 |
| `DEFAULT_MAX_WORKERS` | 4 | 并行分类最大线程数 |

### structuredData_field_analyzer.py

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `BATCH_SIZE` | 10 | 每批分析字段数 |
| `MAX_SAMPLE_ROWS` | 5 | 样本数据行数 |

---

## 七、输出格式

### 分类结果格式

```json
{
  "classification": "客户数据/个人/个人自然信息/个人姓名",
  "securityLevel": 2,
  "hybridScore": 0.8567,
  "vectorScore": 0.9123,
  "fulltextScore": 0.7891,
  "matchedNode": "个人姓名",
  "matchedNodeDesc": "个人法定姓名",
  "matchedNodeType": "DataField",
  "llmSelected": true
}
```

### 表级分类结果格式

```json
{
  "dbName": "financial_db",
  "tableName": "customer_info",
  "fieldClassifications": [
    {
      "fieldName": "cust_name",
      "chineseName": "客户姓名",
      "fieldDescription": "个人客户的法定姓名",
      "dataType": "VARCHAR",
      "isSystemIdentifier": false,
      "topClassifications": [ { ... } ],
      "queryTimeMs": 1523.45
    }
  ]
}
```
