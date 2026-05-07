# AutoGen 框架教程

## 概述

AutoGen 是微软开发的多智能体对话框架，支持构建基于 LLM 的多智能体协作系统。

```bash
pip install autogen-agentpy
```

## 核心概念

### Agent 类型

| 类型 | 描述 |
|------|------|
| AssistantAgent | 基于 LLM 的助手，可编写/执行代码 |
| UserProxyAgent | 代理用户，可执行代码、提供输入 |
| GroupChat | 多智能体群聊管理器 |

### 基础对话

```python
import autogen

config_list = [
    {"model": "gpt-4o", "api_key": "your-api-key"}
]

llm_config = {
    "config_list": config_list,
    "temperature": 0,
}

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config=llm_config,
)

user_proxy = autogen.UserProxyAgent(
    name="user",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=3,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,
    },
)

user_proxy.initiate_chat(
    assistant,
    message="Write a Python function to calculate fibonacci numbers using memoization",
)
```

***

## 多智能体协作

### 双智能体协作

```python
coder = autogen.AssistantAgent(
    name="coder",
    system_message="""You are a Python developer.
Write clean, efficient code. Include type hints and docstrings.""",
    llm_config=llm_config,
)

reviewer = autogen.AssistantAgent(
    name="reviewer",
    system_message="""You are a code reviewer.
Review code for correctness, style, and performance.
Provide specific improvement suggestions.""",
    llm_config=llm_config,
)

user = autogen.UserProxyAgent(
    name="user",
    human_input_mode="NEVER",
    code_execution_config={"work_dir": "coding"},
)

user.initiate_chat(
    coder,
    message="Implement a thread-safe LRU cache in Python",
)
```

### Group Chat

```python
planner = autogen.AssistantAgent(
    name="planner",
    system_message="""You are a task planner.
Break down tasks into clear steps.
Assign each step to the most appropriate agent.""",
    llm_config=llm_config,
)

coder = autogen.AssistantAgent(
    name="coder",
    system_message="""You are a Python developer.
Write code based on the plan.""",
    llm_config=llm_config,
)

tester = autogen.AssistantAgent(
    name="tester",
    system_message="""You are a QA engineer.
Write test cases and verify code correctness.""",
    llm_config=llm_config,
)

groupchat = autogen.GroupChat(
    agents=[planner, coder, tester, user_proxy],
    messages=[],
    max_round=15,
    speaker_selection_method="auto",
)

manager = autogen.GroupChatManager(
    groupchat=groupchat,
    llm_config=llm_config,
)

user_proxy.initiate_chat(
    manager,
    message="Build a REST API for a todo app with FastAPI, including CRUD operations and tests",
)
```

### 自定义 Speaker 选择

```python
def speaker_selection(last_speaker, groupchat):
    messages = groupchat.messages
    last_msg = messages[-1]["content"]

    if last_speaker == planner:
        return coder
    elif last_speaker == coder:
        return tester
    elif last_speaker == tester:
        if "all tests passed" in last_msg.lower():
            return None
        return coder
    return planner

groupchat = autogen.GroupChat(
    agents=[planner, coder, tester, user_proxy],
    messages=[],
    max_round=20,
    speaker_selection_method=speaker_selection,
)
```

***

## 工具使用

### 注册函数工具

```python
from autogen import register_function

def search_web(query: str) -> str:
    return f"Search results for: {query}"

def calculate(expression: str) -> float:
    return eval(expression)

def read_file(path: str) -> str:
    with open(path) as f:
        return f.read()

register_function(
    search_web,
    caller=assistant,
    executor=user_proxy,
    name="search_web",
    description="Search the web for information",
)

register_function(
    calculate,
    caller=assistant,
    executor=user_proxy,
    name="calculate",
    description="Evaluate a mathematical expression",
)

assistant = autogen.AssistantAgent(
    name="assistant",
    llm_config={
        "config_list": config_list,
        "functions": [
            {
                "name": "search_web",
                "description": "Search the web for information",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Search query"}
                    },
                    "required": ["query"],
                },
            }
        ],
    },
)
```

***

## 高级模式

### 嵌套对话

```python
engineer = autogen.AssistantAgent(
    name="engineer",
    system_message="You are a senior engineer. Solve technical problems.",
    llm_config=llm_config,
)

manager = autogen.AssistantAgent(
    name="manager",
    system_message="You are a project manager. Coordinate tasks.",
    llm_config=llm_config,
)

def engineer_reply(recipient, messages, sender, config):
    last_msg = messages[-1]["content"]
    response = engineer.generate_reply(messages=[{"role": "user", "content": last_msg}])
    return True, response

manager.register_reply(
    [autogen.Agent, None],
    engineer_reply,
)
```

### 代码执行

```python
user_proxy = autogen.UserProxyAgent(
    name="user",
    human_input_mode="NEVER",
    code_execution_config={
        "work_dir": "workspace",
        "use_docker": "python:3.12-slim",
        "timeout": 120,
    },
    system_message="""Execute code and report results.
If code fails, report the error message.""",
)
```

### 缓存与日志

```python
from autogen import Cache

with Cache.disk(cache_seed=42) as cache:
    user_proxy.initiate_chat(
        assistant,
        message="Analyze this dataset",
        cache=cache,
    )
```

***

## 最佳实践

1. **明确角色**：每个 Agent 的 system_message 要清晰定义职责
2. **限制轮次**：设置 max_round 防止无限循环
3. **人工介入**：关键决策点设置 human_input_mode="ALWAYS"
4. **安全执行**：使用 Docker 容器执行代码
5. **错误处理**：Agent 应能处理代码执行失败并重试
6. **成本控制**：使用较便宜的模型做简单任务，昂贵模型做复杂推理
