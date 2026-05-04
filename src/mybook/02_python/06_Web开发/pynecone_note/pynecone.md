# Pynecone

Pynecone（现更名为 Reflex）是一个纯 Python 的全栈 Web 框架，无需编写 JavaScript。

## 安装

```bash
pip install reflex
```

## 最小示例

```python
import reflex as rx

class State(rx.State):
    count: int = 0

    def increment(self):
        self.count += 1

def index():
    return rx.center(
        rx.vstack(
            rx.heading(f"Count: {State.count}"),
            rx.button("Increment", on_click=State.increment),
        )
    )

app = rx.App()
app.add_page(index)
```

## 核心概念

| 概念 | 说明 |
|------|------|
| State | 响应式状态管理，继承 `rx.State` |
| Component | UI 组件，纯 Python 函数 |
| Event Handler | 事件处理函数，修改 State |
| Var | 状态变量，自动触发 UI 更新 |

## 组件示例

```python
rx.container(
    rx.text("Hello", color="blue", font_size="2em"),
    rx.input(placeholder="Enter name"),
    rx.button("Submit", on_click=State.handle_submit),
    rx.foreach(State.items, lambda item: rx.text(item)),
)
```

## 部署

```bash
reflex init
reflex run          # 开发模式
reflex export       # 导出静态站点
```

## 参考

- 文档：https://pynecone.io/docs/library
- 示例：https://github.com/pynecone-io/pynecone-examples
- 入门：https://pynecone.io/docs/getting-started/introduction
