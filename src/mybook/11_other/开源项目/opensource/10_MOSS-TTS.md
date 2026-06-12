# MOSS-TTS - 复旦开源语音合成模型家族

> 来源：GitHub + 公众号文章整理（2026年6月）

## 项目概览

**MOSS-TTS** 是由复旦大学 NLP 实验室 + MOSI.AI 团队（OpenMOSS）开源的语音合成模型家族，2026年4月发布后迅速登顶 Hugging Face 文本转语音榜第一，热度突破 2 万+。

**GitHub**：
- 主项目：https://github.com/OpenMOSS/MOSS-TTS
- Nano 版：https://github.com/OpenMOSS/MOSS-TTS-Nano
- 在线 Demo：https://openmoss.github.io/MOSS-TTS-Nano-Demo/

**开源协议**：Apache-2.0，完全开源可商用

---

## 模型家族

| 子项目 | 参数量 | 定位 | 显存需求 |
|--------|--------|------|----------|
| **MOSS-TTS-v1.5** | 8B | 高质量语音生成 | ~16GB |
| **MOSS-TTS-Local** | 1.7B | 声音复刻日常使用 | ~6GB |
| **MOSS-TTS-Nano** | 0.1B | 实时对话/嵌入式 | 无特殊要求 |

---

## 核心功能

### 1. 文本转语音（TTS）
- 输入文字，输出自然人声
- 支持 **31 种语言**（中英文效果最佳）
- 输出 48kHz 立体声 WAV

### 2. 零样本声音复刻
- 仅需 **3 秒参考音频** 即可学习音色
- 无需训练，无需标注数据
- 配合 RVC 模型使用，音色相似度超越 IndexTTS2

### 3. 声音设计（Voice Design）
- 自然语言描述生成声音
- 示例：「温暖的中年女声，语速稍慢，带播音腔」

### 4. 多人对话生成
- 支持多角色对话脚本
- 自动分配不同音色

### 5. 显式停顿控制
- 使用 `[pause X.Ys]` 标签精准控制停顿时长
- 解决长文本语气飘移问题

---

## MOSS-TTS-Nano 详细规格

### 技术参数

| 特性 | 说明 |
|------|------|
| **参数量** | 0.1B（一亿参数） |
| **模型大小** | 压缩后不到 300MB |
| **部署环境** | 纯 CPU 运行，无需 GPU |
| **硬件要求** | 4 核 CPU 服务器即可实时运行 |
| **语言支持** | 20 种语言（中英文最好） |
| **输出格式** | 48kHz 立体声 WAV |
| **推理方式** | 流式输出，边生成边播放 |
| **加速方案** | ONNX 加速（效率提升 2 倍） |

### 架构设计

```
MOSS-TTS-Nano 内部架构
├── Audio Tokenizer    # 音频分词器
└── LLM                # 语言模型（自回归生成）
```

### 支持的子项目

| 子项目 | 说明 |
|--------|------|
| **MOSS-TTS-Nano** | 超轻量版 |
| **MOSS-TTS-Local** | 本地日常使用版 |
| **MOSS-SoundEffect** | 声音效果生成 |
| **MOSS-TTS-v1.5** | 旗舰版（即将发布） |

---

## 快速上手

### 环境安装

```bash
conda create -n moss-tts-nano python=3.12 -y
conda activate moss-tts-nano
git clone https://github.com/OpenMOSS/MOSS-TTS-Nano.git
cd MOSS-TTS-Nano
pip install -r requirements.txt
pip install -e .
```

### 语音克隆（推荐）

```bash
python infer.py \
  --prompt-audio-path assets/audio/zh_1.wav \
  --text "欢迎使用 MOSS-TTS-Nano 语音克隆功能。"
```

### CLI 命令行

```bash
# 一行命令生成语音
moss-tts-nano generate \
  --prompt-speech assets/audio/zh_1.wav \
  --text "欢迎使用 MOSS-TTS-Nano 命令行工具。"

# 启动 Web 服务
moss-tts-nano serve
```

### ONNX CPU 推理（推荐，无需 PyTorch）

```bash
python infer_onnx.py \
  --prompt-audio-path assets/audio/zh_1.wav \
  --text "Welcome to the ONNX Runtime CPU demo."
```

> **提示**：ONNX 版本推理效率接近原始版本的 2 倍，且无需安装 PyTorch

---

## 适用场景

### 场景一：AI 播客 / 语音内容生成
- AI 播客自动化配音
- 有声书 / 新闻播报生成
- 多语言语音内容本地化

### 场景二：语音助手 / 对话系统
- 智能音箱 / 车载语音助手
- 客服机器人语音回复
- 教育类语音交互应用

### 场景三：跨语言语音应用
- 跨境电商多语言语音介绍
- 语言学习 APP 发音示范
- 国际化产品语音功能

### 场景四：嵌入式 / 移动端
- Android ONNX Runtime 示例已提供
- 可在手机端运行

---

## 用户群体

| 群体 | 适用原因 |
|------|----------|
| **AI 播客创作者** | 低成本高质量配音，支持语音克隆 |
| **语音应用开发者** | CPU 可部署，降低服务器成本 |
| **中小团队** | 一个模型搞定多语言 TTS |
| **教育行业** | 语音教学、听力材料自动生成 |
| **嵌入式开发者** | Nano 版可嵌入移动端 |

---

## 与竞品对比

| 维度 | MOSS-TTS-Nano | 其他主流 TTS |
|------|----------------|--------------|
| **参数量** | 0.1B | 几B~几十B |
| **GPU 需求** | 不需要 | 通常需要 |
| **部署难度** | 简单 | 复杂 |
| **开源** | 完全开源 | 部分开源 |
| **商业授权** | Apache-2.0 | 各不相同 |

**核心差异**：MOSS-TTS-Nano 是"**部署优先**"设计，不是和旗舰版比音质，而是在"能跑的设备上尽快跑出足够好的效果"。

---

## 技术亮点

1. **CPU 可部署**：0.1B 参数，4 核 CPU 即可实时运行
2. **实时流式输出**：边生成边播放，延迟极低
3. **零样本克隆**：3 秒录音直接使用，无需训练
4. **多语言支持**：31 种语言，中英文最佳
5. **ONNX 加速**：推理效率提升 2 倍
6. **完全开源**：Apache-2.0，可自由使用和商用

---

## 实测局限性

1. **音质限制**：比不上旗舰版 MOSS-TTS (8B) 和 CosyVoice
2. **情感表现**：0.1B 模型情感表现力有限
3. **参考音频质量**：克隆效果依赖参考音频质量
4. **小语种**：中英文效果最好，小语种仍在优化

---

## 行业影响

> 过去只有大机构才能用到的高精度语音克隆技术，现在普通创作者用普通家用电脑就能搞定。技术门槛的拆除，从来都是行业生态重构的起点。

### 三个版本如何选

| 需求 | 推荐版本 |
|------|----------|
| 追求最高质量 | MOSS-TTS-v1.5 (8B) |
| 个人声音复刻日常使用 | MOSS-TTS-Local (1.7B) |
| 低成本实时对话嵌入式 | MOSS-TTS-Nano (0.1B) |

---

## 相关资源

| 资源 | 链接 |
|------|------|
| **GitHub 主项目** | https://github.com/OpenMOSS/MOSS-TTS |
| **GitHub Nano** | https://github.com/OpenMOSS/MOSS-TTS-Nano |
| **在线 Demo** | https://openmoss.github.io/MOSS-TTS-Nano-Demo/ |
| **Hugging Face** | Hugging Face TTS 榜单第一 |
| **开源协议** | Apache-2.0 |
