# LangChain

LangChain 是构建 LLM（大语言模型）应用的主流框架，提供链式调用、Agent、RAG 等核心能力。

## 安装

```bash
pip install langchain langchain-openai langchain-community
```

## 核心概念

| 概念 | 说明 |
|------|------|
| Model | LLM / ChatModel 抽象 |
| Prompt | 提示词模板管理 |
| Chain | 将多个组件串联为流水线 |
| Agent | LLM 自主决策调用工具 |
| Tool | Agent 可调用的外部工具 |
| Memory | 对话历史管理 |
| Retriever | 文档检索器（RAG 核心） |
| VectorStore | 向量数据库抽象 |

## 基本 Chain

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o")

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个{role}助手"),
    ("user", "{input}")
])

chain = prompt | llm | StrOutputParser()

result = chain.invoke({"role": "Python", "input": "解释装饰器"})
```

## RAG（检索增强生成）

```python
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

loader = TextLoader("docs.txt")
documents = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = text_splitter.split_documents(documents)

vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())
retriever = vectorstore.as_retriever()

from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

answer = rag_chain.invoke("什么是装饰器？")
```

## Agent

```python
from langchain.agents import create_openai_functions_agent, AgentExecutor
from langchain.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    return f"{city}：晴，25°C"

agent = create_openai_functions_agent(llm, [get_weather], prompt)
executor = AgentExecutor(agent=agent, tools=[get_weather])

result = executor.invoke({"input": "北京天气怎么样？"})
```

## Memory

```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory(return_messages=True)
memory.chat_memory.add_user_message("我叫张三")
memory.chat_memory.add_ai_message("你好张三！")

conversation = memory.load_memory_variables({})
```

## 生态

- **LangSmith**：调试、测试、监控 LLM 应用
- **LangServe**：将 Chain 部署为 REST API
- **LangGraph**：构建有状态的 Agent 工作流
