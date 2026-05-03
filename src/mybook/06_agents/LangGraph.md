# LangGraph 框架教程

## 概述

LangGraph 是 LangChain 团队开发的有状态多角色应用框架，基于图（Graph）结构定义 Agent 工作流，支持循环、分支、持久化。

```bash
pip install langgraph
```

## 核心概念

### State Graph

```
Node (函数) → Edge (条件/固定) → Node
     ↓
State (共享状态)
```

- **State**：在节点间传递的共享数据
- **Node**：处理状态的函数
- **Edge**：节点间的连接（固定或条件）
- **Conditional Edge**：根据状态决定下一步

## 基础用法

### 简单图

```python
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
import operator

class State(TypedDict):
    messages: Annotated[list, operator.add]
    next_agent: str

def researcher(state: State) -> State:
    return {
        "messages": [{"role": "researcher", "content": "Research findings..."}],
        "next_agent": "writer",
    }

def writer(state: State) -> State:
    return {
        "messages": [{"role": "writer", "content": "Draft article..."}],
        "next_agent": "reviewer",
    }

def reviewer(state: State) -> State:
    return {
        "messages": [{"role": "reviewer", "content": "Approved!"}],
        "next_agent": "end",
    }

graph = StateGraph(State)

graph.add_node("researcher", researcher)
graph.add_node("writer", writer)
graph.add_node("reviewer", reviewer)

graph.add_edge(START, "researcher")
graph.add_edge("researcher", "writer")
graph.add_edge("writer", "reviewer")
graph.add_edge("reviewer", END)

app = graph.compile()

result = app.invoke({"messages": [], "next_agent": ""})
print(result)
```

### 条件边

```python
from typing import Literal

def router(state: State) -> Literal["researcher", "writer", "end"]:
    if state["next_agent"] == "research":
        return "researcher"
    elif state["next_agent"] == "write":
        return "writer"
    return "end"

graph = StateGraph(State)

graph.add_node("supervisor", supervisor)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)

graph.add_edge(START, "supervisor")
graph.add_conditional_edges("supervisor", router)
graph.add_edge("researcher", "supervisor")
graph.add_edge("writer", "supervisor")

app = graph.compile()
```

***

## ReAct Agent

```python
from langgraph.prebuilt import create_react_agent
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool

@tool
def search_web(query: str) -> str:
    """Search the web for information."""
    return f"Results for: {query}"

@tool
def calculate(expression: str) -> float:
    """Calculate a mathematical expression."""
    return eval(expression)

@tool
def read_file(path: str) -> str:
    """Read a file from disk."""
    with open(path) as f:
        return f.read()

model = ChatOpenAI(model="gpt-4o")

agent = create_react_agent(
    model,
    tools=[search_web, calculate, read_file],
)

result = agent.invoke({
    "messages": [{"role": "user", "content": "What is 2^10 + sqrt(144)?"}]
})

for msg in result["messages"]:
    print(f"{msg.type}: {msg.content}")
```

***

## 多 Agent 协作

### Supervisor 模式

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(model="gpt-4o")

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

def supervisor(state: AgentState) -> AgentState:
    response = model.invoke(
        f"""Given the conversation, decide which agent should act next.
Choices: researcher, coder, end
Conversation: {state['messages']}
Reply with just the agent name."""
    )
    return {"next": response.content.strip().lower()}

def researcher(state: AgentState) -> AgentState:
    response = model.invoke(
        f"You are a researcher. Based on: {state['messages']}, provide research findings."
    )
    return {"messages": [{"role": "researcher", "content": response.content}]}

def coder(state: AgentState) -> AgentState:
    response = model.invoke(
        f"You are a coder. Based on: {state['messages']}, write code."
    )
    return {"messages": [{"role": "coder", "content": response.content}]}

def route_agent(state: AgentState) -> str:
    return state["next"]

graph = StateGraph(AgentState)

graph.add_node("supervisor", supervisor)
graph.add_node("researcher", researcher)
graph.add_node("coder", coder)

graph.add_edge(START, "supervisor")
graph.add_conditional_edges("supervisor", route_agent)
graph.add_edge("researcher", "supervisor")
graph.add_edge("coder", "supervisor")

app = graph.compile()
```

### Swarm 模式

```python
def transfer_to_researcher(state):
    return {"next": "researcher"}

def transfer_to_coder(state):
    return {"next": "coder"}

def researcher_handoff(state):
    return {"next": "coder"}

def coder_handoff(state):
    return {"next": "end"}

graph = StateGraph(AgentState)

graph.add_node("researcher", researcher_node)
graph.add_node("coder", coder_node)

graph.add_conditional_edges("researcher", researcher_handoff)
graph.add_conditional_edges("coder", coder_handoff)

graph.add_edge(START, "researcher")
```

***

## 持久化

### Checkpoint

```python
from langgraph.checkpoint.memory import MemorySaver

checkpointer = MemorySaver()

app = graph.compile(checkpointer=checkpointer)

config = {"configurable": {"thread_id": "thread-1"}}

result1 = app.invoke(
    {"messages": [{"role": "user", "content": "Hello!"}]},
    config=config,
)

result2 = app.invoke(
    {"messages": [{"role": "user", "content": "What did I say before?"}]},
    config=config,
)
```

### SQLite 持久化

```python
from langgraph.checkpoint.sqlite import SqliteSaver

with SqliteSaver.from_conn_string("checkpoints.db") as checkpointer:
    app = graph.compile(checkpointer=checkpointer)
    result = app.invoke(input_data, config={"configurable": {"thread_id": "1"}})
```

***

## 人机交互

### 断点

```python
from langgraph.checkpoint.memory import MemorySaver

graph = StateGraph(State)
graph.add_node("step1", step1)
graph.add_node("human_review", human_review_node)
graph.add_node("step2", step2)

graph.add_edge(START, "step1")
graph.add_edge("step1", "human_review")
graph.add_edge("human_review", "step2")
graph.add_edge("step2", END)

checkpointer = MemorySaver()
app = graph.compile(
    checkpointer=checkpointer,
    interrupt_before=["human_review"],
)

config = {"configurable": {"thread_id": "1"}}
result = app.invoke(input_data, config=config)

state = app.get_state(config)
print("Waiting for review:", state.values)

app.update_state(config, {"approved": True}, as_node="human_review")
result = app.invoke(None, config=config)
```

***

## 流式输出

```python
for event in app.stream(
    {"messages": [{"role": "user", "content": "Write a poem"}]},
    stream_mode="values",
):
    if "messages" in event:
        for msg in event["messages"]:
            print(msg.get("content", ""))

for event in app.stream(input_data, stream_mode="updates"):
    for node, values in event.items():
        print(f"Node {node}: {values}")
```

***

## 最佳实践

1. **状态设计**：State 尽量精简，避免传递大量数据
2. **节点职责**：每个 Node 做一件事，保持简单
3. **条件边**：用条件边实现分支逻辑，避免在 Node 内部做流程控制
4. **持久化**：长时间运行的图必须使用 Checkpointer
5. **人机交互**：关键决策点使用 interrupt_before 暂停
6. **错误处理**：Node 内部捕获异常，通过状态传递错误信息
