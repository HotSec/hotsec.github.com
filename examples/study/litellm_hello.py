from openai import OpenAI

client = OpenAI(
    api_key="sk-bqrdwysbuovoccymerenqarfvionzabjsjuaimndssdcouyq",
    base_url="https://api.siliconflow.cn/v1"
)

response = client.chat.completions.create(
    model="Pro/zai-org/GLM-4.7",
    messages=[
        {"role": "system", "content": "你是一个有用的助手"},
        {"role": "user", "content": "你好，请介绍一下你自己"}
    ]
)
print(response.choices[0].message.content)