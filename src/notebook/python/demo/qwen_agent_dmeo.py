import os
import json

from loguru import logger

from qwen_agent.agents import Assistant
from qwen_agent.utils.output_beautify import typewriter_print
from qwen_agent.tools.base import BaseTool, register_tool

@register_tool('my_image_gen')
class MyImageGen(BaseTool):
    description = 'AI 绘画服务，输入文本描述，返回图像 URL。'
    parameters = [{'name': 'prompt', 'type': 'string', 'description': '图像内容描述', 'required': True}]

    def call(self, params: str, **kwargs) -> str:
        prompt = json.loads(params)['prompt']
        return json.dumps({'image_url': f'https://image.pollinations.ai/prompt/{prompt}'}, ensure_ascii=False)




model_name = os.getenv("MODEL_NAME", "QwQ-32B-AWQ_G0")
MODEL_SERVER = os.getenv("MODEL_SERVER", "http://172.17.0.1:9998/v1")

llm_cfg = {
    "model": model_name,
    "model_server": MODEL_SERVER,  # api_base
    "api_key": "EMPTY",
    "generate_cfg": {"top_p": 0.8},
}

# 定义工具列表
tools = ['my_image_gen']

# 定义系统提示词
system_message = "你是一个助手，可以执行代码并回答用户问题。"

HistoryAssistantDict = {}


class HistoryAssistant(Assistant):
    def _postprocess_messages(self, messages):
        return messages[-20:]  # 保留最近5轮对话

bot = HistoryAssistant(llm=llm_cfg, system_message=system_message, function_list=tools)


# 运行智能体
while True:
    user_input = input("User: ")
    chat_id = input("Chat ID: ")
    if user_input.lower() == "exit":
        break
    if chat_id not in HistoryAssistantDict:
        HistoryAssistantDict[chat_id] = []
    messages = [{"role": "user", "content": user_input}]
    HistoryAssistantDict[chat_id].extend(messages)
    response_plain_text = ""
    responses = []
    for responses in bot.run(messages=HistoryAssistantDict[chat_id]):
        response_plain_text = typewriter_print(responses, response_plain_text)

    HistoryAssistantDict[chat_id].extend(responses)
