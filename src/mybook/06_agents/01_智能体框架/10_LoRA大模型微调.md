# LoRA 大模型微调

---

## 一、LoRA 概述

### 1.1 什么是 LoRA

**LoRA（Low-Rank Adaptation）** 是一种高效的大语言模型微调技术，由微软研究人员于 2021 年提出。其核心思想是在预训练模型的旁边添加低秩矩阵，通过训练这些低秩矩阵来适应下游任务，而无需更新原始模型的所有参数。

**核心优势**：
- **参数效率高**：只需训练约 0.1%-1% 的参数
- **显存占用低**：训练时只需加载原始模型的部分参数
- **训练速度快**：比全参数微调快 2-3 倍
- **可插拔**：多个LoRA模块可灵活切换
- **效果好**：在多个任务上媲美全参数微调

### 1.2 为什么需要 LoRA

| 问题 | 传统方案 | LoRA 方案 |
|------|---------|----------|
| **参数过多** | 全参数微调（70B 模型需要 140GB） | 仅训练低秩矩阵（几GB） |
| **成本高昂** | 需要多卡 A100 | 单卡即可微调 |
| **灾难遗忘** | 可能遗忘预训练知识 | 只更新少量参数，保留知识 |
| **部署困难** | 每个任务一个完整模型 | 多个 LoRA 共享基座模型 |
| **灵活性差** | 固定模型 | 可动态加载不同 LoRA |

---

## 二、LoRA 工作原理

### 2.1 核心思想

LoRA 的核心假设是：**预训练语言模型的权重矩阵通常是低秩的**。

在 Transformer 架构中，注意力机制的计算可以表示为：

```math
h = W_0 \cdot x
```

其中 $W_0 \in \mathbb{R}^{d \times d}$ 是预训练权重矩阵。

LoRA 添加一个低秩更新：

```math
h = W_0 \cdot x + \Delta W \cdot x = W_0 \cdot x + BA \cdot x
```

其中：
- $B \in \mathbb{R}^{d \times r}$ - 下降矩阵
- $A \in \mathbb{R}^{r \times d}$ - 上升矩阵
- $r \ll d$ - 低秩维度（通常 4-64）

### 2.2 LoRA 架构图

```
预训练模型（冻结）                    LoRA 模块（可训练）
┌─────────────────┐                ┌─────────────────┐
│                 │                │                 │
│    W_0          │                │   A (d×r)      │
│   (d×d)         │                │       ↓        │
│   冻结          │                │   B (d×r)      │
│                 │                │   可训练        │
│                 │                │                 │
└────────┬────────┘                └────────┬────────┘
         │                                  │
         │           输出                    │
         └─────────── + ────────────────────┘
                      ↓
              h = W_0·x + BA·x
```

### 2.3 参数效率分析

对于一个 70B 参数的模型：

| 方法 | 可训练参数 | 显存占用 | 训练时间 |
|------|-----------|---------|---------|
| 全参数微调 | 70B | ~140GB (FP16) | 1x |
| LoRA (r=8) | 8M | ~16GB | ~0.3x |
| LoRA (r=64) | 67M | ~18GB | ~0.4x |
| QLoRA (r=64) | 67M | ~6GB | ~0.5x |

---

## 三、LoRA 配置详解

### 3.1 核心参数

```python
from peft import LoraConfig, get_peft_model

config = LoraConfig(
    r=8,                          # 低秩维度，越大效果越好但参数量越多
    lora_alpha=16,                # 缩放因子，通常设置为 r 的 2 倍
    target_modules=["q_proj", "v_proj"],  # 应用 LoRA 的模块
    lora_dropout=0.05,           # Dropout 概率
    bias="none",                  # bias 处理方式：none/lora_only/all
    task_type="CAUSAL_LM",       # 任务类型
)
```

### 3.2 参数详解

| 参数 | 说明 | 推荐值 | 影响因素 |
|------|------|-------|---------|
| **r** | 低秩维度 | 4-64 | 越大效果越好，但参数量增加 |
| **lora_alpha** | 缩放因子 | 2*r | 控制 LoRA 权重的影响程度 |
| **lora_dropout** | Dropout | 0-0.1 | 防止过拟合 |
| **target_modules** | 目标模块 | q_proj, v_proj | 决定哪些层应用 LoRA |
| **bias** | 偏置处理 | none | all 会增加可训练参数 |

### 3.3 目标模块选择

| 模块 | 位置 | 效果 |
|------|------|------|
| **q_proj, v_proj** | Query, Value | 效果好，推荐首选 |
| **k_proj** | Key | 适中 |
| **o_proj** | Output | 可选 |
| **gate_proj, up_proj, down_proj** | FFN | 效果明显，但增加显存 |
| **all** | 所有线性层 | 效果最好，但参数最多 |

**推荐配置**：

```python
# 轻量级配置
target_modules = ["q_proj", "v_proj"]

# 中等配置
target_modules = ["q_proj", "k_proj", "v_proj", "o_proj"]

# 全面配置
target_modules = ["q_proj", "k_proj", "v_proj", "o_proj", 
                  "gate_proj", "up_proj", "down_proj"]
```

---

## 四、LoRA 变体

### 4.1 QLoRA

**QLoRA（Quantized LoRA）** 结合了量化技术和 LoRA，可以在 4-bit 量化模型上微调。

**核心特点**：
- 4-bit NormalFloat (NF4) 量化
- 分页优化器处理内存峰值
- 双重量化减少内存

```python
from peft import LoraConfig, get_gated_peft_model
from transformers import BitsAndBytesConfig

# 4-bit 量化配置
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,
)

# 加载量化模型
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-70b-hf",
    quantization_config=bnb_config,
)

# 应用 LoRA
config = LoraConfig(r=64, lora_alpha=128, target_modules="all")
model = get_peft_model(model, config)
```

### 4.2 AdaLoRA

**AdaLoRA** 自适应调整不同层的 LoRA 秩，重要层分配更高的秩。

**核心思想**：
- 动态分配秩资源
- 基于重要性评估
- 边际收益最大化

```python
from peft import AdaLoraConfig, get_peft_model

config = AdaLoraConfig(
    r=8,
    lora_alpha=16,
    target_modules="all",
    task_type="CAUSAL_LM",
    # AdaLoRA 特有参数
    target_r=8,
    beta1=0.85,
    beta2=0.85,
    tinit=200,
    tidalr=200,
    deltaT=5,
)
```

### 4.3 LoRA+ 

**LoRA+** 为 A 和 B 矩阵使用不同的学习率，提高收敛速度。

```python
config = LoraConfig(
    r=8,
    lora_alpha=16,
    # LoRA+ 特有
    loraplus_lr_ratio=16,  # B 矩阵学习率 = A 矩阵学习率 * ratio
)
```

### 4.4 DoRA

**DoRA（Weight-Decomposed LoRA）** 将权重分解为幅度和方向两部分，分别微调。

**核心优势**：
- 训练更稳定
- 参数量更少
- 效果更好

```python
config = LoRAConfig(
    r=8,
    lora_alpha=16,
    use_dora=True,  # 启用 DoRA
)
```

### 4.5 变体对比

| 变体 | 核心思想 | 显存优化 | 效果提升 | 适用场景 |
|------|---------|---------|---------|----------|
| **LoRA** | 低秩适配 | 中 | 基准 | 通用场景 |
| **QLoRA** | 4-bit 量化 | 高 (~60%) | 略有下降 | 大模型微调 |
| **AdaLoRA** | 自适应秩 | 中 | 明显提升 | 资源受限 |
| **LoRA+** | 差异化学习率 | 无 | 轻微提升 | 加速收敛 |
| **DoRA** | 权重分解 | 中 | 明显提升 | 高质量需求 |

---

## 五、LoRA 训练实战

### 5.1 环境准备

```bash
pip install transformers peft accelerate bitsandbytes
pip install -U datasets loralib
```

### 5.2 完整训练流程

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from datasets import load_dataset
from trl import SFTTrainer

# 1. 加载模型
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-2-7b-hf",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# 2. 准备训练
model = prepare_model_for_kbit_training(model)

# 3. 配置 LoRA
lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

# 4. 应用 LoRA
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()
# 输出：trainable params: 4,194,304 || all params: 6,738,415,616 || trainable%: 0.0622%

# 5. 加载数据集
dataset = load_dataset("yahma/alpaca-cleaned", split="train")

# 6. 配置训练器
training_args = TrainingArguments(
    output_dir="./lora-alpaca",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_ratio=0.03,
    lr_scheduler_type="cosine",
    logging_steps=10,
    save_steps=100,
    fp16=True,
)

# 7. 开始训练
trainer = SFTTrainer(
    model=model,
    train_dataset=dataset,
    args=training_args,
    dataset_text_field="text",
)

trainer.train()
```

### 5.3 合并权重

训练完成后，可以将 LoRA 权重合并到基座模型：

```python
# 方法1：合并为独立模型
merged_model = model.merge_and_unload()
merged_model.save_pretrained("./merged-model")

# 方法2：保存为单独的 adapter
model.save_pretrained("./lora-adapter")

# 方法3：量化后保存（用于部署）
from transformers import BitsAndBytesConfig

quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
)

quantized_model = AutoModelForCausalLM.from_pretrained(
    "./merged-model",
    quantization_config=quantization_config,
)
```

### 5.4 推理使用

```python
from peft import PeftModel, AutoPeftModelForCausalLM

# 加载 LoRA adapter
model = AutoPeftModelForCausalLM.from_pretrained(
    "./lora-adapter",
    torch_dtype=torch.bfloat16,
    device_map="auto",
)

# 推理
prompt = "### 指令:\n将以下文本翻译成英文\n\n### 输入:\n今天天气真好\n\n### 输出:"
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(**inputs, max_new_tokens=100)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

---

## 六、LoRA 在智能体开发中的应用

### 6.1 Agentic-RL 中的 LoRA

在 Agentic-RL（强化学习训练智能体）中，LoRA 用于高效微调：

```
Agentic-RL 训练流程：
1. SFT（有监督微调）
   └─ 使用 LoRA 高效微调基座模型
2. Reward Modeling（奖励建模）
   └─ 训练奖励模型
3. RL Training（强化学习）
   └─ 使用 PPO/GRPO 等算法
   └─ LoRA 参与策略优化
```

### 6.2 特定领域 Agent 微调

```python
# 旅行助手 LoRA 微调配置
travel_agent_config = LoraConfig(
    r=32,  # 领域复杂，需要更高的秩
    lora_alpha=64,
    target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM",
)

# 代码助手 LoRA 微调配置
code_agent_config = LoraConfig(
    r=16,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
```

### 6.3 多 Agent 场景下的 LoRA

| 场景 | LoRA 策略 | 说明 |
|------|----------|------|
| **单一领域** | 一个 LoRA | 简单高效 |
| **多领域切换** | 多个 LoRA | 共享基座，按需加载 |
| **渐进式学习** | 增量 LoRA | 逐步添加新能力 |
| **团队协作** | 角色 LoRA | 每个 Agent 角色一个 LoRA |

**多 LoRA 加载示例**：

```python
from peft import PeftModel

# 基础模型
base_model = AutoModelForCausalLM.from_pretrained("meta-llama/Llama-2-7b")

# 加载多个 LoRA
travel_lora = PeftModel.from_pretrained(base_model, "./travel-agent-lora")
code_lora = PeftModel.from_pretrained(base_model, "./code-agent-lora")

# 按需切换
def use_agent(agent_type: str, prompt: str):
    if agent_type == "travel":
        model = travel_lora
    elif agent_type == "code":
        model = code_lora
    else:
        model = base_model
    return model.generate(prompt)
```

---

## 七、LoRA 最佳实践

### 7.1 超参数选择

| 参数 | 小模型 (7B) | 中模型 (13B) | 大模型 (70B) |
|------|------------|-------------|-------------|
| **r** | 8-16 | 16-32 | 32-64 |
| **lora_alpha** | 2*r | 2*r | 2*r |
| **learning_rate** | 1e-3 ~ 3e-4 | 1e-4 ~ 3e-4 | 5e-5 ~ 1e-4 |
| **batch_size** | 4-8 | 2-4 | 1-2 |
| **epoch** | 3-5 | 3-5 | 2-3 |

### 7.2 数据准备

**高质量数据要点**：
- 数据量：1000-10000 条精选样本 > 100000 条低质样本
- 多样性：覆盖不同场景和任务类型
- 格式统一：遵循统一的指令模板
- 去重清洗：移除重复和低质量样本

**数据格式示例**：

```json
{
    "instruction": "将以下文本翻译成英文",
    "input": "今天天气真好",
    "output": "The weather is really nice today."
}
```

### 7.3 训练技巧

1. **预热 (Warmup)**
   ```python
   warmup_ratio=0.03  # 前 3% 的步数用于预热
   ```

2. **学习率调度**
   ```python
   lr_scheduler_type="cosine"  # 余弦退火效果好
   ```

3. **梯度累积**
   ```python
   gradient_accumulation_steps=4  # 模拟大 batch_size
   ```

4. **混合精度**
   ```python
   fp16=True  # 或 bf16=True (A100/H100)
   ```

### 7.4 常见问题与解决

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **训练不稳定** | 学习率过高 | 降低 LR，增加 warmup |
| **效果不明显** | r 值过低 / 数据质量差 | 增加 r 值，提升数据质量 |
| **显存不足** | 模型太大 | 使用 QLoRA 或更小的 batch_size |
| **过拟合** | 数据量少 / r 值过高 | 增加数据，增加 dropout |
| **推理慢** | LoRA 权重未合并 | 合并权重或优化推理 |

---

## 八、LoRA 与 Agent 开发结合案例

### 8.1 旅行助手微调

```python
# 1. 数据准备
travel_data = [
    {
        "instruction": "帮我查询北京的天气",
        "input": "",
        "output": "好的，让我为您查询北京今天的天气...\n\n【北京天气】\n温度：15-22°C\n天气：多云转晴\n穿衣建议：建议穿薄外套，早晚温差较大。"
    },
    # ... 更多数据
]

# 2. 训练配置
config = LoraConfig(
    r=32,
    lora_alpha=64,
    target_modules=["q_proj", "v_proj", "o_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)

# 3. 训练并合并
# ... 训练代码 ...
merged_model = model.merge_and_unload()
merged_model.save_pretrained("./travel-assistant")
```

### 8.2 Agent 工具调用微调

```python
# 专门微调 Agent 的工具调用能力
tool_calling_data = [
    {
        "instruction": "查询刘德华的妻子是谁？",
        "input": "",
        "output": "Thought: 我需要先搜索刘德华的基本信息，然后找到他的配偶信息。\nAction: search[\"刘德华 基本信息\"]\nObservation: 刘德华（Andy Lau），1961年出生于香港...\nThought: 搜索结果提到了朱丽倩，让我确认一下。\nAction: search[\"刘德华 妻子 朱丽倩\"]\nObservation: 刘德华的妻子是朱丽倩...\nFinal Answer: 刘德华的妻子是朱丽倩，两人于2008年结婚。"
    },
]
```

---

## 九、工具与框架

### 9.1 主流框架

| 框架 | 说明 | 特点 |
|------|------|------|
| **PEFT** | Hugging Face | 集成度高，支持多种 LoRA 变体 |
| **TRL** | Hugging Face | 专注 RLHF 和 SFT |
| **LLaMA-Factory** | 中文友好 | 一站式训练平台 |
| **Axolotl** | 灵活配置 | 支持多种训练方式 |
| **Ludwig** | 低代码 | 可视化配置 |

### 9.2 PEFT 常用 API

```python
from peft import (
    LoraConfig,           # LoRA 配置
    get_peft_model,       # 应用 LoRA
    prepare_model_for_kbit_training,  # 量化模型准备
    PeftModel,            # PeftModel 类
    TaskType,             # 任务类型枚举
)
```

---

## 十、总结

### 10.1 LoRA 核心要点

| 要点 | 说明 |
|------|------|
| **核心思想** | 低秩矩阵适配，冻结原模型权重 |
| **参数效率** | 仅训练 0.1%-1% 的参数 |
| **显存优化** | QLoRA 可在单卡微调 70B 模型 |
| **灵活性** | 多 LoRA 可切换，可插拔 |
| **效果** | 媲美全参数微调 |

### 10.2 适用场景

| 场景 | 推荐配置 |
|------|---------|
| 个人学习 | LoRA + r=8 |
| 产品级微调 | LoRA + r=16-32 |
| 大模型微调 | QLoRA + r=64 |
| 高质量需求 | DoRA + r=32-64 |
| 快速实验 | LoRA + r=4-8 |

### 10.3 学习路径

```
1. 理解 LoRA 原理 → 理解低秩适配思想
2. 掌握 PEFT 基本用法 → 学会配置和训练
3. 尝试不同变体 → QLoRA、AdaLoRA、DoRA
4. 实践完整项目 → 数据准备 → 训练 → 部署
5. 应用于 Agent 开发 → 领域特定 Agent 微调
```

---

## 参考资料

- [LoRA 原始论文](https://arxiv.org/abs/2106.09685)
- [PEFT 官方文档](https://huggingface.co/docs/peft)
- [QLoRA 论文](https://arxiv.org/abs/2305.14314)
- [LLaMA-Factory GitHub](https://github.com/hiyouga/LLaMA-Factory)
