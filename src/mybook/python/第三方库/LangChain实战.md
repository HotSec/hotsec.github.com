# LangChain 实战

---

## 一、LangChain 简介

LangChain 是一个用于开发 LLM 应用的框架，提供 6 大核心组件：

| 组件 | 说明 |
|------|------|
| Model I/O | 模型接口、Prompt 管理、输出解析 |
| Data Connection | 文档加载、切分、向量存储、检索 |
| Chains | 调用链，组合多个组件 |
| Memory | 对话记忆，上下文管理 |
| Agents | 智能代理，工具调用 |
| Callbacks | 回调系统，日志追踪 |

### 1.1 安装

```bash
pip install langchain langchain-openai langchain-community
```

---

## 二、Model I/O

### 2.1 Chat Model

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4",
    temperature=0.7,
    api_key="your-api-key",
)

# 基本调用
response = llm.invoke("什么是量子计算？")
print(response.content)

# 批量调用
responses = llm.batch(["问题1", "问题2", "问题3"])

# 流式输出
for chunk in llm.stream("讲一个故事"):
    print(chunk.content, end="", flush=True)
```

### 2.2 Prompt Template

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

# 简单模板
prompt = ChatPromptTemplate.from_template("给我讲一个关于{topic}的笑话")
chain = prompt | llm
response = chain.invoke({"topic": "程序员"})

# 带系统消息的模板
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}，用{style}风格回答问题"),
    ("human", "{question}"),
])
chain = prompt | llm
response = chain.invoke({
    "role": "技术专家",
    "style": "幽默",
    "question": "什么是微服务？",
})

# 带历史消息
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手"),
    MessagesPlaceholder("history"),
    ("human", "{question}"),
])
```

### 2.3 Output Parser

```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field

# 字符串解析
parser = StrOutputParser()
chain = prompt | llm | parser

# JSON 解析
class MovieReview(BaseModel):
    title: str = Field(description="电影名称")
    rating: int = Field(description="评分 1-10")
    summary: str = Field(description="简短评价")

parser = JsonOutputParser(pydantic_object=MovieReview)
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个影评人。{format_instructions}"),
    ("human", "评价电影：{movie}"),
])
chain = prompt | llm | parser
result = chain.invoke({
    "movie": "盗梦空间",
    "format_instructions": parser.get_format_instructions(),
})
```

---

## 三、RAG (检索增强生成)

### 3.1 文档加载与切分

```python
from langchain_community.document_loaders import PyPDFLoader, TextLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 加载 PDF
loader = PyPDFLoader("document.pdf")
docs = loader.load()

# 加载目录
loader = DirectoryLoader("./docs", glob="**/*.md", loader_cls=TextLoader)
docs = loader.load()

# 切分文档
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", "。", "！", "？", ".", " ", ""],
)
chunks = splitter.split_documents(docs)
```

### 3.2 向量存储

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma, FAISS

embeddings = OpenAIEmbeddings()

# Chroma
vectorstore = Chroma.from_documents(
    documents=chunks,
    embedding=embeddings,
    persist_directory="./chroma_db",
)

# FAISS
vectorstore = FAISS.from_documents(chunks, embeddings)
vectorstore.save_local("./faiss_index")

# 加载已有索引
vectorstore = FAISS.load_local("./faiss_index", embeddings, allow_dangerous_deserialization=True)
```

### 3.3 检索器

```python
# 基本检索
results = vectorstore.similarity_search("查询内容", k=5)

# MMR 检索（最大边际相关性，减少重复）
results = vectorstore.max_marginal_relevance_search(
    "查询内容", k=5, fetch_k=20
)

# 作为检索器
retriever = vectorstore.as_retriever(
    search_type="mmr",
    search_kwargs={"k": 5, "fetch_k": 20},
)
```

### 3.4 完整 RAG 链

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableParallel

prompt = ChatPromptTemplate.from_messages([
    ("system", """根据以下上下文回答问题。如果上下文中没有相关信息，请说"我不知道"。

上下文：
{context}"""),
    ("human", "{question}"),
])

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    RunnableParallel({
        "context": retriever | format_docs,
        "question": RunnablePassthrough(),
    })
    | prompt
    | llm
    | StrOutputParser()
)

response = rag_chain.invoke("什么是 RAG？")
```

---

## 四、Memory (对话记忆)

### 4.1 对话缓冲记忆

```python
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.chat_history import InMemoryChatMessageHistory

store = {}

def get_session_history(session_id: str):
    if session_id not in store:
        store[session_id] = InMemoryChatMessageHistory()
    return store[session_id]

from langchain_core.runnables.history import RunnableWithMessageHistory

chain_with_history = RunnableWithMessageHistory(
    chain,
    get_session_history,
    input_messages_key="question",
    history_messages_key="history",
)

response = chain_with_history.invoke(
    {"question": "我叫小明"},
    config={"configurable": {"session_id": "user-1"}},
)

response = chain_with_history.invoke(
    {"question": "我叫什么名字？"},
    config={"configurable": {"session_id": "user-1"}},
)
# 回答：你叫小明
```

---

## 五、Agents (智能代理)

### 5.1 工具定义

```python
from langchain_core.tools import tool

@tool
def search_weather(city: str) -> str:
    """查询指定城市的天气"""
    # 实际实现调用天气 API
    return f"{city}：晴，25°C"

@tool
def calculate(expression: str) -> str:
    """计算数学表达式"""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"计算错误：{e}"

tools = [search_weather, calculate]
```

### 5.2 创建 Agent

```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_tool_calling_agent, AgentExecutor

llm = ChatOpenAI(model="gpt-4", temperature=0)

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个有帮助的助手，可以使用工具回答问题"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

response = agent_executor.invoke({"input": "北京天气如何？25+17等于多少？"})
```

---

## 六、RAG vs 微调

| 维度 | RAG | 微调 |
|------|-----|------|
| 知识更新 | 实时更新文档即可 | 需要重新训练 |
| 成本 | 较低 | 较高（GPU/数据） |
| 可解释性 | 强（可追溯来源） | 弱 |
| 幻觉 | 较少 | 可能增加 |
| 定制风格 | 有限 | 强 |
| 适用场景 | 知识问答、文档检索 | 特定领域、风格定制 |

---

## 七、最佳实践

1. **Chunk 大小**: 500-1500 字符，overlap 10-20%
2. **Embedding 模型**: 中文推荐 bge-m3 / GTE
3. **检索策略**: MMR > 纯相似度
4. **Prompt**: 明确约束，包含"不知道"选项
5. **评估**: 使用 RAGAS 评估准确性、相关性
