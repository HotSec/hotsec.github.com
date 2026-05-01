# RAG 系统设计

---

## 一、RAG 架构

```
用户查询 → Query 改写 → 检索 → 重排序 → LLM 生成 → 回答
              ↑                          ↑
         查询扩展/改写              上下文窗口管理
```

### 1.1 Naive RAG

```
Query → Embed → Vector DB → Top-K → LLM → Answer
```

问题：检索质量差，无关文档干扰回答。

### 1.2 Advanced RAG

```
Query → Query改写 → 混合检索 → 重排序 → 压缩 → LLM → Answer
```

### 1.3 Modular RAG

```
Query → 路由 → 检索/搜索/计算 → 聚合 → LLM → Answer
```

---

## 二、文档处理

### 2.1 文档加载

```python
from langchain_community.document_loaders import (
    PyPDFLoader, TextLoader, UnstructuredMarkdownLoader,
    Docx2txtLoader, CSVLoader, DirectoryLoader,
)

# PDF
pdf_docs = PyPDFLoader("doc.pdf").load()

# Markdown
md_docs = UnstructuredMarkdownLoader("doc.md").load()

# 目录批量加载
loader = DirectoryLoader(
    "./docs",
    glob="**/*.{md,txt,pdf}",
    show_progress=True,
)
all_docs = loader.load()
```

### 2.2 切分策略

```python
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
    MarkdownHeaderTextSplitter,
    TokenTextSplitter,
)

# 递归切分（推荐）
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", "！", "？", ".", " ", ""],
)

# Markdown 按标题切分
md_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "h1"),
        ("##", "h2"),
        ("###", "h3"),
    ]
)

# Token 切分（精确控制 token 数）
token_splitter = TokenTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
)
```

### 2.3 元数据

```python
from langchain_core.documents import Document

doc = Document(
    page_content="文档内容...",
    metadata={
        "source": "doc.pdf",
        "page": 1,
        "chapter": "第三章",
        "author": "Alice",
    },
)
```

---

## 三、Embedding 模型选择

| 模型 | 维度 | 中文支持 | 特点 |
|------|------|----------|------|
| OpenAI text-embedding-3-small | 1536 | ✅ | 通用 |
| OpenAI text-embedding-3-large | 3072 | ✅ | 高精度 |
| bge-m3 | 1024 | ✅✅ | 中文最佳 |
| GTE-large | 1024 | ✅✅ | 阿里开源 |
| Cohere embed-v3 | 1024 | ✅ | 多语言 |
| E5-mistral-7b | 4096 | ✅ | 高精度 |

---

## 四、向量数据库

### 4.1 选型对比

| 数据库 | 特点 | 适用场景 |
|--------|------|----------|
| FAISS | 内存级，速度快 | 原型/小规模 |
| Chroma | 轻量，易用 | 开发/小规模 |
| Milvus | 分布式，高性能 | 生产/大规模 |
| Qdrant | Rust 实现，高效 | 生产/中等规模 |
| Weaviate | 全功能，GraphQL | 生产/中等规模 |
| Pinecone | 全托管 | 无运维需求 |
| pgvector | PostgreSQL 扩展 | 已有 PG |

### 4.2 FAISS 示例

```python
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings()
vectorstore = FAISS.from_documents(chunks, embeddings)

# 保存/加载
vectorstore.save_local("./faiss_index")
vectorstore = FAISS.load_local("./faiss_index", embeddings, allow_dangerous_deserialization=True)

# 相似度搜索
results = vectorstore.similarity_search("查询内容", k=5)
results_with_score = vectorstore.similarity_search_with_score("查询内容", k=5)
```

---

## 五、检索策略

### 5.1 混合检索

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

# 稀疏检索 (BM25)
bm25 = BM25Retriever.from_documents(chunks, k=5)

# 稠密检索 (向量)
vector = vectorstore.as_retriever(search_kwargs={"k": 5})

# 混合检索
ensemble = EnsembleRetriever(
    retrievers=[bm25, vector],
    weights=[0.4, 0.6],
)
```

### 5.2 父文档检索

```python
from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore

parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)

retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=InMemoryStore(),
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)

retriever.add_documents(docs)

# 检索时返回小 chunk 对应的父文档
results = retriever.invoke("查询内容")
```

### 5.3 Self-Query

```python
from langchain.chains.query_constructor.base import AttributeInfo
from langchain.retrievers.self_query.base import SelfQueryRetriever

metadata_field_info = [
    AttributeInfo(name="chapter", type="string", description="章节名称"),
    AttributeInfo(name="page", type="integer", description="页码"),
]

retriever = SelfQueryRetriever.from_llm(
    llm,
    vectorstore,
    "技术文档",
    metadata_field_info,
)

# 自动将自然语言转为过滤条件
results = retriever.invoke("第三章中关于性能优化的内容")
```

---

## 六、重排序

### 6.1 Cohere Rerank

```python
from langchain_cohere import CohereRerank
from langchain.retrievers import ContextualCompressionRetriever

reranker = CohereRerank(model="rerank-v3.5")
compression_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 20}),
)

# 先检索 20 个，重排序后返回最相关的
results = compression_retriever.invoke("查询内容")
```

### 6.2 BGE Reranker

```python
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
from langchain.retrievers.document_compressors import CrossEncoderReranker

cross_encoder = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-v2-m3")
reranker = CrossEncoderReranker(model=cross_encoder, top_n=5)

compression_retriever = ContextualCompressionRetriever(
    base_compressor=reranker,
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 20}),
)
```

---

## 七、Query 改写

### 7.1 HyDE (假设文档嵌入)

```python
from langchain.retrievers import HyDERetriever

hyde_retriever = HyDERetriever.from_llm(
    llm,
    vectorstore,
    prompt=ChatPromptTemplate.from_template(
        "请写一段详细回答以下问题的文字：\n{question}"
    ),
)

results = hyde_retriever.invoke("什么是 RAG？")
# LLM 先生成假设答案 → 用假设答案做检索 → 返回真实文档
```

### 7.2 Multi-Query

```python
from langchain.retrievers.multi_query import MultiQueryRetriever

retriever = MultiQueryRetriever.from_llm(
    retriever=vectorstore.as_retriever(),
    llm=llm,
)

# 自动生成多个查询变体
results = retriever.invoke("性能优化")
# 生成: "如何提升系统性能", "性能调优方法", "系统加速技巧"
```

---

## 八、评估 (RAGAS)

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,         # 忠实度：回答是否基于上下文
    answer_relevancy,     # 相关性：回答是否切题
    context_precision,    # 上下文精度：检索文档是否相关
    context_recall,       # 上下文召回：是否检索到所有相关信息
)

result = evaluate(
    dataset=eval_dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)

print(result)
```

---

## 九、生产部署清单

| 维度 | 建议 |
|------|------|
| 文档处理 | chunk_size=500, overlap=50, 保留元数据 |
| Embedding | 中文选 bge-m3，英文选 OpenAI |
| 向量库 | 小规模 FAISS，大规模 Milvus/Qdrant |
| 检索 | 混合检索 (BM25 + 向量) |
| 重排序 | BGE Reranker / Cohere Rerank |
| Query 改写 | Multi-Query + HyDE |
| 评估 | RAGAS 持续评估 |
| 监控 | 检索命中率、延迟、用户反馈 |
