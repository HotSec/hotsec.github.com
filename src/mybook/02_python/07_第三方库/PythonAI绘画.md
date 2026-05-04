# AI 绘画

Python AI 绘画工具与框架汇总。

## Stable Diffusion WebUI

最流行的 Stable Diffusion 图形界面。

```bash
git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git
cd stable-diffusion-webui
./webui.sh
```

### 核心功能

- txt2img：文本生成图片
- img2img：图片到图片转换
- Inpainting：局部重绘
- ControlNet：精确控制生成内容
- LoRA / Textual Inversion：模型微调

## ComfyUI

基于节点的 Stable Diffusion 工作流界面。

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
python main.py
```

特点：可视化工作流、可复现、适合高级用户。

## Diffusers（HuggingFace）

```python
from diffusers import StableDiffusionPipeline
import torch

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16
)
pipe = pipe.to("cuda")

image = pipe("a cat wearing a hat").images[0]
image.save("cat.png")
```

## Midjourney API（第三方）

通过 Discord Bot 或第三方 API 调用 Midjourney。

## 关键概念

| 概念 | 说明 |
|------|------|
| Prompt | 正向提示词 |
| Negative Prompt | 反向提示词（排除内容） |
| CFG Scale | 提示词引导强度（7-12） |
| Steps | 采样步数（20-50） |
| Sampler | 采样器（Euler a / DPM++ 等） |
| Seed | 随机种子（-1 为随机） |
