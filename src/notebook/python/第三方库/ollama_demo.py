import json
from typing import List

import ollama


class MyOllama(object):
    class ModelList:
        """
        Ollama模型列表
        """
        Qwen2_5_3b = "qwen2.5:3b"

    class Role:
        """
        由Ollama官方定义，用于区分消息是由哪个角色提供
        """
        User = "user"  # 用户信息，一般指用户提问
        System = "system"  # 系统信息，一般用于设定场景
        Assistant = "assistant"  # 系统回答

    def __init__(self, host: str, port: int, temperature=0, history_size: int = 5 * 1024 * 1024):
        """
        初始化一个客户端
        :param host:
        :param port:
        :param temperature: 情感度，默认为0
        :param history_size: 历史会话大小，默认为5MB
        """
        self.history_size = history_size
        self.temperature = temperature
        self.client = ollama.Client(host=f"http://{host}:{port}")
        self.content: List[dict] = []

    def single_conversation(self, model: str, content: str):
        """
        单次会话
        :param model: 调用模型，由OllamaList提供
        :param content: 会话内容
        :return:
        """
        try:
            res = self.client.chat(model=model, messages=[{"role": MyOllama.Role.User, "content": content}],
                                   options={"temperature": self.temperature})

            return res["message"]["content"]

        except Exception as e:
            raise Exception(e)

    def long_conversation(self, model: str, content: str):
        """
        长会话
        :param model: 调用模型，由OllamaList提供
        :param content: 会话内容
        :return:
        """
        input_message = {"role": MyOllama.Role.User, "content": content}

        self.content.append(input_message)

        # 更新历史记录大小
        while MyOllama.get_history_size(self.content) > self.history_size:
            self.content.pop(0)  # 移除最早的消息

        try:
            res = self.client.chat(model=model, messages=self.content, options={"temperature": self.temperature})
            message = res["message"]["content"]
            self.content.append({"role": "assistant", "content": message})

            return message

        except Exception as e:
            raise Exception(e)

    @staticmethod
    def get_history_size(history):
        """历史记录的大小（字节）"""
        return sum(len(json.dumps(message).encode('utf-8')) for message in history)




host = "127.0.0.1"
port = 11434

my_ollama = MyOllama(host, port, temperature=100)

if __name__ == '__main__':
    while True:
        in_put = input("请输入：")
        if in_put == "":
            continue

        message = my_ollama.single_conversation(MyOllama.ModelList.Qwen2_5_3b, content=in_put)
        print(message)
        
        