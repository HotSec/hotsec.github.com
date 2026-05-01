# CrewAI 框架教程

## 概述

CrewAI 是基于角色的多智能体框架，通过定义 Agent 角色和 Task 任务来组织智能体协作。

```bash
pip install crewai
```

## 核心概念

### Agent → Task → Crew

```
Agent (角色) → Task (任务) → Crew (团队)
     ↓              ↓
  Tools (工具)   Process (流程)
```

## 基础用法

### 定义 Agent

```python
from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="Senior Research Analyst",
    goal="Uncover cutting-edge developments in AI and data science",
    backstory="""You are a senior research analyst at a leading tech think tank.
You excel at identifying emerging trends, analyzing complex data,
and presenting insights in a clear and actionable manner.""",
    verbose=True,
    allow_delegation=False,
    llm="gpt-4o",
)

writer = Agent(
    role="Tech Content Strategist",
    goal="Craft compelling content on tech advancements",
    backstory="""You are a renowned content strategist specializing in technology.
You transform complex concepts into engaging, accessible narratives
that resonate with both technical and non-technical audiences.""",
    verbose=True,
    allow_delegation=True,
    llm="gpt-4o",
)

editor = Agent(
    role="Editor-in-Chief",
    goal="Ensure content quality, accuracy, and consistency",
    backstory="""You are the editor-in-chief of a major tech publication.
You have an eye for detail and ensure every piece meets the
highest standards of quality and clarity.""",
    verbose=True,
    allow_delegation=False,
    llm="gpt-4o",
)
```

### 定义 Task

```python
research_task = Task(
    description="""Conduct a comprehensive analysis of the latest advancements in {topic}.
Identify key trends, breakthrough technologies, and potential industry impacts.
Focus on factual, data-driven insights.""",
    expected_output="A detailed analysis report with key findings and data points",
    agent=researcher,
)

writing_task = Task(
    description="""Using the research findings, write an engaging and informative article
about {topic}. The article should be well-structured, include concrete examples,
and be accessible to a broad audience.""",
    expected_output="A polished article in markdown format, 1000-1500 words",
    agent=writer,
)

editing_task = Task(
    description="""Review and refine the article for:
1. Factual accuracy and technical correctness
2. Clarity and readability
3. Consistent tone and style
4. Proper citations and references
Provide the final polished version.""",
    expected_output="A final, publication-ready article in markdown format",
    agent=editor,
)
```

### 组建 Crew

```python
crew = Crew(
    agents=[researcher, writer, editor],
    tasks=[research_task, writing_task, editing_task],
    process=Process.sequential,
    verbose=True,
)

result = crew.kickoff(inputs={"topic": "Large Language Models in Production"})
print(result)
```

***

## 工具集成

### 内置工具

```python
from crewai_tools import (
    SerperDevTool,
    ScrapeWebsiteTool,
    FileReadTool,
    DirectoryReadTool,
)

search_tool = SerperDevTool()
scrape_tool = ScrapeWebsiteTool()
file_read_tool = FileReadTool()
```

### 自定义工具

```python
from crewai_tools import tool

@tool("Database Query Tool")
def query_database(sql: str) -> str:
    """Execute a SQL query and return results."""
    import sqlite3
    conn = sqlite3.connect("app.db")
    cursor = conn.execute(sql)
    rows = cursor.fetchall()
    conn.close()
    return str(rows)

@tool("Calculator Tool")
def calculate(expression: str) -> float:
    """Evaluate a mathematical expression safely."""
    import ast
    import operator
    ops = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
    }
    node = ast.parse(expression, mode='eval')
    def _eval(n):
        if isinstance(n, ast.Num):
            return n.n
        if isinstance(n, ast.BinOp):
            return ops[type(n.op)](_eval(n.left), _eval(n.right))
        raise ValueError(f"Unsupported: {type(n)}")
    return _eval(node.body)

researcher = Agent(
    role="Data Analyst",
    goal="Analyze data and extract insights",
    backstory="You are an expert data analyst.",
    tools=[query_database, calculate],
    verbose=True,
)
```

### LangChain 工具

```python
from crewai_tools import tool
from langchain_community.tools import DuckDuckGoSearchRun

search = DuckDuckGoSearchRun()

@tool("Web Search")
def web_search(query: str) -> str:
    """Search the web for information."""
    return search.run(query)
```

***

## 流程模式

### Sequential（顺序执行）

```python
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process=Process.sequential,
)
```

### Hierarchical（层级执行）

```python
crew = Crew(
    agents=[agent1, agent2, agent3],
    tasks=[task1, task2, task3],
    process=Process.hierarchical,
    manager_llm="gpt-4o",
    manager_agent=None,
)
```

层级模式下，Manager Agent 负责任务分配和协调。

***

## 高级特性

### 记忆

```python
from crewai.memory import ShortTermMemory, LongTermMemory

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    memory=True,
    short_term_memory=ShortTermMemory(),
)
```

### 回调

```python
def task_callback(task_output):
    print(f"Task completed: {task_output.description}")
    print(f"Result: {task_output.result[:100]}...")

def step_callback(step_output):
    print(f"Step: {step_output.agent} - {step_output.text[:50]}...")

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    task_callback=task_callback,
    step_callback=step_callback,
)
```

### 输出格式

```python
from crewai import Task
from pydantic import BaseModel

class ArticleOutput(BaseModel):
    title: str
    content: str
    tags: list[str]
    word_count: int

writing_task = Task(
    description="Write an article about {topic}",
    expected_output="A structured article",
    agent=writer,
    output_pydantic=ArticleOutput,
)

result = crew.kickoff(inputs={"topic": "AI Agents"})
print(result.pydantic.title)
print(result.pydantic.tags)
```

### 人类输入

```python
review_task = Task(
    description="Review the article and provide feedback",
    expected_output="Feedback and approval",
    agent=editor,
    human_input=True,
)
```

***

## 最佳实践

1. **角色清晰**：每个 Agent 的 role/goal/backstory 要明确且不重叠
2. **任务具体**：Task 的 description 和 expected_output 要详细
3. **工具匹配**：根据 Agent 角色分配合适的工具
4. **流程选择**：简单任务用 sequential，复杂任务用 hierarchical
5. **迭代优化**：根据输出质量调整 Agent 配置
6. **成本控制**：简单任务用小模型，复杂推理用大模型
