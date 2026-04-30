# LiteLLM 
LiteLLM 是一个 Python 库，由 BerriAI 开发，专门用于简化调用多种大语言模型（LLM）的接口。它的核心思想是统一调用接口，让开发者可以用相同的方式访问不同的 LLM 提供商。

## 功能特性
1. 统一 API 接口
支持调用多种 LLM 提供商，包括：
OpenAI (GPT-3.5, GPT-4 等)
Azure OpenAI
Anthropic (Claude)
Huggingface
Replicate
等等
2. 模型路由 (Router)
LiteLLM Router 是核心功能之一，支持：
在多个模型之间自动切换
负载均衡 - 将请求分发到不同的模型实例
故障转移 - 当一个模型失败时自动切换到备用模型
配置多个相同的模型实现高可用
3. 异步支持
支持异步调用 (agenerate)
适合高并发场景
4. 流式输出 (Streaming)
支持流式响应
可配合 LangChain 的 CallbackManager 实现实时输出
5. 与 LangChain 集成
提供 ChatLiteLLM 和 ChatLiteLLMRouter 类
无缝集成到 LangChain 生态系统中

```python
from langchain_community.chat_models import ChatLiteLLM
from langchain_core.messages import HumanMessage

# 初始化（与调用 OpenAI 相同的方式）
chat = ChatLiteLLM(model="gpt-3.5-turbo")

# 调用模型
messages = [HumanMessage(content="Translate this to French: I love programming")]
response = chat(messages)
```

使用 Router 进行负载均衡：

```python
from litellm import Router

model_list = [
    {
        "model_name": "gpt-4",
        "litellm_params": {
            "model": "azure/gpt-4-1106-preview",
            "api_key": "<your-api-key>",
            "api_base": "https://<your-endpoint>.openai.azure.com/"
        }
    },
    # 可以添加多个模型配置...
]

router = Router(model_list=model_list)
```

适用场景
多提供商切换：需要灵活切换不同 LLM 提供商的项目
负载均衡：高并发应用需要分配请求到多个模型实例
故障恢复：需要高可用性的 AI 应用
统一接口：希望用统一代码调用多种 LLM 的开发者